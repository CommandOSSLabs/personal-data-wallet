"use strict";
/**
 * BlockchainManager - Memory Ownership & Metadata Management
 *
 * Orchestrates blockchain operations for memory records, manages ownership,
 * and provides seamless integration with memory processing pipeline.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainManager = void 0;
const SuiService_1 = require("./SuiService");
/**
 * Blockchain manager for memory ownership and decentralized metadata
 */
class BlockchainManager {
    constructor(config = {}) {
        this.ownershipCache = new Map();
        this.indexCache = new Map();
        this.operations = new Map();
        this.verificationCache = new Map();
        this.stats = {
            totalRecords: 0,
            memoryRecords: 0,
            indexRecords: 0,
            successfulOperations: 0,
            failedOperations: 0,
            pendingOperations: 0,
            averageProcessingTime: 0,
            totalProcessingTime: 0
        };
        this.config = {
            suiConfig: {
                network: config.suiConfig?.network || 'testnet',
                packageId: config.suiConfig?.packageId,
                adminPrivateKey: config.suiConfig?.adminPrivateKey,
                enableBatching: config.suiConfig?.enableBatching !== false,
                batchSize: config.suiConfig?.batchSize || 10,
                batchDelayMs: config.suiConfig?.batchDelayMs || 5000
            },
            enableOwnershipTracking: config.enableOwnershipTracking !== false,
            enableMetadataSync: config.enableMetadataSync !== false,
            retryAttempts: config.retryAttempts || 3,
            enableCaching: config.enableCaching !== false
        };
        // Initialize Sui service
        this.suiService = new SuiService_1.SuiService(this.config.suiConfig);
    }
    // ==================== MEMORY RECORD OPERATIONS ====================
    /**
     * Create blockchain record for processed memory
     */
    async createMemoryRecord(memory, userId, options = {}) {
        const operationId = this.generateOperationId();
        try {
            // Create operation record
            const operation = {
                id: operationId,
                type: 'create_memory',
                userId,
                status: 'pending',
                data: { memory, options },
                createdAt: new Date()
            };
            this.operations.set(operationId, operation);
            this.stats.pendingOperations++;
            // Prepare metadata for blockchain
            const blockchainMetadata = this.convertToBlockchainMetadata(memory, options.customMetadata);
            // Create blockchain record
            operation.status = 'processing';
            const startTime = Date.now();
            const result = await this.suiService.createMemoryRecord(userId, memory.category || 'general', memory.vectorId || 0, memory.blobId || '', blockchainMetadata, {
                enableBatching: options.enableBatching,
                priority: this.mapPriority(options.priority)
            });
            const processingTime = Date.now() - startTime;
            if (result.success) {
                operation.status = 'completed';
                operation.result = result;
                operation.completedAt = new Date();
                // Create ownership record
                const ownershipRecord = {
                    memoryId: memory.id,
                    userId,
                    blockchainRecordId: result.objectId || '',
                    vectorId: memory.vectorId || 0,
                    blobId: memory.blobId || '',
                    category: memory.category || 'general',
                    createdAt: new Date(),
                    transactionDigest: result.digest,
                    version: 1
                };
                // Cache the record
                if (this.config.enableCaching) {
                    this.ownershipCache.set(memory.id, ownershipRecord);
                }
                // Update statistics
                this.stats.successfulOperations++;
                this.stats.memoryRecords++;
                this.stats.totalRecords++;
                this.updateProcessingTimeStats(processingTime);
                return ownershipRecord;
            }
            else {
                operation.status = 'failed';
                operation.error = result.error;
                this.stats.failedOperations++;
                throw new Error(`Blockchain record creation failed: ${result.error}`);
            }
        }
        catch (error) {
            const operation = this.operations.get(operationId);
            if (operation) {
                operation.status = 'failed';
                operation.error = error instanceof Error ? error.message : String(error);
            }
            this.stats.failedOperations++;
            this.stats.pendingOperations = Math.max(0, this.stats.pendingOperations - 1);
            throw new Error(`Failed to create memory record: ${error instanceof Error ? error.message : String(error)}`);
        }
        finally {
            this.stats.pendingOperations = Math.max(0, this.stats.pendingOperations - 1);
        }
    }
    /**
     * Create or update memory index on blockchain
     */
    async createOrUpdateMemoryIndex(userId, indexBlobId, graphBlobId, existingIndexId, options = {}) {
        const operationId = this.generateOperationId();
        try {
            const operation = {
                id: operationId,
                type: existingIndexId ? 'update_index' : 'create_index',
                userId,
                status: 'pending',
                data: { indexBlobId, graphBlobId, existingIndexId, options },
                createdAt: new Date()
            };
            this.operations.set(operationId, operation);
            this.stats.pendingOperations++;
            operation.status = 'processing';
            const startTime = Date.now();
            let result;
            if (existingIndexId && options.expectedVersion !== undefined) {
                // Update existing index
                result = await this.suiService.updateMemoryIndex(existingIndexId, userId, options.expectedVersion, indexBlobId, graphBlobId, {
                    enableBatching: options.enableBatching,
                    priority: this.mapPriority(options.priority)
                });
            }
            else {
                // Create new index
                result = await this.suiService.createMemoryIndex(userId, indexBlobId, graphBlobId, {
                    enableBatching: options.enableBatching,
                    priority: this.mapPriority(options.priority)
                });
            }
            const processingTime = Date.now() - startTime;
            if (result.success) {
                operation.status = 'completed';
                operation.result = result;
                operation.completedAt = new Date();
                // Create or update index record
                const indexRecord = {
                    indexId: `index_${userId}_${Date.now()}`,
                    userId,
                    blockchainRecordId: result.objectId || existingIndexId || '',
                    indexBlobId,
                    graphBlobId,
                    version: existingIndexId ? (options.expectedVersion || 1) + 1 : 1,
                    createdAt: existingIndexId ? (this.indexCache.get(existingIndexId)?.createdAt || new Date()) : new Date(),
                    lastUpdated: new Date()
                };
                // Cache the record
                if (this.config.enableCaching) {
                    this.indexCache.set(indexRecord.indexId, indexRecord);
                }
                // Update statistics
                this.stats.successfulOperations++;
                if (!existingIndexId) {
                    this.stats.indexRecords++;
                    this.stats.totalRecords++;
                }
                this.updateProcessingTimeStats(processingTime);
                return indexRecord;
            }
            else {
                operation.status = 'failed';
                operation.error = result.error;
                this.stats.failedOperations++;
                throw new Error(`Index operation failed: ${result.error}`);
            }
        }
        catch (error) {
            const operation = this.operations.get(operationId);
            if (operation) {
                operation.status = 'failed';
                operation.error = error instanceof Error ? error.message : String(error);
            }
            this.stats.failedOperations++;
            this.stats.pendingOperations = Math.max(0, this.stats.pendingOperations - 1);
            throw new Error(`Failed to create/update index: ${error instanceof Error ? error.message : String(error)}`);
        }
        finally {
            this.stats.pendingOperations = Math.max(0, this.stats.pendingOperations - 1);
        }
    }
    // ==================== OWNERSHIP VERIFICATION ====================
    /**
     * Verify memory ownership
     */
    async verifyOwnership(memoryId, userId, options = {}) {
        const cacheKey = `${memoryId}_${userId}`;
        // Check cache first
        if (options.useCache && !options.forceRefresh) {
            const cached = this.verificationCache.get(cacheKey);
            if (cached && this.isCacheValid(cached.lastVerified)) {
                return cached;
            }
        }
        try {
            // Get ownership record
            const ownershipRecord = this.ownershipCache.get(memoryId);
            if (!ownershipRecord) {
                // Try to get from blockchain
                const userRecords = await this.suiService.getUserMemoryRecords(userId);
                const blockchainRecord = userRecords.find(r => r.id === memoryId);
                const verification = {
                    isOwner: blockchainRecord ? blockchainRecord.owner === userId : false,
                    ownerAddress: blockchainRecord?.owner || '',
                    recordExists: !!blockchainRecord,
                    lastVerified: new Date(),
                    blockchainRecord
                };
                // Cache the result
                this.verificationCache.set(cacheKey, verification);
                return verification;
            }
            // Verify ownership record
            const verification = {
                isOwner: ownershipRecord.userId === userId,
                ownerAddress: ownershipRecord.userId,
                recordExists: true,
                lastVerified: new Date()
            };
            // Cache the result
            this.verificationCache.set(cacheKey, verification);
            return verification;
        }
        catch (error) {
            console.error('Ownership verification failed:', error);
            return {
                isOwner: false,
                ownerAddress: '',
                recordExists: false,
                lastVerified: new Date()
            };
        }
    }
    /**
     * Get user's memory ownership records
     */
    async getUserOwnershipRecords(userId) {
        try {
            // Get from cache
            const memoryRecords = Array.from(this.ownershipCache.values())
                .filter(record => record.userId === userId);
            const indexRecords = Array.from(this.indexCache.values())
                .filter(record => record.userId === userId);
            // Get from blockchain if cache is empty or incomplete
            if (memoryRecords.length === 0) {
                const blockchainRecords = await this.suiService.getUserMemoryRecords(userId);
                for (const bcRecord of blockchainRecords) {
                    const ownershipRecord = {
                        memoryId: bcRecord.id,
                        userId: bcRecord.owner,
                        blockchainRecordId: bcRecord.id,
                        vectorId: bcRecord.vectorId,
                        blobId: bcRecord.blobId,
                        category: bcRecord.category,
                        createdAt: bcRecord.createdAt,
                        transactionDigest: '', // Not available from query
                        version: bcRecord.version
                    };
                    memoryRecords.push(ownershipRecord);
                    if (this.config.enableCaching) {
                        this.ownershipCache.set(bcRecord.id, ownershipRecord);
                    }
                }
            }
            return { memoryRecords, indexRecords };
        }
        catch (error) {
            console.error('Failed to get user ownership records:', error);
            return { memoryRecords: [], indexRecords: [] };
        }
    }
    // ==================== BATCH OPERATIONS ====================
    /**
     * Process multiple memory records in batch
     */
    async createMemoryRecordsBatch(memories, options = {}) {
        const batchSize = options.batchSize || 5;
        const results = [];
        // Process in batches
        for (let i = 0; i < memories.length; i += batchSize) {
            const batch = memories.slice(i, i + batchSize);
            const batchPromises = batch.map(async ({ memory, userId, customMetadata }) => {
                try {
                    return await this.createMemoryRecord(memory, userId, {
                        enableBatching: true,
                        customMetadata
                    });
                }
                catch (error) {
                    return { error: error instanceof Error ? error.message : String(error), memoryId: memory.id };
                }
            });
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            // Progress callback
            if (options.onProgress) {
                options.onProgress(i + batch.length, memories.length);
            }
        }
        return results;
    }
    /**
     * Flush pending blockchain operations
     */
    async flushPendingOperations() {
        return await this.suiService.flushBatchQueue();
    }
    // ==================== ANALYTICS & MONITORING ====================
    /**
     * Get comprehensive blockchain statistics
     */
    getBlockchainStats() {
        const suiStats = this.suiService.getStats();
        return {
            totalRecords: this.stats.totalRecords,
            memoryRecords: this.stats.memoryRecords,
            indexRecords: this.stats.indexRecords,
            successfulOperations: this.stats.successfulOperations,
            failedOperations: this.stats.failedOperations,
            pendingOperations: this.stats.pendingOperations,
            averageProcessingTime: this.stats.averageProcessingTime,
            gasEfficiency: {
                averageGasUsed: suiStats.averageGasUsed,
                totalGasCost: suiStats.totalGasCost,
                optimizationSavings: suiStats.batchedTransactions * 100 // Estimated savings
            },
            networkHealth: suiStats.networkHealth
        };
    }
    /**
     * Get operation status
     */
    getOperationStatus(operationId) {
        return this.operations.get(operationId) || null;
    }
    /**
     * Get pending operations
     */
    getPendingOperations() {
        return Array.from(this.operations.values())
            .filter(op => op.status === 'pending' || op.status === 'processing');
    }
    /**
     * Clear caches and reset
     */
    clearCaches() {
        this.ownershipCache.clear();
        this.indexCache.clear();
        this.verificationCache.clear();
        this.operations.clear();
    }
    // ==================== PRIVATE METHODS ====================
    convertToBlockchainMetadata(memory, customMetadata) {
        return {
            contentType: 'text/plain',
            contentSize: memory.content ? memory.content.length : 0,
            contentHash: this.generateContentHash(memory.content),
            category: memory.category || 'general',
            topic: memory.metadata?.topic || `Memory about ${memory.category || 'general'}`,
            importance: memory.metadata?.importance || 5,
            embeddingBlobId: memory.blobId || '',
            embeddingDimension: memory.embedding ? memory.embedding.length : 768,
            createdTimestamp: memory.createdAt?.getTime() || Date.now(),
            updatedTimestamp: memory.processedAt?.getTime() || memory.createdAt?.getTime() || Date.now(),
            customMetadata: {
                memoryId: memory.id,
                embeddingModel: memory.embeddingModel || 'gemini',
                ...customMetadata
            }
        };
    }
    mapPriority(priority) {
        const priorityMap = { low: 1, normal: 2, high: 3 };
        return priorityMap[priority || 'normal'];
    }
    generateContentHash(content) {
        // Simple hash - replace with proper hashing in production
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(16);
    }
    generateOperationId() {
        return `op_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
    updateProcessingTimeStats(processingTime) {
        this.stats.totalProcessingTime += processingTime;
        this.stats.averageProcessingTime =
            this.stats.totalProcessingTime / this.stats.successfulOperations;
    }
    isCacheValid(timestamp) {
        const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
        return Date.now() - timestamp.getTime() < CACHE_TTL_MS;
    }
}
exports.BlockchainManager = BlockchainManager;
exports.default = BlockchainManager;
//# sourceMappingURL=BlockchainManager.js.map