class WalrusError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = 'WalrusError';
        if (cause) {
            this.stack += `\nCaused by: ${cause instanceof Error ? cause.stack : String(cause)}`;
        }
    }
}
// ==================== MAIN SERVICE ====================
export class WalrusService {
    constructor(config = {}) {
        this.cache = new Map();
        this.stats = {
            totalUploads: 0,
            totalRetrievals: 0,
            successfulUploads: 0,
            failedUploads: 0,
            cacheHitRate: 0,
            averageUploadTime: 0,
            averageRetrievalTime: 0,
            localFallbackCount: 0,
            totalStorageUsed: 0
        };
        this.CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
        this.config = {
            network: config.network || 'testnet',
            adminAddress: config.adminAddress || '',
            storageEpochs: config.storageEpochs || 12,
            uploadRelayHost: config.uploadRelayHost || 'https://upload-relay.testnet.walrus.space',
            retryAttempts: config.retryAttempts || 3,
            timeoutMs: config.timeoutMs || 60000,
            sealService: config.sealService
        };
        this.sealService = config.sealService;
    }
    // ==================== PUBLIC API ====================
    /**
     * Upload content to Walrus
     */
    async uploadContent(content, ownerAddress, options = {}) {
        const startTime = Date.now();
        this.stats.totalUploads++;
        try {
            // Create comprehensive metadata
            const metadata = await this.createMetadataWithEmbedding(content, options.category || 'general', options.topic || '', options.importance || 5, options.additionalTags || {});
            // Check for duplicate uploads
            const existingBlobId = this.findDuplicateContent(metadata.contentHash);
            if (existingBlobId) {
                console.log(`Duplicate content detected, returning existing blob: ${existingBlobId}`);
                return this.createUploadResult(existingBlobId, metadata, false, Date.now() - startTime);
            }
            // Store in Walrus
            let blobId;
            let isEncrypted = false;
            let backupKey;
            if (options.enableEncryption && this.sealService) {
                // Use SEAL service for encryption and storage
                const encoder = new TextEncoder();
                const data = encoder.encode(content);
                const encryptionResult = await this.sealService.encryptData({
                    data,
                    id: ownerAddress,
                    threshold: this.sealService.getConfiguration().threshold || 2
                });
                // Convert encrypted data to base64 for storage
                const encryptedContent = btoa(String.fromCharCode(...encryptionResult.encryptedObject));
                blobId = await this.uploadToWalrus(encryptedContent, ownerAddress, metadata, options.epochs);
                isEncrypted = true;
                backupKey = btoa(String.fromCharCode(...encryptionResult.key));
            }
            else {
                blobId = await this.uploadToWalrus(content, ownerAddress, metadata, options.epochs);
            }
            // Cache the result
            this.cacheContent(blobId, Buffer.from(content), metadata);
            // Update statistics
            this.stats.successfulUploads++;
            const uploadTime = Date.now() - startTime;
            this.updateAverageUploadTime(uploadTime);
            this.stats.totalStorageUsed += metadata.contentSize;
            return this.createUploadResult(blobId, metadata, isEncrypted, uploadTime, backupKey);
        }
        catch (error) {
            console.error('Upload failed:', error);
            this.stats.failedUploads++;
            throw new WalrusError('Failed to upload to Walrus', error);
        }
    }
    /**
     * Retrieve content from Walrus
     */
    async retrieveContent(blobId, decryptionKey) {
        const startTime = Date.now();
        this.stats.totalRetrievals++;
        try {
            // Check cache first
            const cached = this.cache.get(blobId);
            if (cached && this.isCacheValid(cached.timestamp)) {
                this.stats.cacheHitRate = this.stats.cacheHitRate * 0.9 + 0.1; // Moving average
                return {
                    content: cached.content.toString(),
                    metadata: cached.metadata,
                    blobId,
                    isFromCache: true,
                    retrievalTimeMs: Date.now() - startTime
                };
            }
            // Retrieve from Walrus
            const result = await this.retrieveFromWalrus(blobId);
            // Decrypt if needed
            let content = result.content;
            if (result.metadata.isEncrypted && this.sealService && decryptionKey) {
                // Convert base64 back to Uint8Array
                const encryptedData = Uint8Array.from(atob(content.toString()), c => c.charCodeAt(0));
                const sessionKey = null; // TODO: Get session key from context
                const txBytes = new Uint8Array(); // TODO: Get approval transaction bytes
                const decryptedData = await this.sealService.decryptData({
                    encryptedObject: encryptedData,
                    sessionKey,
                    txBytes
                });
                const decoder = new TextDecoder();
                content = Buffer.from(decoder.decode(decryptedData));
            }
            // Cache the result
            this.cacheContent(blobId, content, result.metadata);
            // Update cache hit rate
            this.stats.cacheHitRate = this.stats.cacheHitRate * 0.9; // Moving average
            return {
                content: content.toString(),
                metadata: result.metadata,
                blobId,
                isFromCache: false,
                retrievalTimeMs: Date.now() - startTime
            };
        }
        catch (error) {
            throw new WalrusError(`Failed to retrieve content from Walrus: ${blobId}`, error);
        }
    }
    /**
     * Get blob information
     */
    async getBlobInfo(blobId) {
        try {
            // Use official Walrus client to get blob info
            // TODO: Implement with @mysten/walrus client
            throw new WalrusError('getBlobInfo not yet implemented with official client');
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Delete blob from Walrus
     */
    async deleteBlob(blobId) {
        try {
            // Use official Walrus client to delete blob
            // TODO: Implement with @mysten/walrus client
            // Remove from cache
            this.cache.delete(blobId);
            return true;
        }
        catch (error) {
            throw new WalrusError(`Failed to delete blob: ${blobId}`, error);
        }
    }
    /**
     * Get service statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
    // ==================== PRIVATE METHODS ====================
    async createMetadataWithEmbedding(content, category, topic, importance, customMetadata) {
        const contentBuffer = Buffer.from(content, 'utf-8');
        const contentHash = await this.generateContentHash(content);
        const timestamp = Date.now();
        return {
            contentType: 'text/plain',
            contentSize: contentBuffer.length,
            contentHash,
            category,
            topic: topic || `Memory about ${category}`,
            importance: Math.max(1, Math.min(10, importance)),
            embeddingDimension: 768,
            createdTimestamp: timestamp,
            customMetadata,
            isEncrypted: false
        };
    }
    async generateContentHash(content) {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    async uploadToWalrus(content, ownerAddress, metadata, epochs) {
        try {
            // Use official @mysten/walrus client here
            // TODO: Implement actual Walrus upload using official client
            // Include required tags: context-id, app-id, owner, content-type, content-hash, encrypted, encryption-type
            // Mock implementation for now
            const blobId = `official_walrus_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            // Simulate upload delay
            await this.delay(100 + Math.random() * 400);
            return blobId;
        }
        catch (error) {
            throw new WalrusError('Failed to upload to Walrus using official client', error);
        }
    }
    async retrieveFromWalrus(blobId) {
        try {
            // Use official @mysten/walrus client here
            // TODO: Implement actual Walrus retrieval using official client
            throw new WalrusError('Walrus retrieval not yet implemented with official client');
        }
        catch (error) {
            throw new WalrusError('Failed to retrieve from Walrus using official client', error);
        }
    }
    findDuplicateContent(contentHash) {
        for (const [blobId, cached] of this.cache.entries()) {
            if (cached.metadata.contentHash === contentHash) {
                return blobId;
            }
        }
        return null;
    }
    cacheContent(blobId, content, metadata) {
        this.cache.set(blobId, {
            content,
            metadata,
            timestamp: new Date()
        });
        // Cleanup old cache entries (keep last 1000)
        if (this.cache.size > 1000) {
            const entries = Array.from(this.cache.entries()).sort(([, a], [, b]) => a.timestamp.getTime() - b.timestamp.getTime());
            for (let i = 0; i < entries.length - 1000; i++) {
                this.cache.delete(entries[i][0]);
            }
        }
    }
    isCacheValid(timestamp) {
        return Date.now() - timestamp.getTime() < this.CACHE_TTL_MS;
    }
    createUploadResult(blobId, metadata, isEncrypted, uploadTimeMs, backupKey) {
        return {
            success: true,
            blobId,
            contentHash: metadata.contentHash,
            metadata,
            isEncrypted,
            uploadTimeMs,
            backupKey
        };
    }
    updateAverageUploadTime(newTime) {
        const alpha = 0.1; // Smoothing factor
        this.stats.averageUploadTime =
            this.stats.averageUploadTime * (1 - alpha) + newTime * alpha;
    }
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=WalrusService.hardened.js.map