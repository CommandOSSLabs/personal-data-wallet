/**
 * WalrusService - Advanced Decentralized Storage Operations
 *
 * Comprehensive Walrus integration with metadata-aware storage, blob management,
 * encryption support, and intelligent retrieval optimization with fallback mechanisms.
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';
/**
 * Advanced Walrus service with comprehensive storage and metadata operations
 */
export class WalrusService {
    constructor(config = {}) {
        this.cache = new Map();
        this.pendingUploads = new Map();
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
        this.walrusAvailable = true;
        this.lastWalrusCheck = 0;
        this.WALRUS_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
        this.CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
        this.config = {
            network: config.network || 'testnet',
            adminAddress: config.adminAddress || '',
            storageEpochs: config.storageEpochs || 12,
            uploadRelayHost: config.uploadRelayHost || 'https://upload-relay.testnet.walrus.space',
            enableLocalFallback: config.enableLocalFallback !== false,
            localStorageDir: config.localStorageDir || './storage/walrus-fallback',
            retryAttempts: config.retryAttempts || 3,
            timeoutMs: config.timeoutMs || 60000
        };
        this.initializeLocalStorage();
    }
    // ==================== CORE UPLOAD OPERATIONS ====================
    /**
     * Upload content with comprehensive metadata
     */
    async uploadContentWithMetadata(content, ownerAddress, options = {}) {
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
            // Attempt Walrus upload
            let blobId;
            let isEncrypted = false;
            let backupKey;
            if (this.walrusAvailable) {
                try {
                    if (options.enableEncryption) {
                        const encryptionResult = await this.uploadEncryptedContent(content, ownerAddress, metadata, options.epochs || this.config.storageEpochs);
                        blobId = encryptionResult.blobId;
                        isEncrypted = true;
                        backupKey = encryptionResult.backupKey;
                    }
                    else {
                        blobId = await this.uploadToWalrus(content, ownerAddress, metadata, options.epochs);
                    }
                }
                catch (error) {
                    console.warn('Walrus upload failed, using local fallback:', (error instanceof Error ? error.message : 'Unknown error'));
                    blobId = await this.storeLocally(content, metadata);
                    this.stats.localFallbackCount++;
                    this.walrusAvailable = false;
                    this.lastWalrusCheck = Date.now();
                }
            }
            else {
                // Use local fallback
                blobId = await this.storeLocally(content, metadata);
                this.stats.localFallbackCount++;
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
            throw new Error(`Upload failed: ${(error instanceof Error ? error.message : 'Unknown error')}`);
        }
    }
    /**
     * Upload content with automatic encryption
     */
    async uploadEncryptedContent(content, ownerAddress, metadata, epochs) {
        try {
            // Simple XOR encryption for demo (replace with proper encryption)
            const encryptionKey = this.generateEncryptionKey();
            const encryptedContent = this.xorEncrypt(content, encryptionKey);
            const encryptedMetadata = {
                ...metadata,
                isEncrypted: true,
                encryptionType: 'xor'
            };
            const blobId = await this.uploadToWalrus(encryptedContent, ownerAddress, encryptedMetadata, epochs);
            return {
                blobId,
                backupKey: encryptionKey
            };
        }
        catch (error) {
            throw new Error(`Encryption upload failed: ${(error instanceof Error ? error.message : 'Unknown error')}`);
        }
    }
    /**
     * Upload multiple files in batch
     */
    async uploadBatch(items, options = {}) {
        const batchSize = options.batchSize || 5;
        const delayMs = options.delayMs || 1000;
        const results = [];
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchPromises = batch.map(item => this.uploadContentWithMetadata(item.content, item.ownerAddress, {
                category: item.category,
                topic: item.topic,
                importance: item.importance
            }));
            const batchResults = await Promise.allSettled(batchPromises);
            for (const result of batchResults) {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                }
                else {
                    console.error('Batch upload item failed:', result.reason);
                }
            }
            // Progress callback
            if (options.onProgress) {
                options.onProgress(i + batch.length, items.length);
            }
            // Delay between batches
            if (i + batchSize < items.length) {
                await this.delay(delayMs);
            }
        }
        return results;
    }
    // ==================== RETRIEVAL OPERATIONS ====================
    /**
     * Retrieve content with metadata
     */
    async retrieveContent(blobId, decryptionKey) {
        const startTime = Date.now();
        this.stats.totalRetrievals++;
        try {
            // Check cache first
            const cached = this.cache.get(blobId);
            if (cached && this.isCacheValid(cached.timestamp)) {
                this.updateCacheHitRate(true);
                return {
                    content: cached.content.toString(),
                    metadata: cached.metadata,
                    blobId,
                    isFromCache: true,
                    retrievalTimeMs: Date.now() - startTime
                };
            }
            this.updateCacheHitRate(false);
            // Try Walrus retrieval
            let content;
            let metadata;
            if (this.walrusAvailable) {
                try {
                    const result = await this.retrieveFromWalrus(blobId);
                    content = result.content;
                    metadata = result.metadata;
                }
                catch (error) {
                    console.warn('Walrus retrieval failed, trying local fallback:', (error instanceof Error ? error.message : 'Unknown error'));
                    const result = await this.retrieveLocally(blobId);
                    content = result.content;
                    metadata = result.metadata;
                }
            }
            else {
                const result = await this.retrieveLocally(blobId);
                content = result.content;
                metadata = result.metadata;
            }
            // Decrypt if necessary
            let finalContent = content.toString();
            if (metadata.isEncrypted && decryptionKey) {
                if (metadata.encryptionType === 'xor') {
                    finalContent = this.xorDecrypt(content.toString(), decryptionKey);
                }
            }
            // Cache the result
            this.cacheContent(blobId, content, metadata);
            const retrievalTime = Date.now() - startTime;
            this.updateAverageRetrievalTime(retrievalTime);
            return {
                content: finalContent,
                metadata,
                blobId,
                isFromCache: false,
                retrievalTimeMs: retrievalTime
            };
        }
        catch (error) {
            console.error('Retrieval failed:', error);
            throw new Error(`Retrieval failed: ${(error instanceof Error ? error.message : 'Unknown error')}`);
        }
    }
    /**
     * Retrieve multiple blobs in batch
     */
    async retrieveBatch(blobIds, options = {}) {
        const batchSize = options.batchSize || 10;
        const results = [];
        for (let i = 0; i < blobIds.length; i += batchSize) {
            const batch = blobIds.slice(i, i + batchSize);
            const batchPromises = batch.map(async (blobId) => {
                try {
                    const decryptionKey = options.decryptionKeys?.[blobId];
                    return await this.retrieveContent(blobId, decryptionKey);
                }
                catch (error) {
                    return { error: (error instanceof Error ? error.message : 'Unknown error'), blobId };
                }
            });
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }
        return results;
    }
    // ==================== BLOB MANAGEMENT ====================
    /**
     * Get blob information without downloading content
     */
    async getBlobInfo(blobId) {
        try {
            // Try to get from cache first
            const cached = this.cache.get(blobId);
            if (cached) {
                return {
                    blobId,
                    size: cached.content.length,
                    contentType: cached.metadata.contentType,
                    uploadDate: new Date(cached.metadata.createdTimestamp),
                    expiryDate: undefined, // TODO: Calculate from storage epochs
                    metadata: cached.metadata.customMetadata || {},
                    isAvailable: true
                };
            }
            // Check if available locally
            const localExists = await this.checkLocalStorage(blobId);
            if (localExists) {
                const result = await this.retrieveLocally(blobId);
                return {
                    blobId,
                    size: result.content.length,
                    contentType: result.metadata.contentType,
                    uploadDate: new Date(result.metadata.createdTimestamp),
                    metadata: result.metadata.customMetadata || {},
                    isAvailable: true
                };
            }
            // TODO: Check Walrus availability
            return null;
        }
        catch (error) {
            console.error('Failed to get blob info:', error);
            return null;
        }
    }
    /**
     * List user's blobs with metadata
     */
    async listUserBlobs(userAddress, options = {}) {
        try {
            // For now, return from cache and local storage
            const blobs = [];
            // Get from cache
            for (const [blobId, cached] of this.cache.entries()) {
                if (cached.metadata.customMetadata?.owner === userAddress) {
                    blobs.push({
                        blobId,
                        size: cached.content.length,
                        contentType: cached.metadata.contentType,
                        uploadDate: new Date(cached.metadata.createdTimestamp),
                        metadata: cached.metadata.customMetadata || {},
                        isAvailable: true
                    });
                }
            }
            // Filter by category if specified
            let filteredBlobs = options.category
                ? blobs.filter(b => b.metadata.category === options.category)
                : blobs;
            // Sort
            if (options.sortBy === 'date') {
                filteredBlobs.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
            }
            else if (options.sortBy === 'size') {
                filteredBlobs.sort((a, b) => b.size - a.size);
            }
            // Apply pagination
            const offset = options.offset || 0;
            const limit = options.limit || 100;
            return filteredBlobs.slice(offset, offset + limit);
        }
        catch (error) {
            console.error('Failed to list user blobs:', error);
            return [];
        }
    }
    /**
     * Delete blob (mark as deleted locally)
     */
    async deleteBlob(blobId) {
        try {
            // Remove from cache
            this.cache.delete(blobId);
            // Try to delete locally
            await this.deleteLocally(blobId);
            // Note: Cannot delete from Walrus once uploaded
            console.log(`Blob ${blobId} removed from local storage and cache`);
            return true;
        }
        catch (error) {
            console.error('Failed to delete blob:', error);
            return false;
        }
    }
    // ==================== STATISTICS & MONITORING ====================
    /**
     * Get comprehensive service statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Check Walrus availability
     */
    async checkWalrusAvailability() {
        const now = Date.now();
        // Only check every 5 minutes to avoid spam
        if (now - this.lastWalrusCheck < this.WALRUS_CHECK_INTERVAL) {
            return this.walrusAvailable;
        }
        try {
            // Simple availability check (implement actual Walrus ping)
            // For now, just return the current status
            this.lastWalrusCheck = now;
            return this.walrusAvailable;
        }
        catch (error) {
            this.walrusAvailable = false;
            return false;
        }
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * Get cache info
     */
    getCacheInfo() {
        let totalSize = 0;
        let oldest = null;
        let newest = null;
        for (const cached of this.cache.values()) {
            totalSize += cached.content.length;
            if (!oldest || cached.timestamp < oldest) {
                oldest = cached.timestamp;
            }
            if (!newest || cached.timestamp > newest) {
                newest = cached.timestamp;
            }
        }
        return {
            size: this.cache.size,
            totalSizeBytes: totalSize,
            oldestEntry: oldest,
            newestEntry: newest
        };
    }
    // ==================== PRIVATE METHODS ====================
    async initializeLocalStorage() {
        if (this.config.enableLocalFallback) {
            try {
                await fs.mkdir(this.config.localStorageDir, { recursive: true });
                console.log(`Local storage initialized: ${this.config.localStorageDir}`);
            }
            catch (error) {
                console.error('Failed to initialize local storage:', error);
            }
        }
    }
    async createMetadataWithEmbedding(content, category, topic, importance, customMetadata) {
        const contentBuffer = Buffer.from(content, 'utf-8');
        const contentHash = this.generateContentHash(content);
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
            customMetadata
        };
    }
    generateContentHash(content) {
        return createHash('sha256').update(content).digest('hex');
    }
    generateEncryptionKey() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    xorEncrypt(content, key) {
        let result = '';
        for (let i = 0; i < content.length; i++) {
            result += String.fromCharCode(content.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return Buffer.from(result).toString('base64');
    }
    xorDecrypt(encryptedContent, key) {
        const decoded = Buffer.from(encryptedContent, 'base64').toString();
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    }
    async uploadToWalrus(content, ownerAddress, metadata, epochs) {
        // Mock Walrus upload - replace with actual Walrus SDK calls
        const blobId = `walrus_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        // Simulate upload delay
        await this.delay(100 + Math.random() * 400);
        return blobId;
    }
    async storeLocally(content, metadata) {
        const blobId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const filePath = path.join(this.config.localStorageDir, `${blobId}.json`);
        const data = {
            content,
            metadata,
            timestamp: new Date().toISOString()
        };
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return blobId;
    }
    async retrieveFromWalrus(blobId) {
        // Mock Walrus retrieval - replace with actual Walrus SDK calls
        throw new Error('Walrus retrieval not implemented - using local fallback');
    }
    async retrieveLocally(blobId) {
        const filePath = path.join(this.config.localStorageDir, `${blobId}.json`);
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            const parsed = JSON.parse(data);
            return {
                content: Buffer.from(parsed.content),
                metadata: parsed.metadata
            };
        }
        catch (error) {
            throw new Error(`Local retrieval failed: ${(error instanceof Error ? error.message : 'Unknown error')}`);
        }
    }
    async checkLocalStorage(blobId) {
        const filePath = path.join(this.config.localStorageDir, `${blobId}.json`);
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async deleteLocally(blobId) {
        const filePath = path.join(this.config.localStorageDir, `${blobId}.json`);
        try {
            await fs.unlink(filePath);
        }
        catch (error) {
            // File might not exist, which is fine
            console.debug(`Local file not found for deletion: ${blobId}`);
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
    createUploadResult(blobId, metadata, isEncrypted, uploadTime, backupKey) {
        return {
            blobId,
            metadata,
            embeddingBlobId: metadata.embeddingBlobId,
            isEncrypted,
            backupKey,
            storageEpochs: this.config.storageEpochs,
            uploadTimeMs: uploadTime
        };
    }
    updateCacheHitRate(isHit) {
        if (isHit) {
            this.stats.cacheHitRate = (this.stats.cacheHitRate * (this.stats.totalRetrievals - 1) + 1) / this.stats.totalRetrievals;
        }
        else {
            this.stats.cacheHitRate = (this.stats.cacheHitRate * (this.stats.totalRetrievals - 1)) / this.stats.totalRetrievals;
        }
    }
    updateAverageUploadTime(uploadTime) {
        this.stats.averageUploadTime = (this.stats.averageUploadTime * (this.stats.successfulUploads - 1) + uploadTime) / this.stats.successfulUploads;
    }
    updateAverageRetrievalTime(retrievalTime) {
        this.stats.averageRetrievalTime = (this.stats.averageRetrievalTime * (this.stats.totalRetrievals - 1) + retrievalTime) / this.stats.totalRetrievals;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
export default WalrusService;
//# sourceMappingURL=WalrusService.js.map