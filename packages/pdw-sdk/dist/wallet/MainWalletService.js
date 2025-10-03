"use strict";
/**
 * MainWalletService - Core wallet identity and key management
 *
 * Manages the primary wallet identity for users, including:
 * - Wallet creation and metadata management
 * - Context ID derivation for app isolation
 * - SEAL key rotation and session management
 * - On-chain wallet registry integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainWalletService = void 0;
const sha3_1 = require("@noble/hashes/sha3");
const crypto_1 = require("crypto");
/**
 * MainWalletService handles core wallet identity management
 */
class MainWalletService {
    constructor(config) {
        this.suiClient = config.suiClient;
        this.packageId = config.packageId;
    }
    /**
     * Get main wallet metadata for a user
     * @param userAddress - User's Sui address
     * @returns MainWallet metadata or null if not found
     */
    async getMainWallet(userAddress) {
        try {
            // Query for main wallet object by owner
            const response = await this.suiClient.getOwnedObjects({
                owner: userAddress,
                filter: {
                    StructType: `${this.packageId}::wallet::MainWallet`
                },
                options: {
                    showContent: true,
                    showType: true
                }
            });
            if (response.data.length === 0) {
                return null;
            }
            // Get the first (should be only) main wallet
            const walletObject = response.data[0];
            if (!walletObject.data?.content || walletObject.data.content.dataType !== 'moveObject') {
                throw new Error('Invalid main wallet object structure');
            }
            const fields = walletObject.data.content.fields;
            return {
                owner: userAddress,
                walletId: walletObject.data.objectId,
                createdAt: parseInt(fields.created_at || '0'),
                salts: {
                    context: fields.context_salt || ''
                }
            };
        }
        catch (error) {
            console.error('Error fetching main wallet:', error);
            return null;
        }
    }
    /**
     * Create a new main wallet for a user
     * @param options - Creation options
     * @returns Created MainWallet metadata
     */
    async createMainWallet(options) {
        // Generate salts if not provided
        const contextSalt = options.salts?.context || this.generateSalt();
        // For now, return a simulated MainWallet since we need Move contract deployment first
        // TODO: Implement actual on-chain wallet creation once wallet.move is deployed
        const walletId = `wallet_${options.userAddress}_${Date.now()}`;
        return {
            owner: options.userAddress,
            walletId,
            createdAt: Date.now(),
            salts: {
                context: contextSalt
            }
        };
    }
    /**
     * Derive a deterministic context ID for app isolation
     * @param options - Derivation options
     * @returns Deterministic context ID (hash only, for backward compatibility)
     */
    async deriveContextId(options) {
        let salt = options.salt;
        // If no salt provided, get it from main wallet
        if (!salt) {
            const mainWallet = await this.getMainWallet(options.userAddress);
            if (!mainWallet) {
                throw new Error('Main wallet not found - create one first');
            }
            salt = mainWallet.salts.context;
        }
        // Derive context ID: sha3_256(userAddress | appId | salt)
        const input = `${options.userAddress}|${options.appId}|${salt}`;
        const inputBytes = new TextEncoder().encode(input);
        const hash = (0, sha3_1.sha3_256)(inputBytes);
        return `0x${Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('')}`;
    }
    /**
     * Get full context information (deterministic ID + object address if exists)
     * @param userAddress - User's Sui address
     * @param appId - Application identifier
     * @returns DerivedContext with contextId and optional objectAddress
     */
    async getContextInfo(userAddress, appId) {
        // Derive deterministic ID
        const contextId = await this.deriveContextId({ userAddress, appId });
        // Check if context wallet object exists on-chain
        const mainWallet = await this.getMainWallet(userAddress);
        if (!mainWallet) {
            return { contextId, appId, exists: false };
        }
        // Try to find context wallet as dynamic field
        try {
            const response = await this.suiClient.getDynamicFieldObject({
                parentId: mainWallet.walletId,
                name: {
                    type: '0x1::string::String',
                    value: appId
                }
            });
            if (response.data) {
                return {
                    contextId,
                    appId,
                    objectAddress: response.data.objectId,
                    exists: true
                };
            }
        }
        catch (error) {
            // Context not found as dynamic field
            console.debug(`Context wallet not found for appId: ${appId}`);
        }
        return { contextId, appId, exists: false };
    }
    /**
     * Check if a context wallet exists on-chain
     * @param userAddress - User's Sui address
     * @param appId - Application identifier
     * @returns True if context wallet exists as dynamic field
     */
    async contextExists(userAddress, appId) {
        const contextInfo = await this.getContextInfo(userAddress, appId);
        return contextInfo.exists;
    }
    /**
     * Rotate SEAL session and backup keys for a user
     * @param options - Rotation options
     * @returns Result of key rotation
     */
    async rotateKeys(options) {
        const { userAddress, sessionKeyTtlMin = 60 } = options;
        try {
            // TODO: Implement actual key rotation with SEAL service
            // For now, return a simulated result
            const sessionKeyId = `session_${userAddress}_${Date.now()}`;
            const expiresAt = Date.now() + (sessionKeyTtlMin * 60 * 1000);
            return {
                sessionKeyId,
                expiresAt,
                backupKeyRotated: true
            };
        }
        catch (error) {
            console.error('Error rotating keys:', error);
            throw new Error(`Failed to rotate keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Check if a main wallet exists for a user
     * @param userAddress - User's Sui address
     * @returns True if main wallet exists
     */
    async hasMainWallet(userAddress) {
        const wallet = await this.getMainWallet(userAddress);
        return wallet !== null;
    }
    /**
     * Generate a cryptographically secure salt
     * @returns Random salt as hex string
     */
    generateSalt() {
        const bytes = (0, crypto_1.randomBytes)(32);
        return bytes.toString('hex');
    }
    /**
     * Validate a user address format
     * @param address - Address to validate
     * @returns True if valid Sui address format
     */
    isValidSuiAddress(address) {
        return /^0x[a-fA-F0-9]{64}$/.test(address);
    }
    /**
     * Get main wallet with validation
     * @param userAddress - User's Sui address
     * @returns MainWallet metadata
     * @throws Error if wallet not found or address invalid
     */
    async getMainWalletRequired(userAddress) {
        if (!this.isValidSuiAddress(userAddress)) {
            throw new Error(`Invalid Sui address format: ${userAddress}`);
        }
        const wallet = await this.getMainWallet(userAddress);
        if (!wallet) {
            throw new Error(`Main wallet not found for address: ${userAddress}`);
        }
        return wallet;
    }
    /**
     * Create main wallet if it doesn't exist
     * @param userAddress - User's Sui address
     * @returns Existing or newly created MainWallet
     */
    async ensureMainWallet(userAddress) {
        if (!this.isValidSuiAddress(userAddress)) {
            throw new Error(`Invalid Sui address format: ${userAddress}`);
        }
        const existing = await this.getMainWallet(userAddress);
        if (existing) {
            return existing;
        }
        // Create new main wallet
        return await this.createMainWallet({
            userAddress
        });
    }
}
exports.MainWalletService = MainWalletService;
//# sourceMappingURL=MainWalletService.js.map