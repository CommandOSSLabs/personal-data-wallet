"use strict";
/**
 * PermissionService - OAuth-style access control management
 *
 * Manages permissions for cross-app data access, including:
 * - OAuth-style consent requests and grants
 * - Permission validation and enforcement
 * - On-chain access control integration
 * - Permission auditing and revocation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
const transactions_1 = require("@mysten/sui/transactions");
/**
 * PermissionService handles OAuth-style access control
 */
class PermissionService {
    constructor(config) {
        this.suiClient = config.suiClient;
        this.packageId = config.packageId;
        this.apiUrl = config.apiUrl || 'http://localhost:3001/api';
        this.contextWalletService = config.contextWalletService;
    }
    /**
     * Request user consent for accessing data
     * @param options - Consent request options
     * @returns Created consent request
     */
    async requestConsent(options) {
        const consentRequest = {
            requesterAppId: options.appId,
            targetScopes: options.scopes,
            purpose: options.purpose,
            expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined
        };
        // TODO: Send consent request to backend for UI presentation
        // For now, just return the request object
        return consentRequest;
    }
    /**
     * Grant permissions to an app (user approval)
     * @param userAddress - User granting permissions
     * @param options - Grant options
     * @returns Created access grant
     */
    async grantPermissions(userAddress, options) {
        // Validate context exists and user owns it
        if (this.contextWalletService) {
            const hasAccess = await this.contextWalletService.validateAccess(options.contextId, userAddress);
            if (!hasAccess) {
                throw new Error('User does not own the specified context');
            }
        }
        // Create access grant
        const grant = {
            id: `grant_${Date.now()}`,
            contextId: options.contextId,
            granteeAppId: options.recipientAppId,
            scopes: options.scopes,
            expiresAt: options.expiresAt
        };
        // TODO: Record grant on-chain using seal_access_control contract
        // TODO: Store policy blob in Walrus for quick lookups
        return grant;
    }
    /**
     * Revoke permissions from an app
     * @param userAddress - User revoking permissions
     * @param options - Revoke options
     * @returns Success status
     */
    async revokePermissions(userAddress, options) {
        // TODO: Remove grant from on-chain registry
        // TODO: Invalidate cached policy blob in Walrus
        return true;
    }
    /**
     * Check if an app has specific permission
     * @param appId - Application ID
     * @param scope - Permission scope to check
     * @param userAddress - User address for permission validation
     * @returns True if app has permission
     */
    async checkPermission(appId, scope, userAddress) {
        // Get all grants for this app and user
        const grants = await this.getGrantsForApp(appId, userAddress);
        // Check if any non-expired grant includes the required scope
        const now = Date.now();
        for (const grant of grants) {
            if (grant.expiresAt && grant.expiresAt < now) {
                continue; // Grant expired
            }
            if (grant.scopes.includes(scope)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Get all access grants for an app
     * @param appId - Application ID
     * @param userAddress - User address
     * @returns Array of access grants
     */
    async getGrantsForApp(appId, userAddress) {
        // TODO: Query on-chain access registry
        // For now, return empty array
        return [];
    }
    /**
     * Get all access grants by a user
     * @param userAddress - User address
     * @returns Array of access grants
     */
    async getGrantsByUser(userAddress) {
        // TODO: Query on-chain access registry by user
        // For now, return empty array
        return [];
    }
    /**
     * List all consent requests for a user
     * @param userAddress - User address
     * @returns Array of pending consent requests
     */
    async getPendingConsents(userAddress) {
        // TODO: Query backend API for pending consents
        // For now, return empty array
        return [];
    }
    /**
     * Approve a consent request
     * @param userAddress - User approving the request
     * @param consentRequest - Consent request to approve
     * @param contextId - Context ID to grant access to
     * @returns Created access grant
     */
    async approveConsent(userAddress, consentRequest, contextId) {
        return await this.grantPermissions(userAddress, {
            contextId,
            recipientAppId: consentRequest.requesterAppId,
            scopes: consentRequest.targetScopes,
            expiresAt: consentRequest.expiresAt
        });
    }
    /**
     * Deny a consent request
     * @param userAddress - User denying the request
     * @param consentRequest - Consent request to deny
     * @returns Success status
     */
    async denyConsent(userAddress, consentRequest) {
        // TODO: Mark consent as denied in backend
        // For now, just return success
        return true;
    }
    /**
     * Get permission audit log for a user
     * @param userAddress - User address
     * @returns Array of permission events
     */
    async getPermissionAudit(userAddress) {
        // TODO: Query audit events from blockchain and backend
        // For now, return empty array
        return [];
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
        return await this.checkPermission(appId, requestedScope, walletOwner);
    }
    /**
     * Create on-chain approval transaction for SEAL
     * @param userAddress - User creating the approval
     * @param appId - Application to approve
     * @param scopes - Permission scopes to approve
     * @returns Transaction for approval
     */
    createApprovalTransaction(userAddress, appId, scopes) {
        const tx = new transactions_1.Transaction();
        // Call seal_access_control contract to grant approval
        tx.moveCall({
            target: `${this.packageId}::seal_access_control::seal_approve`,
            arguments: [
                tx.pure.address(userAddress),
                tx.pure.address(appId),
                tx.pure.string(scopes.join(','))
            ]
        });
        return tx;
    }
    /**
     * Get permission statistics for a user
     * @param userAddress - User address
     * @returns Permission usage statistics
     */
    async getPermissionStats(userAddress) {
        const grants = await this.getGrantsByUser(userAddress);
        const now = Date.now();
        const activeGrants = grants.filter(g => !g.expiresAt || g.expiresAt > now);
        const uniqueApps = new Set(grants.map(g => g.granteeAppId));
        const uniqueScopes = new Set(grants.flatMap(g => g.scopes));
        const recentActivity = grants.length > 0
            ? Math.max(...grants.map(g => g.expiresAt || 0))
            : 0;
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
        // TODO: Implement cleanup of expired grants from on-chain registry
        // For now, return 0
        return 0;
    }
}
exports.PermissionService = PermissionService;
//# sourceMappingURL=PermissionService.js.map