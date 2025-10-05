/**
 * EncryptionService - SEAL-based encryption and access control
 *
 * Provides identity-based encryption using Mysten's SEAL SDK with decentralized
 * key management and onchain access control policies.
 */
import { SessionKey } from '@mysten/seal';
import { Transaction } from '@mysten/sui/transactions';
import type { ClientWithCoreApi, PDWConfig, AccessPermission, Thunk, SealEncryptionResult, SealDecryptionOptions } from '../types';
export interface AccessGrantOptions {
    ownerAddress: string;
    recipientAddress: string;
    contentId: string;
    accessLevel: 'read' | 'write';
    expiresIn?: number;
}
export interface AccessRevokeOptions {
    ownerAddress: string;
    recipientAddress: string;
    contentId: string;
}
export declare class EncryptionService {
    private client;
    private config;
    private sealService;
    private suiClient;
    private packageId;
    private sessionKeyCache;
    private permissionService;
    constructor(client: ClientWithCoreApi, config: PDWConfig);
    /**
     * Initialize SEAL service with proper configuration
     */
    private initializeSealService;
    /**
     * Encrypt data using SEAL identity-based encryption via SealService
     */
    encrypt(data: Uint8Array | string, userAddress: string, metadata?: Record<string, string>): Promise<SealEncryptionResult>;
    /**
     * Decrypt data using SEAL with session keys via SealService
     * Handles both new binary format (Uint8Array) and legacy base64 format
     * Validates wallet-based allowlists during approval flow
     */
    decrypt(options: SealDecryptionOptions): Promise<Uint8Array>;
    /**
     * Create a new session key for a user via SealService
     */
    createSessionKey(userAddress: string): Promise<SessionKey>;
    /**
     * Get cached session key or create new one
     */
    getOrCreateSessionKey(userAddress: string): Promise<SessionKey>;
    /**
     * Export session key for persistence
     */
    exportSessionKey(sessionKey: SessionKey): Promise<string>;
    /**
     * Import previously exported session key
     */
    importSessionKey(exportedKey: string, userAddress?: string): Promise<SessionKey>;
    /**
     * Build access approval transaction for SEAL key servers (LEGACY)
     *
     * @deprecated Use buildAccessTransactionForWallet instead for wallet-based permissions
     */
    buildAccessTransaction(userAddress: string, accessType?: 'read' | 'write'): Promise<Transaction>;
    /**
     * Build access approval transaction for a requesting wallet address
     * Uses CrossContextPermissionService for proper permission validation
     *
     * @param userAddress - User's wallet address (used as SEAL identity)
     * @param requestingWallet - Wallet requesting access
     * @param accessType - Access level (read/write)
     * @returns Transaction for SEAL key server approval
     */
    buildAccessTransactionForWallet(userAddress: string, requestingWallet: string, accessType?: 'read' | 'write'): Promise<Transaction>;
    /**
     * Build transaction to grant access to another user
     */
    buildGrantAccessTransaction(options: AccessGrantOptions): Promise<Transaction>;
    /**
     * Build transaction to revoke access from a user
     */
    buildRevokeAccessTransaction(options: AccessRevokeOptions): Promise<Transaction>;
    /**
     * Build transaction to register content ownership
     */
    buildRegisterContentTransaction(ownerAddress: string, contentId: string, contentHash: string): Promise<Transaction>;
    get tx(): {
        /**
         * Grant access to encrypted memory
         */
        grantAccess: (options: AccessGrantOptions) => Promise<Transaction>;
        /**
         * Revoke access to encrypted memory
         */
        revokeAccess: (options: AccessRevokeOptions) => Promise<Transaction>;
        /**
         * Register content ownership
         */
        registerContent: (ownerAddress: string, contentId: string, contentHash: string) => Promise<Transaction>;
        /**
         * Build access approval transaction
         */
        buildAccessTransaction: (userAddress: string, accessType?: "read" | "write") => Promise<Transaction>;
    };
    get call(): {
        /**
         * Move call for granting access
         */
        grantAccess: (options: AccessGrantOptions) => Thunk;
        /**
         * Move call for revoking access
         */
        revokeAccess: (options: AccessRevokeOptions) => Thunk;
    };
    /**
     * Check if a user has access to decrypt content
     */
    hasAccess(userAddress: string, contentId: string, ownerAddress: string): Promise<boolean>;
    get view(): {
        /**
         * Get access permissions for memories
         */
        getAccessPermissions: (userAddress: string, memoryId?: string) => Promise<AccessPermission[]>;
        /**
         * Check if user has access to content
         */
        hasAccess: (userAddress: string, contentId: string, ownerAddress: string) => Promise<boolean>;
    };
    /**
     * Generate content hash for verification
     */
    private generateContentHash;
    /**
     * Verify content integrity
     */
    verifyContentHash(data: Uint8Array, expectedHash: string): Promise<boolean>;
    /**
     * Check if SEAL service is available
     */
    isAvailable(): boolean;
    /**
     * Get SEAL service configuration info
     */
    getClientInfo(): {
        isInitialized: boolean;
        packageId: string;
        encryptionEnabled: boolean;
    };
}
//# sourceMappingURL=EncryptionService.d.ts.map