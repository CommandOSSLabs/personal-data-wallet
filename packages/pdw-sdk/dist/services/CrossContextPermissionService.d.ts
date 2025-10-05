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
export interface RegisterContextWalletOptions {
    contextWallet: string;
    derivationIndex: number;
    appHint?: string;
}
export interface GrantWalletAllowlistOptions {
    requestingWallet: string;
    targetWallet: string;
    scope?: string;
    accessLevel: 'read' | 'write';
    expiresAt: number;
}
export interface RevokeWalletAllowlistOptions {
    requestingWallet: string;
    targetWallet: string;
    scope?: string;
}
export interface WalletAllowlistPermission {
    requestingWallet: string;
    targetWallet: string;
    scope: string;
    accessLevel: string;
    grantedAt: number;
    expiresAt: number;
    grantedBy: string;
}
export interface WalletAllowlistHistoryEvent {
    timestamp: number;
    action: 'grant' | 'revoke';
    requestingWallet: string;
    targetWallet: string;
    scope: string;
    accessLevel: string;
    expiresAt: number;
    grantedBy: string;
}
export interface WalletAllowlistHistoryFilter {
    requestingWallet?: string;
    targetWallet?: string;
}
export interface CheckWalletAccessOptions {
    requestingWallet: string;
    targetWallet?: string;
    scope?: string;
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
    registerContextWallet(options: RegisterContextWalletOptions, signer: Signer): Promise<string>;
    /**
     * Build transaction to register a context wallet
     *
     * @param options - Context registration options
     * @returns Transaction object
     */
    buildRegisterContextWalletTransaction(options: RegisterContextWalletOptions): Transaction;
    /**
     * Grant cross-context access permission
     *
     * @param options - Permission grant options
     * @param signer - Transaction signer
     * @returns Transaction digest
     */
    grantWalletAllowlistAccess(options: GrantWalletAllowlistOptions, signer: Signer): Promise<string>;
    /**
     * Build transaction to grant cross-context access
     *
     * @param options - Permission grant options
     * @returns Transaction object
     */
    buildGrantWalletAllowlistTransaction(options: GrantWalletAllowlistOptions): Transaction;
    /**
     * Revoke cross-context access permission
     *
     * @param options - Permission revocation options
     * @param signer - Transaction signer
     * @returns Transaction digest
     */
    revokeWalletAllowlistAccess(options: RevokeWalletAllowlistOptions, signer: Signer): Promise<string>;
    /**
     * Build transaction to revoke cross-context access
     *
     * @param options - Permission revocation options
     * @returns Transaction object
     */
    buildRevokeWalletAllowlistTransaction(options: RevokeWalletAllowlistOptions): Transaction;
    /**
     * Build seal_approve transaction for a requesting wallet address
     *
     * @param contentId - Content identifier (SEAL key ID bytes)
     * @param requestingWallet - Wallet requesting decryption
     * @returns Transaction object
     */
    buildSealApproveTransaction(contentId: Uint8Array, requestingWallet: string): Transaction;
    /**
     * Query wallet allowlist permissions filtered by requester, target, or scope
     */
    queryWalletPermissions(options: Partial<CheckWalletAccessOptions>): Promise<WalletAllowlistPermission[]>;
    listGrantsByTarget(targetWallet: string, scope?: string): Promise<WalletAllowlistPermission[]>;
    listGrantsByRequester(requestingWallet: string, scope?: string): Promise<WalletAllowlistPermission[]>;
    /**
     * Determine whether a wallet currently has allowlist permission
     */
    hasWalletPermission(options: CheckWalletAccessOptions): Promise<boolean>;
    /**
     * List target wallets this requester can access for an optional scope
     */
    getAccessibleWallets(requestingWallet: string, scope?: string): Promise<string[]>;
    getWalletAllowlistHistory(filter?: WalletAllowlistHistoryFilter): Promise<WalletAllowlistHistoryEvent[]>;
    private fetchWalletAllowlistEvents;
    private reduceWalletAllowlistEvents;
}
//# sourceMappingURL=CrossContextPermissionService.d.ts.map