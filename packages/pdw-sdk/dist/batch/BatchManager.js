"use strict";
/**
 * BatchManager - Central orchestrator for all batch processing operations
 *
 * Coordinates embedding generation, vector indexing, knowledge graph updates,
 * and Walrus operations through intelligent batching and caching.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchManager = void 0;
const events_1 = require("events");
const BatchingService_1 = require("./BatchingService");
const MemoryProcessingCache_1 = require("./MemoryProcessingCache");
/**
 * Central batch processing manager with integrated caching and monitoring
 */
class BatchManager extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.jobStatuses = new Map();
        this.metrics = {
            totalProcessingTime: 0,
            averageMemoryProcessingTime: 0,
            successfulBatches: 0,
            failedBatches: 0,
            totalMemoriesProcessed: 0
        };
        this.config = {
            embedding: {
                batchSize: config.embedding?.batchSize || 20,
                delayMs: config.embedding?.delayMs || 5000
            },
            indexing: {
                batchSize: config.indexing?.batchSize || 50,
                delayMs: config.indexing?.delayMs || 3000
            },
            walrus: {
                batchSize: config.walrus?.batchSize || 10,
                delayMs: config.walrus?.delayMs || 8000
            },
            cache: {
                maxSize: config.cache?.maxSize || 5000,
                ttlMs: config.cache?.ttlMs || 60 * 60 * 1000
            },
            enableMetrics: config.enableMetrics !== false
        };
        // Initialize services
        this.initializeBatchingServices();
        this.cache = new MemoryProcessingCache_1.MemoryProcessingCache(this.config.cache);
    }
    // ==================== SERVICE INITIALIZATION ====================
    /**
     * Initialize with required services
     */
    initialize(services) {
        this.embeddingService = services.embeddingService;
        this.indexService = services.indexService;
        console.log('BatchManager initialized with services');
    }
    // ==================== MEMORY PROCESSING PIPELINE ====================
    /**
     * Add memory to complete processing pipeline
     */
    async addMemoryToPipeline(memory, options = {}) {
        const jobId = this.generateJobId();
        // Check cache first (unless skipped)
        if (!options.skipCache) {
            const cached = this.cache.getCachedMemory(memory.id);
            if (cached?.processingState === 'completed') {
                this.emit('memory:cached', { memoryId: memory.id, cached });
                return jobId;
            }
        }
        // Create job status
        this.jobStatuses.set(jobId, {
            id: jobId,
            type: 'pipeline',
            status: 'pending',
            itemCount: 1,
            startTime: new Date()
        });
        try {
            // Cache memory as pending
            this.cache.cacheMemory(memory);
            this.cache.updateMemoryState(memory.id, 'pending');
            // Add to processing pipeline
            if (options.immediateProcessing) {
                await this.processMemoryImmediate(memory);
            }
            else {
                // Add to embedding batch
                this.embeddingBatcher.addToBatch('memories', {
                    id: memory.id,
                    data: memory,
                    timestamp: new Date(),
                    priority: this.getPriorityValue(options.priority),
                    metadata: { originalJobId: jobId }
                });
            }
            this.updateJobStatus(jobId, 'processing');
            this.emit('memory:queued', { memoryId: memory.id, jobId });
        }
        catch (error) {
            this.updateJobStatus(jobId, 'failed', error);
            this.cache.updateMemoryState(memory.id, 'failed', error.message);
            throw error;
        }
        return jobId;
    }
    /**
     * Process multiple memories in batch
     */
    async addMemoriesToPipeline(memories, options = {}) {
        const batchSize = options.batchSize || this.config.embedding.batchSize;
        const jobIds = [];
        // Process in smaller batches to avoid overwhelming the system
        const safeBatchSize = batchSize || 10;
        for (let i = 0; i < memories.length; i += safeBatchSize) {
            const batch = memories.slice(i, i + safeBatchSize);
            for (const memory of batch) {
                try {
                    const jobId = await this.addMemoryToPipeline(memory, options);
                    jobIds.push(jobId);
                }
                catch (error) {
                    console.error(`Failed to add memory ${memory.id} to pipeline:`, error);
                    // Continue with other memories
                }
            }
            // Small delay between batches
            if (i + safeBatchSize < memories.length) {
                await this.delay(100);
            }
        }
        return jobIds;
    }
    // ==================== BATCH PROCESSING CONTROL ====================
    /**
     * Process all pending batches immediately
     */
    async processAllBatches() {
        console.log('Processing all pending batches...');
        try {
            await Promise.all([
                this.embeddingBatcher.processAllBatches(),
                this.indexingBatcher.processAllBatches(),
                this.walrusBatcher.processAllBatches()
            ]);
            console.log('All batches processed successfully');
        }
        catch (error) {
            console.error('Error processing batches:', error);
            throw error;
        }
    }
    /**
     * Get status of specific job
     */
    getJobStatus(jobId) {
        return this.jobStatuses.get(jobId);
    }
    /**
     * Get all job statuses
     */
    getAllJobStatuses() {
        return Array.from(this.jobStatuses.values());
    }
    /**
     * Get pending jobs count by type
     */
    getPendingJobsCount() {
        const counts = { embedding: 0, indexing: 0, walrus: 0, pipeline: 0 };
        for (const job of this.jobStatuses.values()) {
            if (job.status === 'pending' || job.status === 'processing') {
                counts[job.type]++;
            }
        }
        return counts;
    }
    // ==================== CACHING OPERATIONS ====================
    /**
     * Get cached memory
     */
    getCachedMemory(memoryId) {
        return this.cache.getCachedMemory(memoryId);
    }
    /**
     * Find similar memories
     */
    findSimilarMemories(memoryId, limit) {
        return this.cache.findSimilarMemories(memoryId, limit);
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return this.cache.getStats();
    }
    /**
     * Clear all caches
     */
    clearCaches() {
        this.cache.clearAll();
        this.jobStatuses.clear();
    }
    // ==================== STATISTICS & MONITORING ====================
    /**
     * Get comprehensive batch manager statistics
     */
    getStats() {
        const embeddingStats = this.embeddingBatcher.getBatchStats();
        const indexingStats = this.indexingBatcher.getBatchStats();
        const walrusStats = this.walrusBatcher.getBatchStats();
        const cacheStats = this.cache.getStats();
        return {
            // Aggregate stats
            totalUsers: Math.max(embeddingStats.totalUsers, indexingStats.totalUsers, walrusStats.totalUsers),
            totalPendingVectors: embeddingStats.totalPendingVectors + indexingStats.totalPendingVectors,
            activeBatchJobs: embeddingStats.activeBatchJobs + indexingStats.activeBatchJobs + walrusStats.activeBatchJobs,
            cacheHitRate: cacheStats.performance.hitRateMemories,
            averageBatchSize: (embeddingStats.averageBatchSize + indexingStats.averageBatchSize + walrusStats.averageBatchSize) / 3,
            averageProcessingTime: this.metrics.averageMemoryProcessingTime,
            // Individual managers
            managers: {
                embedding: embeddingStats,
                indexing: indexingStats,
                walrus: walrusStats
            },
            // Cache stats
            cache: cacheStats,
            // Performance metrics
            performance: {
                totalProcessingTime: this.metrics.totalProcessingTime,
                averageMemoryProcessingTime: this.metrics.averageMemoryProcessingTime,
                successfulBatches: this.metrics.successfulBatches,
                failedBatches: this.metrics.failedBatches
            }
        };
    }
    /**
     * Cleanup and destroy batch manager
     */
    destroy() {
        // Destroy all batching services
        this.embeddingBatcher.destroy();
        this.indexingBatcher.destroy();
        this.walrusBatcher.destroy();
        // Destroy cache
        this.cache.destroy();
        // Clear job statuses
        this.jobStatuses.clear();
        // Remove all listeners
        this.removeAllListeners();
        console.log('BatchManager destroyed');
    }
    // ==================== PRIVATE METHODS ====================
    initializeBatchingServices() {
        // Initialize embedding batcher
        this.embeddingBatcher = new BatchingService_1.BatchingService({
            maxBatchSize: this.config.embedding.batchSize,
            batchDelayMs: this.config.embedding.delayMs
        });
        // Initialize indexing batcher
        this.indexingBatcher = new BatchingService_1.BatchingService({
            maxBatchSize: this.config.indexing.batchSize,
            batchDelayMs: this.config.indexing.delayMs
        });
        // Initialize Walrus batcher
        this.walrusBatcher = new BatchingService_1.BatchingService({
            maxBatchSize: this.config.walrus.batchSize,
            batchDelayMs: this.config.walrus.delayMs
        });
        // Register processors
        this.registerBatchProcessors();
    }
    registerBatchProcessors() {
        // Embedding processor
        this.embeddingBatcher.registerProcessor('memories', {
            process: async (items) => {
                await this.processEmbeddingBatch(items.map(item => item.data));
            }
        });
        // Indexing processor
        this.indexingBatcher.registerProcessor('processed-memories', {
            process: async (items) => {
                await this.processIndexingBatch(items.map(item => item.data));
            }
        });
        // Walrus processor
        this.walrusBatcher.registerProcessor('walrus-uploads', {
            process: async (items) => {
                await this.processWalrusBatch(items.map(item => item.data));
            }
        });
    }
    async processEmbeddingBatch(memories) {
        if (!this.embeddingService) {
            console.warn('EmbeddingService not initialized');
            return;
        }
        console.log(`Processing embedding batch of ${memories.length} memories`);
        const startTime = Date.now();
        try {
            // Generate embeddings in batch
            const results = await this.embeddingService.embedBatch(memories.map(m => m.content));
            // Process results
            for (let i = 0; i < memories.length; i++) {
                const memory = memories[i];
                const embedding = results.vectors[i];
                if (embedding && embedding.length > 0) {
                    const processedMemory = {
                        ...memory,
                        embedding: embedding,
                        embeddingModel: 'gemini-embedding',
                        processedAt: new Date()
                    };
                    // Update cache
                    this.cache.cacheMemory(memory, processedMemory);
                    this.cache.updateMemoryState(memory.id, 'completed');
                    // Add to indexing batch
                    this.indexingBatcher.addToBatch('processed-memories', {
                        id: memory.id,
                        data: processedMemory,
                        timestamp: new Date()
                    });
                    this.emit('memory:embedded', { memoryId: memory.id, embedding: embedding });
                }
                else {
                    this.cache.updateMemoryState(memory.id, 'failed', 'Embedding generation failed');
                    this.emit('memory:embedding-failed', { memoryId: memory.id, error: 'Embedding generation failed' });
                }
            }
            const processingTime = Date.now() - startTime;
            this.updateMetrics(memories.length, processingTime, true);
        }
        catch (error) {
            console.error('Embedding batch processing failed:', error);
            // Update all memories as failed
            for (const memory of memories) {
                this.cache.updateMemoryState(memory.id, 'failed', error.message);
            }
            this.updateMetrics(memories.length, Date.now() - startTime, false);
            throw error;
        }
    }
    async processIndexingBatch(processedMemories) {
        if (!this.indexService) {
            console.warn('HnswIndexService not initialized');
            return;
        }
        console.log(`Processing indexing batch of ${processedMemories.length} memories`);
        try {
            // Add to HNSW index
            for (const memory of processedMemories) {
                this.indexService?.addVectorToIndexBatched(memory.userId || 'default-user', parseInt(memory.id) || Date.now(), memory.embedding || [], {
                    content: memory.content,
                    category: memory.category,
                    timestamp: memory.createdAt
                });
                this.emit('memory:indexed', { memoryId: memory.id });
            }
            // Flush pending vectors
            if (this.indexService) {
                await this.indexService.forceFlush('batch-operation');
            }
        }
        catch (error) {
            console.error('Indexing batch processing failed:', error);
            throw error;
        }
    }
    async processWalrusBatch(processedMemories) {
        console.log(`Processing Walrus batch of ${processedMemories.length} memories`);
        try {
            // TODO: Implement Walrus batch operations
            // This would involve:
            // 1. Batch upload processed memories to Walrus
            // 2. Update Sui blockchain records
            // 3. Sync with knowledge graph
            for (const memory of processedMemories) {
                this.emit('memory:stored', { memoryId: memory.id });
            }
        }
        catch (error) {
            console.error('Walrus batch processing failed:', error);
            throw error;
        }
    }
    async processMemoryImmediate(memory) {
        // Process single memory immediately (bypass batching)
        await this.processEmbeddingBatch([memory]);
    }
    updateJobStatus(jobId, status, error) {
        const job = this.jobStatuses.get(jobId);
        if (job) {
            job.status = status;
            if (status === 'completed' || status === 'failed') {
                job.endTime = new Date();
                job.processingTimeMs = job.endTime.getTime() - (job.startTime?.getTime() || 0);
            }
            if (error) {
                job.error = error.message;
            }
            this.emit('job:status-changed', { jobId, status, error });
        }
    }
    updateMetrics(itemCount, processingTimeMs, success) {
        if (success) {
            this.metrics.successfulBatches++;
        }
        else {
            this.metrics.failedBatches++;
        }
        this.metrics.totalMemoriesProcessed += itemCount;
        this.metrics.totalProcessingTime += processingTimeMs;
        this.metrics.averageMemoryProcessingTime =
            this.metrics.totalProcessingTime / this.metrics.totalMemoriesProcessed;
    }
    getPriorityValue(priority) {
        const priorityMap = { low: 0, normal: 1, high: 2 };
        return priorityMap[priority || 'normal'];
    }
    generateJobId() {
        return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.BatchManager = BatchManager;
exports.default = BatchManager;
//# sourceMappingURL=BatchManager.js.map