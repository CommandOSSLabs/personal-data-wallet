/**
 * PermissionService - OAuth-style access control management
 *
 * Manages permissions for cross-app data access, including:
 * - OAuth-style consent requests and grants
 * - Permission validation and enforcement
 * - On-chain access control integration
 * - Permission auditing and revocation
 */
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import type { Signer } from '@mysten/sui/cryptography';
import { ConsentRequest, ConsentRequestRecord, AccessGrant, PermissionScope, RequestConsentOptions, GrantPermissionsOptions, RevokePermissionsOptions } from '../types/wallet.js';
import { ContextWalletService } from '../wallet/ContextWalletService.js';
import { CrossContextPermissionService } from '../services/CrossContextPermissionService';
import type { ConsentRepository } from '../permissions/ConsentRepository.js';
/**
 * Configuration for PermissionService
 */
export interface PermissionServiceConfig {
    /** Sui client instance */
    suiClient: SuiClient;
    /** Package ID for Move contracts */
    packageId: string;
    /** Access registry ID for wallet allowlists */
    accessRegistryId: string;
    /** API URL for backend consent UI */
    apiUrl?: string;
    /** ContextWalletService for validation */
    contextWalletService?: ContextWalletService;
    /** Optional injected cross-context permission service */
    crossContextPermissionService?: CrossContextPermissionService;
    /** Optional repository for consent persistence */
    consentRepository?: ConsentRepository;
}
/**
 * PermissionService handles OAuth-style access control
 */
export declare class PermissionService {
    private suiClient;
    private packageId;
    private apiUrl;
    private contextWalletService?;
    private crossContextPermissions;
    private pendingConsents;
    private consentRepository?;
    constructor(config: PermissionServiceConfig);
    /**
     * Request user consent for accessing data
     * @param options - Consent request options
     * @returns Created consent request
     */
    requestConsent(options: RequestConsentOptions): Promise<ConsentRequestRecord>;
    /**
     * Grant permissions to an app (user approval)
     * @param userAddress - User granting permissions
     * @param options - Grant options
     * @returns Created access grant
     */
    grantPermissions(userAddress: string, options: GrantPermissionsOptions & {
        signer?: Signer;
    }): Promise<AccessGrant>;
    /**
     * Revoke permissions from an app
     * @param userAddress - User revoking permissions
     * @param options - Revoke options
     * @returns Success status
     */
    revokePermissions(userAddress: string, options: RevokePermissionsOptions & {
        signer?: Signer;
    }): Promise<boolean>;
    /**
     * Determine if a requesting wallet currently has permission to access a target wallet
     */
    hasWalletPermission(requestingWallet: string, targetWallet: string, scope: PermissionScope): Promise<boolean>;
    /**
     * Legacy compatibility method for app-scoped permission checks
     * Interprets appId as requesting wallet address.
     */
    checkPermission(appId: string, scope: PermissionScope, userAddressOrTargetWallet: string): Promise<boolean>;
    /**
     * Get all access grants by a user
     * @param userAddress - User address
     * @returns Array of access grants
     */
    getGrantsByUser(userAddress: string): Promise<AccessGrant[]>;
    /**
     * List all consent requests for a user
     * @param userAddress - User address
     * @returns Array of pending consent requests
     */
    getPendingConsents(userAddress: string): Promise<ConsentRequest[]>;
    /**
     * Approve a consent request
     * @param userAddress - User approving the request
     * @param consentRequest - Consent request to approve
     * @param contextId - Context ID to grant access to
     * @returns Created access grant
     */
    approveConsent(userAddress: string, consentRequest: ConsentRequest, _contextId: string): Promise<AccessGrant>;
    /**
     * Deny a consent request
     * @param userAddress - User denying the request
     * @param consentRequest - Consent request to deny
     * @returns Success status
     */
    denyConsent(userAddress: string, consentRequest: ConsentRequest): Promise<boolean>;
    /**
     * Get permission audit log for a user
     * @param userAddress - User address
     * @returns Array of permission events
     */
    getPermissionAudit(userAddress: string): Promise<Array<{
        timestamp: number;
        action: 'grant' | 'revoke' | 'request' | 'deny';
        requestingWallet: string;
        targetWallet: string;
        scopes: PermissionScope[];
    }>>;
    /**
     * Validate OAuth-style permission for SEAL access control
     * @param walletOwner - Owner of the wallet
     * @param appId - Application requesting access
     * @param requestedScope - Required permission scope
     * @returns True if permission is valid
     */
    validateOAuthPermission(walletOwner: string, appId: string, requestedScope: string): Promise<boolean>;
    /**
     * Build seal_approve transaction for a requesting wallet
     */
    createApprovalTransaction(contentId: Uint8Array, requestingWallet: string): Transaction;
    /**
     * Get permission statistics for a user
     * @param userAddress - User address
     * @returns Permission usage statistics
     */
    getPermissionStats(userAddress: string): Promise<{
        totalGrants: number;
        activeGrants: number;
        totalApps: number;
        totalScopes: number;
        recentActivity: number;
    }>;
    /**
     * Clean up expired permissions
     * @param userAddress - User address
     * @returns Number of permissions cleaned up
     */
    cleanupExpiredPermissions(userAddress: string): Promise<number>;
    private buildGrantFromPermissions;
    private convertPermissionsToGrants;
    private toPermissionScope;
    private persistConsentRequest;
    private updateConsentStatus;
}
//# sourceMappingURL=PermissionService.d.ts.map