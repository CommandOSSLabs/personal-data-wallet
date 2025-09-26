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
import { ConsentRequest, AccessGrant, PermissionScope, RequestConsentOptions, GrantPermissionsOptions, RevokePermissionsOptions } from '../types/wallet.js';
import { ContextWalletService } from '../wallet/ContextWalletService.js';
/**
 * Configuration for PermissionService
 */
export interface PermissionServiceConfig {
    /** Sui client instance */
    suiClient: SuiClient;
    /** Package ID for Move contracts */
    packageId: string;
    /** API URL for backend consent UI */
    apiUrl?: string;
    /** ContextWalletService for validation */
    contextWalletService?: ContextWalletService;
}
/**
 * PermissionService handles OAuth-style access control
 */
export declare class PermissionService {
    private suiClient;
    private packageId;
    private apiUrl;
    private contextWalletService?;
    constructor(config: PermissionServiceConfig);
    /**
     * Request user consent for accessing data
     * @param options - Consent request options
     * @returns Created consent request
     */
    requestConsent(options: RequestConsentOptions): Promise<ConsentRequest>;
    /**
     * Grant permissions to an app (user approval)
     * @param userAddress - User granting permissions
     * @param options - Grant options
     * @returns Created access grant
     */
    grantPermissions(userAddress: string, options: GrantPermissionsOptions): Promise<AccessGrant>;
    /**
     * Revoke permissions from an app
     * @param userAddress - User revoking permissions
     * @param options - Revoke options
     * @returns Success status
     */
    revokePermissions(userAddress: string, options: RevokePermissionsOptions): Promise<boolean>;
    /**
     * Check if an app has specific permission
     * @param appId - Application ID
     * @param scope - Permission scope to check
     * @param userAddress - User address for permission validation
     * @returns True if app has permission
     */
    checkPermission(appId: string, scope: PermissionScope, userAddress: string): Promise<boolean>;
    /**
     * Get all access grants for an app
     * @param appId - Application ID
     * @param userAddress - User address
     * @returns Array of access grants
     */
    getGrantsForApp(appId: string, userAddress: string): Promise<AccessGrant[]>;
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
    approveConsent(userAddress: string, consentRequest: ConsentRequest, contextId: string): Promise<AccessGrant>;
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
        appId: string;
        scopes: PermissionScope[];
        contextId?: string;
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
     * Create on-chain approval transaction for SEAL
     * @param userAddress - User creating the approval
     * @param appId - Application to approve
     * @param scopes - Permission scopes to approve
     * @returns Transaction for approval
     */
    createApprovalTransaction(userAddress: string, appId: string, scopes: PermissionScope[]): Transaction;
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
}
//# sourceMappingURL=PermissionService.d.ts.map