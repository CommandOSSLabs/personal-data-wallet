/**
 * ContextWalletService - App-scoped data container management
 *
 * Manages app-specific data contexts for users, including:
 * - Context wallet creation and metadata management
 * - App isolation and data segregation
 * - CRUD operations within contexts
 * - Integration with MainWalletService for identity
 */
/**
 * ContextWalletService handles app-scoped data containers
 */
export class ContextWalletService {
    constructor(config) {
        this.suiClient = config.suiClient;
        this.packageId = config.packageId;
        this.mainWalletService = config.mainWalletService;
        this.storageService = config.storageService;
        this.encryptionService = config.encryptionService;
    }
    /**
     * Create a new context wallet for an app
     * @param userAddress - User's Sui address
     * @param options - Context creation options
     * @returns Created ContextWallet metadata
     */
    async create(userAddress, options) {
        // Ensure main wallet exists
        await this.mainWalletService.ensureMainWallet(userAddress);
        // Derive context ID
        const contextId = await this.mainWalletService.deriveContextId({
            userAddress,
            appId: options.appId
        });
        // TODO: Create actual on-chain context wallet once wallet.move is deployed
        // For now, return simulated context wallet
        const contextWallet = {
            id: contextId,
            appId: options.appId,
            owner: userAddress,
            policyRef: options.policyRef,
            createdAt: Date.now()
        };
        return contextWallet;
    }
    /**
     * Get context wallet by ID
     * @param contextId - Context wallet ID
     * @returns ContextWallet metadata or null if not found
     */
    async getContext(contextId) {
        try {
            // TODO: Implement actual blockchain query once wallet.move is deployed
            // For now, return null as we don't have the Move contract deployed yet
            return null;
        }
        catch (error) {
            console.error('Error fetching context wallet:', error);
            return null;
        }
    }
    /**
     * List all context wallets for a user
     * @param userAddress - User's Sui address
     * @returns Array of ContextWallet metadata
     */
    async listUserContexts(userAddress) {
        try {
            // Query for user's context wallets
            const response = await this.suiClient.getOwnedObjects({
                owner: userAddress,
                filter: {
                    StructType: `${this.packageId}::wallet::ContextWallet`
                },
                options: {
                    showContent: true,
                    showType: true
                }
            });
            // Parse context wallets from response
            const contexts = [];
            for (const item of response.data) {
                if (!item.data?.content || item.data.content.dataType !== 'moveObject') {
                    continue;
                }
                const fields = item.data.content.fields;
                contexts.push({
                    id: item.data.objectId,
                    appId: fields.app_id || '',
                    owner: userAddress,
                    policyRef: fields.policy_ref,
                    createdAt: parseInt(fields.created_at || '0')
                });
            }
            return contexts;
        }
        catch (error) {
            console.error('Error listing user contexts:', error);
            return [];
        }
    }
    /**
     * Add data item to a context
     * @param contextId - Context wallet ID
     * @param data - Data to store
     * @returns Data item ID
     */
    async addData(contextId, data) {
        // Validate context exists and user has access
        const context = await this.getContext(contextId);
        if (!context) {
            throw new Error(`Context not found: ${contextId}`);
        }
        // TODO: Implement actual data storage to Walrus with context tagging
        // For now, return simulated item ID
        const itemId = `item_${contextId}_${Date.now()}`;
        return itemId;
    }
    /**
     * Remove data item from a context
     * @param contextId - Context wallet ID
     * @param itemId - Data item ID to remove
     * @returns Success status
     */
    async removeData(contextId, itemId) {
        // Validate context exists and user has access
        const context = await this.getContext(contextId);
        if (!context) {
            throw new Error(`Context not found: ${contextId}`);
        }
        // TODO: Implement actual data removal from Walrus
        // For now, return success
        return true;
    }
    /**
     * List data items in a context
     * @param contextId - Context wallet ID
     * @param filters - Optional filters
     * @returns Array of data items
     */
    async listData(contextId, filters) {
        // Validate context exists and user has access
        const context = await this.getContext(contextId);
        if (!context) {
            throw new Error(`Context not found: ${contextId}`);
        }
        if (!this.storageService) {
            console.warn('StorageService not configured, returning empty data');
            return [];
        }
        try {
            // Query Sui blockchain for memory objects with this context
            const response = await this.suiClient.getOwnedObjects({
                owner: context.owner,
                filter: {
                    StructType: `${this.packageId}::memory::MemoryRecord`
                },
                options: {
                    showContent: true,
                    showType: true
                }
            });
            const dataItems = [];
            for (const item of response.data) {
                if (!item.data?.content || item.data.content.dataType !== 'moveObject') {
                    continue;
                }
                const fields = item.data.content.fields;
                const blobId = fields.blob_id;
                if (!blobId || blobId === 'temp_blob_id') {
                    continue;
                }
                try {
                    // Retrieve blob from Walrus
                    const blobContent = await this.storageService.getBlob(blobId);
                    // Check if blob is SEAL-encrypted
                    let decryptedContent;
                    // Try to parse as JSON to check for encrypted format
                    try {
                        const textDecoder = new TextDecoder();
                        const blobText = textDecoder.decode(blobContent);
                        const parsed = JSON.parse(blobText);
                        // Check if this is a SEAL encrypted object
                        if (parsed.encrypted === true || parsed.encryptionType === 'seal') {
                            if (!this.encryptionService) {
                                console.warn(`Blob ${blobId} is encrypted but EncryptionService not configured`);
                                continue;
                            }
                            // Decrypt with SEAL using context's app ID
                            // Note: In real implementation, userAddress and sessionKey should be provided
                            const decrypted = await this.encryptionService.decrypt({
                                encryptedData: parsed,
                                userAddress: context.owner, // Use context owner's address
                                appId: context.appId, // Use context's app identity for permission validation
                                // sessionKey would need to be provided by caller in real implementation
                            });
                            decryptedContent = typeof decrypted === 'string' ? decrypted : JSON.stringify(decrypted);
                        }
                        else {
                            // Not encrypted, use as-is
                            decryptedContent = blobText;
                        }
                    }
                    catch (parseError) {
                        // Not JSON or not encrypted, treat as plain text
                        const textDecoder = new TextDecoder();
                        decryptedContent = textDecoder.decode(blobContent);
                    }
                    // Parse final content
                    let parsedContent;
                    try {
                        parsedContent = JSON.parse(decryptedContent);
                    }
                    catch {
                        parsedContent = { content: decryptedContent };
                    }
                    // Filter by category if specified
                    if (filters?.category && parsedContent.category !== filters.category) {
                        continue;
                    }
                    dataItems.push({
                        id: item.data.objectId,
                        content: parsedContent.content || decryptedContent,
                        category: parsedContent.category || fields.category,
                        metadata: parsedContent.metadata || {},
                        createdAt: parseInt(fields.created_at || '0')
                    });
                }
                catch (error) {
                    console.error(`Failed to retrieve/decrypt blob ${blobId}:`, error);
                    // Continue with other items
                }
            }
            // Apply pagination
            const offset = filters?.offset || 0;
            const limit = filters?.limit;
            let paginatedItems = dataItems.slice(offset);
            if (limit) {
                paginatedItems = paginatedItems.slice(0, limit);
            }
            return paginatedItems;
        }
        catch (error) {
            console.error('Error listing context data:', error);
            throw new Error(`Failed to list data for context ${contextId}: ${error}`);
        }
    }
    /**
     * Get context wallet for a specific app and user
     * @param userAddress - User's Sui address
     * @param appId - Application ID
     * @returns ContextWallet metadata or null if not found
     */
    async getContextForApp(userAddress, appId) {
        // Derive the expected context ID
        const contextId = await this.mainWalletService.deriveContextId({
            userAddress,
            appId
        });
        return await this.getContext(contextId);
    }
    /**
     * Ensure context wallet exists for an app, create if not found
     * @param userAddress - User's Sui address
     * @param appId - Application ID
     * @returns Existing or newly created ContextWallet
     */
    async ensureContext(userAddress, appId) {
        const existing = await this.getContextForApp(userAddress, appId);
        if (existing) {
            return existing;
        }
        // Create new context wallet
        return await this.create(userAddress, { appId });
    }
    /**
     * Delete a context wallet and all its data
     * @param contextId - Context wallet ID
     * @returns Success status
     */
    async deleteContext(contextId) {
        const context = await this.getContext(contextId);
        if (!context) {
            throw new Error(`Context not found: ${contextId}`);
        }
        // TODO: Implement actual context deletion
        // This should:
        // 1. Delete all data items from Walrus
        // 2. Remove context wallet from blockchain
        // 3. Clean up any access grants
        return true;
    }
    /**
     * Update context wallet metadata
     * @param contextId - Context wallet ID
     * @param updates - Updates to apply
     * @returns Updated ContextWallet
     */
    async updateContext(contextId, updates) {
        const context = await this.getContext(contextId);
        if (!context) {
            throw new Error(`Context not found: ${contextId}`);
        }
        // TODO: Implement actual context update on blockchain
        // For now, return updated context
        return {
            ...context,
            policyRef: updates.policyRef || context.policyRef
        };
    }
    /**
     * Validate that a user has access to a context
     * @param contextId - Context wallet ID
     * @param userAddress - User's Sui address
     * @returns True if user has access
     */
    async validateAccess(contextId, userAddress) {
        const context = await this.getContext(contextId);
        if (!context) {
            return false;
        }
        // Owner always has access
        if (context.owner === userAddress) {
            return true;
        }
        // TODO: Check access grants via PermissionService
        // For now, only owner has access
        return false;
    }
    /**
     * Get statistics for a context wallet
     * @param contextId - Context wallet ID
     * @returns Context usage statistics
     */
    async getContextStats(contextId) {
        const context = await this.getContext(contextId);
        if (!context) {
            throw new Error(`Context not found: ${contextId}`);
        }
        // TODO: Implement actual statistics from Walrus data
        return {
            itemCount: 0,
            totalSize: 0,
            categories: {},
            lastActivity: context.createdAt
        };
    }
}
//# sourceMappingURL=ContextWalletService.js.map