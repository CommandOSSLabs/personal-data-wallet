/**
 * PermissionService - OAuth-style access control management
 *
 * Manages permissions for cross-app data access, including:
 * - OAuth-style consent requests and grants
 * - Permission validation and enforcement
 * - On-chain access control integration
 * - Permission auditing and revocation
 */
import { randomUUID } from 'crypto';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { CrossContextPermissionService } from '../services/CrossContextPermissionService';
/**
 * PermissionService handles OAuth-style access control
 */
export class PermissionService {
    constructor(config) {
        this.pendingConsents = new Map();
        this.suiClient = config.suiClient;
        this.packageId = config.packageId;
        this.apiUrl = config.apiUrl || 'http://localhost:3001/api';
        this.contextWalletService = config.contextWalletService;
        this.consentRepository = config.consentRepository;
        if (!config.accessRegistryId) {
            throw new Error('PermissionService requires accessRegistryId for wallet-based permissions');
        }
        this.crossContextPermissions =
            config.crossContextPermissionService ??
                new CrossContextPermissionService({
                    packageId: this.packageId,
                    accessRegistryId: config.accessRegistryId,
                }, this.suiClient);
    }
    /**
     * Request user consent for accessing data
     * @param options - Consent request options
     * @returns Created consent request
     */
    async requestConsent(options) {
        const requesterWallet = normalizeSuiAddress(options.requesterWallet);
        const targetWallet = normalizeSuiAddress(options.targetWallet);
        const now = Date.now();
        const requestId = randomUUID();
        const consentRequest = {
            requesterWallet,
            targetWallet,
            targetScopes: options.scopes,
            purpose: options.purpose,
            expiresAt: options.expiresIn ? now + options.expiresIn : undefined,
            requestId,
            createdAt: now,
            updatedAt: now,
            status: 'pending',
        };
        await this.persistConsentRequest(consentRequest);
        // TODO: Send consent request to backend for UI presentation
        // For now, return the persisted record so callers can track status locally
        return consentRequest;
    }
    /**
     * Grant permissions to an app (user approval)
     * @param userAddress - User granting permissions
     * @param options - Grant options
     * @returns Created access grant
     */
    async grantPermissions(userAddress, options) {
        const requestingWallet = normalizeSuiAddress(options.requestingWallet);
        const targetWallet = normalizeSuiAddress(options.targetWallet);
        if (this.contextWalletService) {
            const ownsContext = await this.contextWalletService.validateAccess(targetWallet, userAddress);
            if (!ownsContext) {
                throw new Error('User does not own the specified target wallet');
            }
        }
        let lastDigest;
        if (options.signer) {
            for (const scope of options.scopes) {
                const accessLevel = scope.startsWith('write:') ? 'write' : 'read';
                lastDigest = await this.crossContextPermissions.grantWalletAllowlistAccess({
                    requestingWallet,
                    targetWallet,
                    scope,
                    accessLevel,
                    expiresAt: options.expiresAt ?? 0,
                }, options.signer);
            }
        }
        const permissions = await this.crossContextPermissions.queryWalletPermissions({
            requestingWallet,
            targetWallet,
        });
        const grantFromChain = this.buildGrantFromPermissions(requestingWallet, targetWallet, permissions);
        const now = Date.now();
        let grant = grantFromChain ?? {
            id: `grant_${requestingWallet}_${targetWallet}_${now}`,
            requestingWallet,
            targetWallet,
            scopes: options.scopes,
            expiresAt: options.expiresAt,
            grantedAt: now,
        };
        if (lastDigest) {
            grant = {
                ...grant,
                transactionDigest: lastDigest,
            };
        }
        await this.updateConsentStatus({
            requesterWallet: requestingWallet,
            targetWallet,
            newStatus: 'approved',
            updatedAt: now,
        });
        return grant;
    }
    /**
     * Revoke permissions from an app
     * @param userAddress - User revoking permissions
     * @param options - Revoke options
     * @returns Success status
     */
    async revokePermissions(userAddress, options) {
        const requestingWallet = normalizeSuiAddress(options.requestingWallet);
        const targetWallet = normalizeSuiAddress(options.targetWallet);
        if (this.contextWalletService) {
            const ownsContext = await this.contextWalletService.validateAccess(targetWallet, userAddress);
            if (!ownsContext) {
                throw new Error('User does not own the specified target wallet');
            }
        }
        if (options.signer) {
            await this.crossContextPermissions.revokeWalletAllowlistAccess({
                requestingWallet,
                targetWallet,
                scope: options.scope,
            }, options.signer);
        }
        return true;
    }
    /**
     * Determine if a requesting wallet currently has permission to access a target wallet
     */
    async hasWalletPermission(requestingWallet, targetWallet, scope) {
        return await this.crossContextPermissions.hasWalletPermission({
            requestingWallet: normalizeSuiAddress(requestingWallet),
            targetWallet: normalizeSuiAddress(targetWallet),
            scope,
        });
    }
    /**
     * Legacy compatibility method for app-scoped permission checks
     * Interprets appId as requesting wallet address.
     */
    async checkPermission(appId, scope, userAddressOrTargetWallet) {
        return await this.hasWalletPermission(appId, userAddressOrTargetWallet, scope);
    }
    /**
     * Get all access grants by a user
     * @param userAddress - User address
     * @returns Array of access grants
     */
    async getGrantsByUser(userAddress) {
        const normalized = normalizeSuiAddress(userAddress);
        const permissions = await this.crossContextPermissions.listGrantsByTarget(normalized);
        return this.convertPermissionsToGrants(permissions);
    }
    /**
     * List all consent requests for a user
     * @param userAddress - User address
     * @returns Array of pending consent requests
     */
    async getPendingConsents(userAddress) {
        const normalized = normalizeSuiAddress(userAddress);
        if (this.consentRepository) {
            return await this.consentRepository.listByTarget(normalized, 'pending');
        }
        return Array.from(this.pendingConsents.values())
            .filter((request) => request.targetWallet === normalized && request.status === 'pending')
            .map((request) => ({ ...request }));
    }
    /**
     * Approve a consent request
     * @param userAddress - User approving the request
     * @param consentRequest - Consent request to approve
     * @param contextId - Context ID to grant access to
     * @returns Created access grant
     */
    async approveConsent(userAddress, consentRequest, _contextId) {
        const grant = await this.grantPermissions(userAddress, {
            requestingWallet: consentRequest.requesterWallet,
            targetWallet: consentRequest.targetWallet,
            scopes: consentRequest.targetScopes,
            expiresAt: consentRequest.expiresAt
        });
        const updatedAt = Date.now();
        if (consentRequest.requestId) {
            await this.updateConsentStatus({
                requesterWallet: consentRequest.requesterWallet,
                targetWallet: consentRequest.targetWallet,
                newStatus: 'approved',
                updatedAt,
                requestId: consentRequest.requestId,
            });
        }
        return grant;
    }
    /**
     * Deny a consent request
     * @param userAddress - User denying the request
     * @param consentRequest - Consent request to deny
     * @returns Success status
     */
    async denyConsent(userAddress, consentRequest) {
        const now = Date.now();
        if (consentRequest.requestId) {
            await this.updateConsentStatus({
                requesterWallet: consentRequest.requesterWallet,
                targetWallet: consentRequest.targetWallet,
                newStatus: 'denied',
                updatedAt: now,
                requestId: consentRequest.requestId,
            });
        }
        else {
            const inferredRequestId = randomUUID();
            await this.persistConsentRequest({
                ...consentRequest,
                requestId: inferredRequestId,
                createdAt: now,
                updatedAt: now,
                status: 'denied',
            });
        }
        return true;
    }
    /**
     * Get permission audit log for a user
     * @param userAddress - User address
     * @returns Array of permission events
     */
    async getPermissionAudit(userAddress) {
        const normalized = normalizeSuiAddress(userAddress);
        const auditEntries = [];
        const consentRecords = this.consentRepository
            ? await this.consentRepository.listByTarget(normalized)
            : Array.from(this.pendingConsents.values()).filter((request) => request.targetWallet === normalized);
        for (const request of consentRecords) {
            auditEntries.push({
                timestamp: request.createdAt,
                action: 'request',
                requestingWallet: request.requesterWallet,
                targetWallet: request.targetWallet,
                scopes: request.targetScopes,
            });
            if (request.status === 'denied') {
                auditEntries.push({
                    timestamp: request.updatedAt,
                    action: 'deny',
                    requestingWallet: request.requesterWallet,
                    targetWallet: request.targetWallet,
                    scopes: request.targetScopes,
                });
            }
        }
        const history = await this.crossContextPermissions.getWalletAllowlistHistory({
            targetWallet: normalized,
        });
        for (const event of history) {
            auditEntries.push({
                timestamp: event.timestamp,
                action: event.action,
                requestingWallet: event.requestingWallet,
                targetWallet: event.targetWallet,
                scopes: [this.toPermissionScope(event.scope)],
            });
        }
        return auditEntries.sort((a, b) => a.timestamp - b.timestamp);
    }
    /**
     * Validate OAuth-style permission for SEAL access control
     * @param walletOwner - Owner of the wallet
     * @param appId - Application requesting access
     * @param requestedScope - Required permission scope
     * @returns True if permission is valid
     */
    async validateOAuthPermission(walletOwner, appId, requestedScope) {
        // This integrates with our existing SEAL access control
        return await this.hasWalletPermission(appId, walletOwner, requestedScope);
    }
    /**
     * Build seal_approve transaction for a requesting wallet
     */
    createApprovalTransaction(contentId, requestingWallet) {
        return this.crossContextPermissions.buildSealApproveTransaction(contentId, normalizeSuiAddress(requestingWallet));
    }
    /**
     * Get permission statistics for a user
     * @param userAddress - User address
     * @returns Permission usage statistics
     */
    async getPermissionStats(userAddress) {
        const grants = await this.getGrantsByUser(userAddress);
        const now = Date.now();
        const activeGrants = grants.filter((g) => !g.expiresAt || g.expiresAt > now);
        const uniqueApps = new Set(grants.map((g) => g.requestingWallet));
        const uniqueScopes = new Set(grants.flatMap((g) => g.scopes));
        const recentActivity = grants.length > 0 ? Math.max(...grants.map((g) => g.expiresAt || 0)) : 0;
        return {
            totalGrants: grants.length,
            activeGrants: activeGrants.length,
            totalApps: uniqueApps.size,
            totalScopes: uniqueScopes.size,
            recentActivity
        };
    }
    /**
     * Clean up expired permissions
     * @param userAddress - User address
     * @returns Number of permissions cleaned up
     */
    async cleanupExpiredPermissions(userAddress) {
        const now = Date.now();
        const grants = await this.getGrantsByUser(userAddress);
        return grants.filter((grant) => {
            if (!grant.expiresAt || grant.expiresAt === 0) {
                return false;
            }
            return grant.expiresAt <= now;
        }).length;
    }
    buildGrantFromPermissions(requestingWallet, targetWallet, permissions) {
        const grants = this.convertPermissionsToGrants(permissions);
        return grants.find((candidate) => candidate.requestingWallet === requestingWallet &&
            candidate.targetWallet === targetWallet);
    }
    convertPermissionsToGrants(permissions) {
        const grouped = new Map();
        for (const permission of permissions) {
            const key = `${permission.requestingWallet}-${permission.targetWallet}`;
            const existing = grouped.get(key);
            if (existing) {
                existing.push(permission);
            }
            else {
                grouped.set(key, [permission]);
            }
        }
        const grants = [];
        for (const entries of grouped.values()) {
            if (entries.length === 0) {
                continue;
            }
            const [first] = entries;
            const scopes = new Set();
            let earliestGrantedAt = entries[0].grantedAt;
            let expiresAtCandidate = 0;
            for (const entry of entries) {
                scopes.add(this.toPermissionScope(entry.scope));
                if (entry.grantedAt < earliestGrantedAt) {
                    earliestGrantedAt = entry.grantedAt;
                }
                if (entry.expiresAt > expiresAtCandidate) {
                    expiresAtCandidate = entry.expiresAt;
                }
            }
            const grant = {
                id: `grant_${first.requestingWallet}_${first.targetWallet}_${earliestGrantedAt}`,
                requestingWallet: first.requestingWallet,
                targetWallet: first.targetWallet,
                scopes: Array.from(scopes),
                grantedAt: earliestGrantedAt,
            };
            if (expiresAtCandidate > 0) {
                grant.expiresAt = expiresAtCandidate;
            }
            grants.push(grant);
        }
        return grants;
    }
    toPermissionScope(scope) {
        return scope;
    }
    async persistConsentRequest(record) {
        if (this.consentRepository) {
            await this.consentRepository.save(record);
        }
        else {
            this.pendingConsents.set(record.requestId, { ...record });
        }
    }
    /**
     * Swap the consent persistence backend at runtime.
     * Useful for applications that want to wire a custom repository after
     * the service has been constructed (e.g., demos supplying a filesystem store).
     */
    setConsentRepository(repository) {
        this.consentRepository = repository;
    }
    async updateConsentStatus(params) {
        const normalizedRequester = normalizeSuiAddress(params.requesterWallet);
        const normalizedTarget = normalizeSuiAddress(params.targetWallet);
        if (this.consentRepository) {
            if (params.requestId) {
                await this.consentRepository.updateStatus(params.requestId, params.newStatus, params.updatedAt);
            }
            else {
                const pendingRecords = await this.consentRepository.listByTarget(normalizedTarget, 'pending');
                await Promise.all(pendingRecords
                    .filter((record) => record.requesterWallet === normalizedRequester)
                    .map((record) => this.consentRepository.updateStatus(record.requestId, params.newStatus, params.updatedAt)));
            }
        }
        for (const [requestId, record] of this.pendingConsents.entries()) {
            if (record.requesterWallet === normalizedRequester && record.targetWallet === normalizedTarget) {
                const updatedRecord = {
                    ...record,
                    status: params.newStatus,
                    updatedAt: params.updatedAt,
                };
                this.pendingConsents.set(requestId, updatedRecord);
            }
        }
    }
}
//# sourceMappingURL=PermissionService.js.map