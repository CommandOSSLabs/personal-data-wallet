/**
 * Cross-Context Permission Service
 *
 * Manages cross-context access permissions for the Personal Data Wallet.
 * Enables apps to request and manage access to data from other app contexts.
 */
import { Transaction } from '@mysten/sui/transactions';
import type { SuiClient } from '@mysten/sui/client';
import type { Signer } from '@mysten/sui/cryptography';
export interface CrossContextPermissionConfig {
    packageId: string;
    accessRegistryId: string;
}
export interface GrantCrossContextAccessOptions {
    requestingAppId: string;
    sourceContextId: string;
    accessLevel: 'read' | 'write';
    expiresAt: number;
}
export interface RevokeCrossContextAccessOptions {
    requestingAppId: string;
    sourceContextId: string;
}
export interface RegisterContextOptions {
    contextId: string;
    appId: string;
}
export interface CheckCrossContextAccessOptions {
    requestingAppId: string;
    sourceContextId: string;
}
export interface CrossContextPermission {
    requestingAppId: string;
    sourceContextId: string;
    accessLevel: string;
    grantedAt: number;
    expiresAt: number;
    grantedBy: string;
}
/**
 * Service for managing cross-context permissions
 */
export declare class CrossContextPermissionService {
    private packageId;
    private accessRegistryId;
    private client;
    constructor(config: CrossContextPermissionConfig, client: SuiClient);
    /**
     * Register a new context wallet for an app
     *
     * @param options - Context registration options
     * @param signer - Transaction signer
     * @returns Transaction digest
     */
    registerContext(options: RegisterContextOptions, signer: Signer): Promise<string>;
    /**
     * Build transaction to register a context wallet
     *
     * @param options - Context registration options
     * @returns Transaction object
     */
    buildRegisterContextTransaction(options: RegisterContextOptions): Transaction;
    /**
     * Grant cross-context access permission
     *
     * @param options - Permission grant options
     * @param signer - Transaction signer
     * @returns Transaction digest
     */
    grantCrossContextAccess(options: GrantCrossContextAccessOptions, signer: Signer): Promise<string>;
    /**
     * Build transaction to grant cross-context access
     *
     * @param options - Permission grant options
     * @returns Transaction object
     */
    buildGrantCrossContextAccessTransaction(options: GrantCrossContextAccessOptions): Transaction;
    /**
     * Revoke cross-context access permission
     *
     * @param options - Permission revocation options
     * @param signer - Transaction signer
     * @returns Transaction digest
     */
    revokeCrossContextAccess(options: RevokeCrossContextAccessOptions, signer: Signer): Promise<string>;
    /**
     * Build transaction to revoke cross-context access
     *
     * @param options - Permission revocation options
     * @returns Transaction object
     */
    buildRevokeCrossContextAccessTransaction(options: RevokeCrossContextAccessOptions): Transaction;
    /**
     * Build seal_approve transaction with app_id parameter
     *
     * @param contentId - Content identifier (SEAL key ID bytes)
     * @param requestingAppId - App requesting decryption
     * @returns Transaction object
     */
    buildSealApproveTransaction(contentId: Uint8Array, requestingAppId: string): Transaction;
    /**
     * Query cross-context permissions for an app
     *
     * Note: This requires querying events or implementing a view function
     * For now, returns events filtered by app
     *
     * @param requestingAppId - App to query permissions for
     * @param sourceContextId - Optional context to filter by
     * @returns List of permissions
     */
    queryPermissions(requestingAppId: string, sourceContextId?: string): Promise<CrossContextPermission[]>;
    /**
     * Check if an app has permission to access a context
     *
     * @param options - Check permission options
     * @returns True if permission exists and is not expired
     */
    hasPermission(options: CheckCrossContextAccessOptions): Promise<boolean>;
    /**
     * Get all contexts that an app has access to
     *
     * @param requestingAppId - App to query
     * @returns List of accessible context IDs
     */
    getAccessibleContexts(requestingAppId: string): Promise<string[]>;
}
//# sourceMappingURL=CrossContextPermissionService.d.ts.map