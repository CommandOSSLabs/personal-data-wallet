/**
 * BatchManager - Central orchestrator for all batch processing operations
 *
 * Coordinates embedding generation, vector indexing, knowledge graph updates,
 * and Walrus operations through intelligent batching and caching.
 */
import { EventEmitter } from 'events';
import { EmbeddingService } from '../services/EmbeddingService';
import { HnswIndexService } from '../vector/HnswIndexService';
import { Memory, BatchStats } from '../embedding/types';
export interface BatchManagerConfig {
    embedding?: {
        batchSize?: number;
        delayMs?: number;
    };
    indexing?: {
        batchSize?: number;
        delayMs?: number;
    };
    walrus?: {
        batchSize?: number;
        delayMs?: number;
    };
    cache?: {
        maxSize?: number;
        ttlMs?: number;
    };
    enableMetrics?: boolean;
}
export interface BatchManagerStats extends BatchStats {
    managers: {
        embedding: BatchStats;
        indexing: BatchStats;
        walrus: BatchStats;
    };
    cache: any;
    performance: {
        totalProcessingTime: number;
        averageMemoryProcessingTime: number;
        successfulBatches: number;
        failedBatches: number;
    };
}
export interface BatchJobStatus {
    id: string;
    type: 'embedding' | 'indexing' | 'walrus' | 'pipeline';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    itemCount: number;
    startTime?: Date;
    endTime?: Date;
    error?: string;
    processingTimeMs?: number;
}
/**
 * Central batch processing manager with integrated caching and monitoring
 */
export declare class BatchManager extends EventEmitter {
    private embeddingBatcher;
    private indexingBatcher;
    private walrusBatcher;
    private cache;
    private embeddingService?;
    private indexService?;
    private readonly config;
    private jobStatuses;
    private metrics;
    constructor(config?: BatchManagerConfig);
    /**
     * Initialize with required services
     */
    initialize(services: {
        embeddingService?: EmbeddingService;
        indexService?: HnswIndexService;
    }): void;
    /**
     * Add memory to complete processing pipeline
     */
    addMemoryToPipeline(memory: Memory, options?: {
        priority?: 'low' | 'normal' | 'high';
        skipCache?: boolean;
        immediateProcessing?: boolean;
    }): Promise<string>;
    /**
     * Process multiple memories in batch
     */
    addMemoriesToPipeline(memories: Memory[], options?: {
        priority?: 'low' | 'normal' | 'high';
        batchSize?: number;
    }): Promise<string[]>;
    /**
     * Process all pending batches immediately
     */
    processAllBatches(): Promise<void>;
    /**
     * Get status of specific job
     */
    getJobStatus(jobId: string): BatchJobStatus | undefined;
    /**
     * Get all job statuses
     */
    getAllJobStatuses(): BatchJobStatus[];
    /**
     * Get pending jobs count by type
     */
    getPendingJobsCount(): Record<string, number>;
    /**
     * Get cached memory
     */
    getCachedMemory(memoryId: string): import("./MemoryProcessingCache").CachedMemory | undefined;
    /**
     * Find similar memories
     */
    findSimilarMemories(memoryId: string, limit?: number): {
        memoryId: string;
        similarity: number;
        memory?: import("./MemoryProcessingCache").CachedMemory;
    }[];
    /**
     * Get cache statistics
     */
    getCacheStats(): import("./MemoryProcessingCache").MemoryCacheStats;
    /**
     * Clear all caches
     */
    clearCaches(): void;
    /**
     * Get comprehensive batch manager statistics
     */
    getStats(): BatchManagerStats;
    /**
     * Cleanup and destroy batch manager
     */
    destroy(): void;
    private initializeBatchingServices;
    private registerBatchProcessors;
    private processEmbeddingBatch;
    private processIndexingBatch;
    private processWalrusBatch;
    private processMemoryImmediate;
    private updateJobStatus;
    private updateMetrics;
    private getPriorityValue;
    private generateJobId;
    private delay;
}
export default BatchManager;
//# sourceMappingURL=BatchManager.d.ts.map