"use strict";
/**
 * EncryptionService - SEAL-based encryption and access control
 *
 * Provides identity-based encryption using Mysten's SEAL SDK with decentralized
 * key management and onchain access control policies.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const seal_1 = require("@mysten/seal");
const transactions_1 = require("@mysten/sui/transactions");
const utils_1 = require("@mysten/sui/utils");
const SealService_1 = require("../security/SealService");
const CrossContextPermissionService_1 = require("../services/CrossContextPermissionService");
class EncryptionService {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.sessionKeyCache = new Map();
        this.suiClient = client.client || client;
        this.packageId = config.packageId || '';
        this.sealService = this.initializeSealService();
        // Initialize permission service for OAuth-style access control
        this.permissionService = new CrossContextPermissionService_1.CrossContextPermissionService({
            packageId: this.packageId,
            accessRegistryId: config.accessRegistryId || ''
        }, this.suiClient);
    }
    /**
     * Initialize SEAL service with proper configuration
     */
    initializeSealService() {
        const encryptionConfig = this.config.encryptionConfig;
        if (!encryptionConfig?.enabled) {
            console.warn('Encryption is disabled in configuration - creating SealService anyway');
        }
        // Default testnet key servers (replace with actual server object IDs)
        const defaultKeyServers = [
            '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
            '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8'
        ];
        const keyServerIds = encryptionConfig?.keyServers || defaultKeyServers;
        // Create SealService with proper configuration
        const sealConfig = {
            suiClient: this.suiClient,
            packageId: this.packageId,
            keyServerUrls: [], // Empty for now, URLs handled separately if needed
            keyServerObjectIds: keyServerIds,
            network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
            threshold: 2,
            enableMetrics: true,
            retryAttempts: 3,
            timeoutMs: 30000
        };
        return new SealService_1.SealService(sealConfig);
    }
    /**
     * Encrypt data using SEAL identity-based encryption via SealService
     */
    async encrypt(data, userAddress, metadata) {
        try {
            // Convert string to Uint8Array if needed
            const dataBytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
            // Use SealService for encryption
            const encryptResult = await this.sealService.encryptData({
                data: dataBytes,
                id: userAddress,
                threshold: 2
            });
            // ✅ CRITICAL: Keep encrypted data as Uint8Array (NO base64 conversion)
            const encryptedContent = encryptResult.encryptedObject;
            const backupKeyHex = (0, utils_1.toHex)(encryptResult.key);
            // Generate content hash for verification
            const contentHash = await this.generateContentHash(dataBytes);
            return {
                encryptedContent, // Changed from encryptedData to encryptedContent (Uint8Array)
                backupKey: backupKeyHex,
                contentHash,
            };
        }
        catch (error) {
            throw new Error(`Encryption failed: ${error}`);
        }
    }
    /**
     * Decrypt data using SEAL with session keys via SealService
     * Handles both new binary format (Uint8Array) and legacy base64 format
     * Now includes app_id for OAuth-style permission validation
     */
    async decrypt(options) {
        try {
            // Validate app_id is provided for OAuth-style access control
            if (!options.appId) {
                console.warn('No app_id provided for decryption - OAuth permission check will be skipped');
            }
            // Get or create session key
            let activeSessionKey = options.sessionKey;
            if (!activeSessionKey) {
                activeSessionKey = await this.getOrCreateSessionKey(options.userAddress);
            }
            // Build access transaction if not provided
            let txBytes = options.signedTxBytes;
            if (!txBytes) {
                const tx = options.appId
                    ? await this.buildAccessTransactionWithAppId(options.userAddress, options.appId, 'read')
                    : await this.buildAccessTransaction(options.userAddress, 'read');
                txBytes = await tx.build({ client: this.suiClient });
            }
            // ✅ CRITICAL: Handle both binary and legacy formats
            let encryptedBytes;
            if (options.encryptedContent && options.encryptedContent instanceof Uint8Array) {
                // **NEW BINARY FORMAT** (preferred - matches memory-workflow-seal.ts)
                encryptedBytes = options.encryptedContent;
            }
            else if (options.encryptedData) {
                // **LEGACY BASE64 FORMAT** (deprecated but supported for backward compatibility)
                const encryptedDataBase64 = options.encryptedData;
                const binaryString = atob(encryptedDataBase64);
                encryptedBytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    encryptedBytes[i] = binaryString.charCodeAt(i);
                }
            }
            else {
                throw new Error('No encrypted data provided. Use either encryptedContent (Uint8Array) or encryptedData (base64 string)');
            }
            // Use SealService for decryption
            const decryptResult = await this.sealService.decryptData({
                encryptedObject: encryptedBytes,
                sessionKey: activeSessionKey,
                txBytes: txBytes
            });
            return decryptResult;
        }
        catch (error) {
            throw new Error(`Decryption failed: ${error}`);
        }
    }
    // ==================== SESSION KEY MANAGEMENT ====================
    /**
     * Create a new session key for a user via SealService
     */
    async createSessionKey(userAddress) {
        try {
            const sessionResult = await this.sealService.createSession({
                address: userAddress,
                packageId: this.packageId,
                ttlMin: 60, // 1 hour TTL
            });
            // Cache the session key
            this.sessionKeyCache.set(userAddress, sessionResult.sessionKey);
            return sessionResult.sessionKey;
        }
        catch (error) {
            throw new Error(`Failed to create session key: ${error}`);
        }
    }
    /**
     * Get cached session key or create new one
     */
    async getOrCreateSessionKey(userAddress) {
        const cached = this.sessionKeyCache.get(userAddress);
        if (cached) {
            return cached;
        }
        return this.createSessionKey(userAddress);
    }
    /**
     * Export session key for persistence
     */
    async exportSessionKey(sessionKey) {
        try {
            const exported = sessionKey.export();
            return JSON.stringify(exported);
        }
        catch (error) {
            throw new Error(`Failed to export session key: ${error}`);
        }
    }
    /**
     * Import previously exported session key
     */
    async importSessionKey(exportedKey, userAddress) {
        try {
            const keyData = JSON.parse(exportedKey);
            const sessionKey = seal_1.SessionKey.import(keyData, this.suiClient);
            if (userAddress) {
                this.sessionKeyCache.set(userAddress, sessionKey);
            }
            return sessionKey;
        }
        catch (error) {
            throw new Error(`Failed to import session key: ${error}`);
        }
    }
    // ==================== ACCESS CONTROL TRANSACTIONS ====================
    /**
     * Build access approval transaction for SEAL key servers (LEGACY)
     *
     * @deprecated Use buildAccessTransactionWithAppId instead for OAuth-style permissions
     */
    async buildAccessTransaction(userAddress, accessType = 'read') {
        console.warn('buildAccessTransaction is deprecated - use buildAccessTransactionWithAppId for OAuth-style permissions');
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::seal_access_control::seal_approve`,
            arguments: [
                tx.pure.vector('u8', Array.from((0, utils_1.fromHex)(userAddress.replace('0x', '')))),
                tx.pure.string(''), // Empty app_id for legacy compatibility
                tx.object(this.config.accessRegistryId || ''),
                tx.object('0x6'), // Clock object
            ],
        });
        return tx;
    }
    /**
     * Build access approval transaction with app_id for OAuth-style permissions
     * Uses CrossContextPermissionService for proper permission validation
     *
     * @param userAddress - User's wallet address (used as SEAL identity)
     * @param appId - Requesting application identifier
     * @param accessType - Access level (read/write)
     * @returns Transaction for SEAL key server approval
     */
    async buildAccessTransactionWithAppId(userAddress, appId, accessType = 'read') {
        // Convert user address to bytes for SEAL identity
        const identityBytes = (0, utils_1.fromHex)(userAddress.replace('0x', ''));
        // Use CrossContextPermissionService to build seal_approve with app_id
        return this.permissionService.buildSealApproveTransaction(identityBytes, appId);
    }
    /**
     * Build transaction to grant access to another user
     */
    async buildGrantAccessTransaction(options) {
        const { ownerAddress, recipientAddress, contentId, accessLevel, expiresIn } = options;
        const tx = new transactions_1.Transaction();
        const expiresAt = expiresIn ? Date.now() + expiresIn : Date.now() + 86400000; // 24h default
        tx.moveCall({
            target: `${this.packageId}::seal_access_control::grant_access`,
            arguments: [
                tx.pure.address(ownerAddress),
                tx.pure.address(recipientAddress),
                tx.pure.string(contentId),
                tx.pure.string(accessLevel),
                tx.pure.u64(expiresAt),
            ],
        });
        return tx;
    }
    /**
     * Build transaction to revoke access from a user
     */
    async buildRevokeAccessTransaction(options) {
        const { ownerAddress, recipientAddress, contentId } = options;
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::seal_access_control::revoke_access`,
            arguments: [
                tx.pure.address(ownerAddress),
                tx.pure.address(recipientAddress),
                tx.pure.string(contentId),
            ],
        });
        return tx;
    }
    /**
     * Build transaction to register content ownership
     */
    async buildRegisterContentTransaction(ownerAddress, contentId, contentHash) {
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::seal_access_control::register_content`,
            arguments: [
                tx.pure.address(ownerAddress),
                tx.pure.string(contentId),
                tx.pure.string(contentHash),
                tx.pure.string(''), // encryption_info
            ],
        });
        return tx;
    }
    // ==================== TRANSACTION BUILDERS ====================
    get tx() {
        return {
            /**
             * Grant access to encrypted memory
             */
            grantAccess: (options) => {
                return this.buildGrantAccessTransaction(options);
            },
            /**
             * Revoke access to encrypted memory
             */
            revokeAccess: (options) => {
                return this.buildRevokeAccessTransaction(options);
            },
            /**
             * Register content ownership
             */
            registerContent: (ownerAddress, contentId, contentHash) => {
                return this.buildRegisterContentTransaction(ownerAddress, contentId, contentHash);
            },
            /**
             * Build access approval transaction
             */
            buildAccessTransaction: (userAddress, accessType = 'read') => {
                return this.buildAccessTransaction(userAddress, accessType);
            },
        };
    }
    // ==================== MOVE CALL BUILDERS ====================
    get call() {
        return {
            /**
             * Move call for granting access
             */
            grantAccess: (options) => {
                return async (tx) => {
                    const grantTx = await this.buildGrantAccessTransaction(options);
                    return grantTx;
                };
            },
            /**
             * Move call for revoking access
             */
            revokeAccess: (options) => {
                return async (tx) => {
                    const revokeTx = await this.buildRevokeAccessTransaction(options);
                    return revokeTx;
                };
            },
        };
    }
    // ==================== ACCESS CONTROL QUERIES ====================
    /**
     * Check if a user has access to decrypt content
     */
    async hasAccess(userAddress, contentId, ownerAddress) {
        try {
            if (userAddress === ownerAddress) {
                return true;
            }
            const tx = new transactions_1.Transaction();
            tx.moveCall({
                target: `${this.packageId}::seal_access_control::check_access`,
                arguments: [
                    tx.pure.address(userAddress),
                    tx.pure.string(contentId),
                    tx.pure.address(ownerAddress),
                ],
            });
            const result = await this.suiClient.devInspectTransactionBlock({
                transactionBlock: tx,
                sender: userAddress,
            });
            return result.effects.status.status === 'success';
        }
        catch (error) {
            console.error(`Error checking access: ${error}`);
            return false;
        }
    }
    // ==================== VIEW METHODS ====================
    get view() {
        return {
            /**
             * Get access permissions for memories
             */
            getAccessPermissions: async (userAddress, memoryId) => {
                // Note: This would typically require event queries or indexing
                // For now, return empty array as this requires additional infrastructure
                console.warn('getAccessPermissions: This method requires event indexing infrastructure');
                return [];
            },
            /**
             * Check if user has access to content
             */
            hasAccess: (userAddress, contentId, ownerAddress) => {
                return this.hasAccess(userAddress, contentId, ownerAddress);
            },
        };
    }
    // ==================== UTILITY METHODS ====================
    /**
     * Generate content hash for verification
     */
    async generateContentHash(data) {
        // Create a new Uint8Array to ensure proper typing
        const dataArray = new Uint8Array(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataArray);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    /**
     * Verify content integrity
     */
    async verifyContentHash(data, expectedHash) {
        const actualHash = await this.generateContentHash(data);
        return actualHash === expectedHash;
    }
    /**
     * Check if SEAL service is available
     */
    isAvailable() {
        return this.sealService !== null;
    }
    /**
     * Get SEAL service configuration info
     */
    getClientInfo() {
        return {
            isInitialized: this.sealService !== null,
            packageId: this.packageId,
            encryptionEnabled: this.config.encryptionConfig?.enabled || false,
        };
    }
}
exports.EncryptionService = EncryptionService;
//# sourceMappingURL=EncryptionService.js.map