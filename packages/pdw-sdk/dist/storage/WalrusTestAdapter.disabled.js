"use strict";
/**
 * WalrusTestAdapter - Adapter to make StorageService compatible with existing test interfaces
 * This allows us to use the proper StorageService (with official @mysten/walrus)
 * while maintaining the test API expectations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalrusTestAdapter = void 0;
const StorageService_1 = require("../services/StorageService");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
/**
 * Adapter that wraps StorageService to provide the test interface
 */
class WalrusTestAdapter {
    constructor(config) {
        this.storageService = new StorageService_1.StorageService({
            ...config,
            network: config.network || 'testnet',
            timeout: config.timeoutMs,
            maxFileSize: 1024 * 1024 * 1024 // 1GB default
        });
        // Create a test keypair for signing operations
        this.testKeypair = new ed25519_1.Ed25519Keypair();
    }
    /**
     * Upload content with metadata (adapts to StorageService.upload)
     */
    async uploadContentWithMetadata(content, ownerAddress, options = {}) {
        const startTime = Date.now();
        try {
            const uploadResult = await this.storageService.upload(content, {
                tags: {
                    category: options.category || 'general',
                    topic: options.topic || '',
                    importance: (options.importance || 5).toString(),
                    owner: ownerAddress,
                    ...options.additionalTags
                },
                encrypt: options.enableEncryption,
                cacheLocally: true,
                signer: this.testKeypair, // Use test signer
                epochs: options.epochs || 1
            });
            const uploadTime = Date.now() - startTime;
            return {
                blobId: uploadResult.blobId,
                metadata: {
                    category: options.category || 'general',
                    topic: options.topic,
                    importance: options.importance || 5,
                    contentSize: uploadResult.metadata.size,
                    contentType: uploadResult.metadata.contentType,
                    contentHash: uploadResult.metadata.checksumSha256,
                    createdTimestamp: Date.now(),
                    customMetadata: options.additionalTags
                },
                uploadTimeMs: uploadTime,
                isEncrypted: options.enableEncryption || false
            };
        }
        catch (error) {
            throw new Error(`Upload failed: ${error}`);
        }
    }
    /**
     * Retrieve content (adapts to StorageService.retrieve)
     */
    async retrieveContent(blobId, decryptionKey) {
        const startTime = Date.now();
        try {
            const result = await this.storageService.retrieve(blobId, {
                useCache: true,
                decrypt: !!decryptionKey
            });
            // Handle both string and Uint8Array content
            const contentString = typeof result.content === 'string'
                ? result.content
                : new TextDecoder().decode(result.content);
            return {
                content: contentString,
                metadata: result.metadata,
                blobId,
                isFromCache: result.fromCache,
                retrievalTimeMs: result.retrievalTimeMs
            };
        }
        catch (error) {
            throw new Error(`Retrieval failed: ${error}`);
        }
    }
    /**
     * Check Walrus availability (mock implementation)
     */
    async checkWalrusAvailability() {
        // For testing, we'll consider Walrus "available" if we can create the service
        try {
            // Try a simple operation to check if service is working
            await this.storageService.getStats();
            return true;
        }
        catch (error) {
            console.warn('Walrus availability check failed:', error);
            return false;
        }
    }
    /**
     * Get blob information (using StorageService.getBlob)
     */
    async getBlobInfo(blobId) {
        try {
            const blobInfo = await this.storageService.getBlob(blobId);
            if (!blobInfo.exists) {
                return null;
            }
            return {
                blobId,
                size: 0, // Would need separate metadata storage
                contentType: 'application/octet-stream',
                uploadDate: new Date(),
                metadata: {},
                isAvailable: blobInfo.exists
            };
        }
        catch (error) {
            console.error('Failed to get blob info:', error);
            return null;
        }
    }
    /**
     * Delete blob (adapts to StorageService.delete)
     */
    async deleteBlob(blobId) {
        try {
            return await this.storageService.delete(blobId);
        }
        catch (error) {
            console.error('Failed to delete blob:', error);
            return false;
        }
    }
    /**
     * Upload batch of items
     */
    async uploadBatch(items) {
        const results = [];
        for (const item of items) {
            try {
                const result = await this.uploadContentWithMetadata(item.content, item.ownerAddress, {
                    category: item.category,
                    topic: item.topic,
                    importance: item.importance
                });
                results.push(result);
            }
            catch (error) {
                console.error('Batch upload item failed:', error);
                // Continue with other items
            }
        }
        return results;
    }
    /**
     * Retrieve batch of items
     */
    async retrieveBatch(blobIds) {
        const results = [];
        for (const blobId of blobIds) {
            try {
                const result = await this.retrieveContent(blobId);
                results.push(result);
            }
            catch (error) {
                console.error(`Batch retrieve failed for ${blobId}:`, error);
                // Continue with other items
            }
        }
        return results;
    }
    /**
     * List user blobs (mock implementation)
     */
    async listUserBlobs(userAddress, options = {}) {
        try {
            // Use StorageService.list with filter
            const items = await this.storageService.list({
                tags: options.category ? { category: options.category } : undefined
            });
            const blobs = items.map(item => ({
                blobId: item.blobId,
                size: item.metadata.size,
                contentType: item.metadata.contentType,
                uploadDate: new Date(item.metadata.createdAt),
                metadata: item.metadata.tags,
                isAvailable: true
            }));
            // Apply pagination
            const offset = options.offset || 0;
            const limit = options.limit || 100;
            const paginatedBlobs = blobs.slice(offset, offset + limit);
            return {
                blobs: paginatedBlobs,
                totalCount: blobs.length
            };
        }
        catch (error) {
            console.error('Failed to list user blobs:', error);
            return {
                blobs: [],
                totalCount: 0
            };
        }
    }
}
exports.WalrusTestAdapter = WalrusTestAdapter;
//# sourceMappingURL=WalrusTestAdapter.disabled.js.map