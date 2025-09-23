/**
 * BatchingService - Intelligent Batch Processing & Caching
 *
 * Provides advanced batching capabilities with intelligent scheduling,
 * cache management, and performance optimization for the PDW SDK.
 */
import { BatchConfig, BatchStats } from '../embedding/types';
export interface BatchItem<T = any> {
    id: string;
    data: T;
    timestamp: Date;
    priority?: number;
    metadata?: any;
}
export interface BatchProcessor<T = any> {
    process(items: BatchItem<T>[]): Promise<void>;
}
export interface CacheConfig {
    maxSize?: number;
    ttlMs?: number;
    cleanupIntervalMs?: number;
    enableMetrics?: boolean;
}
export interface CacheItem<T = any> {
    key: string;
    value: T;
    createdAt: Date;
    accessedAt: Date;
    accessCount: number;
    size?: number;
}
export interface CacheMetrics {
    totalItems: number;
    totalSize: number;
    hitCount: number;
    missCount: number;
    hitRate: number;
    averageAccessCount: number;
    oldestItem?: Date;
    newestItem?: Date;
}
/**
 * Advanced batching service with intelligent scheduling and caching
 */
export declare class BatchingService<T = any> {
    private batches;
    private processors;
    private timers;
    private cache;
    private metrics;
    private readonly batchConfig;
    private readonly cacheConfig;
    private cleanupTimer?;
    constructor(batchConfig?: Partial<BatchConfig>, cacheConfig?: Partial<CacheConfig>);
    /**
     * Register a batch processor for a specific batch type
     */
    registerProcessor(batchType: string, processor: BatchProcessor<T>): void;
    /**
     * Add item to batch for processing
     */
    addToBatch(batchType: string, item: BatchItem<T>, options?: {
        forceImmediate?: boolean;
        highPriority?: boolean;
    }): void;
    /**
     * Process batch immediately
     */
    processBatchNow(batchType: string): Promise<void>;
    /**
     * Get cached value
     */
    getFromCache<R = T>(key: string): R | undefined;
    /**
     * Set cached value
     */
    setInCache<R = T>(key: string, value: R, metadata?: any): void;
    /**
     * Remove from cache
     */
    removeFromCache(key: string): boolean;
    /**
     * Clear entire cache
     */
    clearCache(): void;
    /**
     * Get batch statistics
     */
    getBatchStats(): BatchStats & {
        cache: CacheMetrics;
        processing: {
            totalProcessed: number;
            averageProcessingTime: number;
        };
    };
    /**
     * Get pending batch info
     */
    getPendingBatches(): Array<{
        batchType: string;
        itemCount: number;
        oldestItem: Date;
        scheduledProcessing: Date | null;
    }>;
    /**
     * Force process all pending batches
     */
    processAllBatches(): Promise<void>;
    /**
     * Cleanup and destroy service
     */
    destroy(): void;
    private scheduleBatchProcessing;
    private startCacheCleanup;
    private cleanupExpiredItems;
    private evictOldestItems;
    private getCacheHitRate;
    private getCacheMetrics;
    private calculateSize;
}
export default BatchingService;
//# sourceMappingURL=BatchingService.d.ts.map