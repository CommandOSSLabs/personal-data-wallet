/**
 * BatchService - Unified Batch Processing & Caching
 *
 * Consolidated service combining intelligent batch processing, caching,
 * and coordination for all PDW SDK operations.
 *
 * Replaces: BatchingService + BatchManager
 */
import { EventEmitter } from 'events';
import type { BatchStats } from '../core';
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
    timestamp: Date;
    expiresAt?: Date;
    accessCount: number;
    lastAccessed: Date;
}
export interface BatchServiceConfig {
    embedding?: {
        batchSize?: number;
        delayMs?: number;
    };
    indexing?: {
        batchSize?: number;
        delayMs?: number;
    };
    storage?: {
        batchSize?: number;
        delayMs?: number;
    };
    cache?: CacheConfig;
    enableMetrics?: boolean;
}
/**
 * BatchService provides unified batch processing including:
 * - Intelligent batching with configurable delays and sizes
 * - LRU cache with TTL support
 * - Event-driven batch coordination
 * - Performance metrics and monitoring
 */
export declare class BatchService extends EventEmitter {
    private config;
    private queues;
    private processors;
    private timers;
    private cache;
    private stats;
    constructor(config?: BatchServiceConfig);
    /**
     * Register a batch processor for a specific operation type
     */
    registerProcessor<T>(type: string, processor: BatchProcessor<T>): void;
    /**
     * Add item to batch queue
     */
    addToBatch<T>(type: string, item: BatchItem<T>): Promise<void>;
    /**
     * Process batch immediately
     */
    processBatch(type: string): Promise<void>;
    /**
     * Cache operations
     */
    setCache<T>(key: string, value: T, ttlMs?: number): void;
    getCache<T>(key: string): T | null;
    hasCache(key: string): boolean;
    deleteCache(key: string): boolean;
    clearCache(): void;
    /**
     * Get batch statistics
     */
    getStats(type?: string): BatchStats | Map<string, BatchStats>;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        totalAccess: number;
        hitRate: number;
        oldestItem?: Date;
        newestItem?: Date;
    };
    /**
     * Clean up resources
     */
    cleanup(): Promise<void>;
    private getBatchConfig;
    private scheduleProcessing;
    private enforceMaxCacheSize;
    private setupCleanupTimer;
}
//# sourceMappingURL=BatchService.d.ts.map