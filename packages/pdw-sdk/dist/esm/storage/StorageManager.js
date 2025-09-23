/**
 * StorageManager - Unified Storage Operations Manager
 *
 * Orchestrates Walrus storage operations with intelligent batching,
 * encryption management, and seamless integration with memory processing.
 */
import { WalrusService } from './WalrusService';
/**
 * Unified storage manager coordinating multiple storage providers
 */
export class StorageManager {
    constructor(config = {}) {
        this.pendingOperations = new Map();
        this.batchQueue = [];
        this.stats = {
            totalOperations: 0,
            successfulUploads: 0,
            failedUploads: 0,
            totalRetrievals: 0,
            storageProviders: {
                walrus: { uploads: 0, retrievals: 0, success_rate: 0 },
                local: { uploads: 0, retrievals: 0, success_rate: 0 }
            },
            averageUploadTime: 0,
            averageRetrievalTime: 0,
            totalStorageUsed: 0,
            encryptionRate: 0,
            compressionSavings: 0
        };
        this.config = {
            walrusConfig: {
                network: config.walrusConfig?.network || 'testnet',
                enableEncryption: config.walrusConfig?.enableEncryption !== false,
                enableBatching: config.walrusConfig?.enableBatching !== false,
                batchSize: config.walrusConfig?.batchSize || 10,
                batchDelayMs: config.walrusConfig?.batchDelayMs || 5000
            },
            enableDistributedStorage: config.enableDistributedStorage !== false,
            enableCompressionn: config.enableCompressionn !== false,
            retentionPolicyDays: config.retentionPolicyDays || 365
        };
        // Initialize Walrus service
        this.walrusService = new WalrusService({
            network: this.config.walrusConfig.network,
            enableLocalFallback: true
        });
    }
    // ==================== MEMORY STORAGE OPERATIONS ====================
    /**
     * Store processed memory with comprehensive options
     */
    async storeMemory(memory, userId, options = {}) {
        const startTime = Date.now();
        this.stats.totalOperations++;
        try {
            // Check for duplicate operation
            const operationKey = `${memory.id}_${userId}`;
            const existingOperation = this.pendingOperations.get(operationKey);
            if (existingOperation) {
                return await existingOperation;
            }
            // Create operation promise
            const operationPromise = this.executeStoreOperation(memory, userId, options);
            this.pendingOperations.set(operationKey, operationPromise);
            try {
                const result = await operationPromise;
                this.updateStorageStats(result);
                return result;
            }
            finally {
                this.pendingOperations.delete(operationKey);
            }
        }
        catch (error) {
            this.stats.failedUploads++;
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                processingTimeMs: Date.now() - startTime,
                isEncrypted: false,
                storageProvider: 'local'
            };
        }
    }
    /**
     * Store multiple memories in batch
     */
    async storeMemoryBatch(operations, options = {}) {
        const startTime = Date.now();
        const maxConcurrent = options.maxConcurrent || 5;
        const successful = [];
        const failed = [];
        // Sort by priority (high -> normal -> low)
        const sortedOps = [...operations].sort((a, b) => {
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            const aPriority = priorityOrder[a.priority || 'normal'];
            const bPriority = priorityOrder[b.priority || 'normal'];
            return bPriority - aPriority;
        });
        // Process in batches to control concurrency
        for (let i = 0; i < sortedOps.length; i += maxConcurrent) {
            const batch = sortedOps.slice(i, i + maxConcurrent);
            const batchPromises = batch.map(async (op) => {
                try {
                    const result = await this.storeMemory(op.memory, op.userId, {
                        priority: op.priority,
                        enableEncryption: op.encryptionRequired
                    });
                    if (result.success) {
                        successful.push(result);
                    }
                    else {
                        failed.push({ memory: op.memory, error: result.error || 'Unknown error' });
                    }
                }
                catch (error) {
                    failed.push({ memory: op.memory, error: error instanceof Error ? error.message : 'Unknown error' });
                }
            });
            await Promise.all(batchPromises);
            // Progress callback
            if (options.onProgress) {
                options.onProgress(i + batch.length, operations.length);
            }
        }
        const totalTime = Date.now() - startTime;
        const averageTime = operations.length > 0 ? totalTime / operations.length : 0;
        return {
            successful,
            failed,
            totalProcessingTime: totalTime,
            averageProcessingTime: averageTime
        };
    }
    /**
     * Add memory to batch queue for deferred processing
     */
    addToBatchQueue(memory, userId, options = {}) {
        this.batchQueue.push({
            memory,
            userId,
            priority: options.priority || 'normal',
            encryptionRequired: options.encryptionRequired
        });
        // Schedule batch processing
        this.scheduleBatchProcessing();
    }
    /**
     * Process pending batch queue
     */
    async processBatchQueue() {
        if (this.batchQueue.length === 0) {
            return {
                successful: [],
                failed: [],
                totalProcessingTime: 0,
                averageProcessingTime: 0
            };
        }
        const operations = [...this.batchQueue];
        this.batchQueue.length = 0; // Clear queue
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = undefined;
        }
        return await this.storeMemoryBatch(operations);
    }
    // ==================== RETRIEVAL OPERATIONS ====================
    /**
     * Retrieve memory by blob ID
     */
    async retrieveMemory(blobId, options = {}) {
        const startTime = Date.now();
        this.stats.totalRetrievals++;
        try {
            const result = await this.walrusService.retrieveContent(blobId, options.decryptionKey);
            // Parse content as memory
            let memory = null;
            try {
                const parsed = JSON.parse(result.content);
                if (parsed && typeof parsed === 'object' && parsed.id) {
                    memory = parsed;
                }
            }
            catch {
                // Content might not be a memory object
            }
            this.updateRetrievalStats(Date.now() - startTime);
            return {
                memory,
                metadata: options.includeMetadata ? result.metadata : null,
                retrievalTimeMs: result.retrievalTimeMs,
                isFromCache: result.isFromCache
            };
        }
        catch (error) {
            console.error('Memory retrieval failed:', error);
            return {
                memory: null,
                metadata: null,
                retrievalTimeMs: Date.now() - startTime,
                isFromCache: false
            };
        }
    }
    /**
     * Retrieve multiple memories by blob IDs
     */
    async retrieveMemoryBatch(blobIds, options = {}) {
        const batchSize = options.batchSize || 10;
        const results = [];
        // Process in batches
        for (let i = 0; i < blobIds.length; i += batchSize) {
            const batch = blobIds.slice(i, i + batchSize);
            const batchPromises = batch.map(async (blobId) => {
                try {
                    const decryptionKey = options.decryptionKeys?.[blobId] || options.decryptionKey;
                    const result = await this.retrieveMemory(blobId, { ...options, decryptionKey });
                    return {
                        blobId,
                        memory: result.memory,
                        metadata: result.metadata,
                        success: result.memory !== null
                    };
                }
                catch (error) {
                    return {
                        blobId,
                        memory: null,
                        metadata: null,
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            });
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }
        return results;
    }
    // ==================== STORAGE MANAGEMENT ====================
    /**
     * List user's stored memories
     */
    async listUserMemories(userId, options = {}) {
        try {
            const blobs = await this.walrusService.listUserBlobs(userId, {
                category: options.category,
                limit: options.limit,
                offset: options.offset,
                sortBy: options.sortBy
            });
            const memories = [];
            for (const blob of blobs) {
                try {
                    const result = await this.retrieveMemory(blob.blobId, {
                        includeMetadata: options.includeMetadata
                    });
                    if (result.memory) {
                        memories.push({
                            memory: result.memory,
                            blobId: blob.blobId,
                            metadata: result.metadata,
                            blobInfo: blob
                        });
                    }
                }
                catch (error) {
                    console.warn(`Failed to retrieve memory ${blob.blobId}:`, error);
                }
            }
            return memories;
        }
        catch (error) {
            console.error('Failed to list user memories:', error);
            return [];
        }
    }
    /**
     * Delete stored memory
     */
    async deleteMemory(blobId) {
        try {
            return await this.walrusService.deleteBlob(blobId);
        }
        catch (error) {
            console.error('Failed to delete memory:', error);
            return false;
        }
    }
    /**
     * Get storage analytics
     */
    getStorageAnalytics() {
        const walrusStats = this.walrusService.getStats();
        const cacheInfo = this.walrusService.getCacheInfo();
        return {
            ...this.stats,
            walrusService: walrusStats,
            cache: cacheInfo,
            batchQueue: {
                pending: this.batchQueue.length,
                operations: this.pendingOperations.size
            }
        };
    }
    /**
     * Cleanup old data based on retention policy
     */
    async cleanupOldData() {
        // TODO: Implement cleanup based on retention policy
        return {
            deletedCount: 0,
            freedSpaceBytes: 0
        };
    }
    // ==================== PRIVATE METHODS ====================
    async executeStoreOperation(memory, userId, options) {
        const startTime = Date.now();
        try {
            // Prepare memory data
            const memoryData = JSON.stringify(memory);
            // Prepare metadata
            const customMetadata = {
                owner: userId,
                memoryId: memory.id,
                ...options.customMetadata
            };
            // Upload to Walrus
            const uploadResult = await this.walrusService.uploadContentWithMetadata(memoryData, userId, {
                category: memory.category,
                topic: memory.metadata?.topic,
                importance: memory.metadata?.importance || 5,
                additionalTags: customMetadata,
                enableEncryption: options.enableEncryption
            });
            this.stats.successfulUploads++;
            this.updateUploadStats(Date.now() - startTime);
            this.stats.totalStorageUsed += uploadResult.metadata.contentSize;
            if (uploadResult.isEncrypted) {
                this.updateEncryptionRate(true);
            }
            return {
                success: true,
                blobId: uploadResult.blobId,
                metadata: uploadResult.metadata,
                processingTimeMs: uploadResult.uploadTimeMs,
                isEncrypted: uploadResult.isEncrypted,
                storageProvider: 'walrus'
            };
        }
        catch (error) {
            this.stats.failedUploads++;
            throw error;
        }
    }
    scheduleBatchProcessing() {
        if (this.batchTimer) {
            return; // Already scheduled
        }
        // Process when batch is full or after delay
        if (this.batchQueue.length >= (this.config.walrusConfig?.batchSize || 10)) {
            this.processBatchQueue();
        }
        else {
            this.batchTimer = setTimeout(() => {
                this.processBatchQueue();
            }, this.config.walrusConfig.batchDelayMs);
        }
    }
    updateStorageStats(result) {
        if (result.success) {
            if (result.storageProvider === 'walrus') {
                this.stats.storageProviders.walrus.uploads++;
            }
            else if (result.storageProvider === 'local') {
                this.stats.storageProviders.local.uploads++;
            }
        }
        // Update success rates
        this.updateProviderSuccessRates();
    }
    updateUploadStats(uploadTime) {
        this.stats.averageUploadTime =
            (this.stats.averageUploadTime * (this.stats.successfulUploads - 1) + uploadTime) / this.stats.successfulUploads;
    }
    updateRetrievalStats(retrievalTime) {
        this.stats.averageRetrievalTime =
            (this.stats.averageRetrievalTime * (this.stats.totalRetrievals - 1) + retrievalTime) / this.stats.totalRetrievals;
    }
    updateEncryptionRate(isEncrypted) {
        const total = this.stats.successfulUploads;
        if (isEncrypted) {
            this.stats.encryptionRate = (this.stats.encryptionRate * (total - 1) + 1) / total;
        }
        else {
            this.stats.encryptionRate = (this.stats.encryptionRate * (total - 1)) / total;
        }
    }
    updateProviderSuccessRates() {
        const walrusTotal = this.stats.storageProviders.walrus.uploads + this.stats.storageProviders.walrus.retrievals;
        const localTotal = this.stats.storageProviders.local.uploads + this.stats.storageProviders.local.retrievals;
        if (walrusTotal > 0) {
            this.stats.storageProviders.walrus.success_rate =
                this.stats.storageProviders.walrus.uploads / walrusTotal;
        }
        if (localTotal > 0) {
            this.stats.storageProviders.local.success_rate =
                this.stats.storageProviders.local.uploads / localTotal;
        }
    }
}
export default StorageManager;
//# sourceMappingURL=StorageManager.js.map