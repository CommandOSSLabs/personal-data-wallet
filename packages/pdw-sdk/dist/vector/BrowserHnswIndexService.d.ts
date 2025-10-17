/**
 * BrowserHnswIndexService - Client-Side HNSW Vector Indexing
 *
 * Browser-compatible HNSW vector indexing with IndexedDB persistence.
 * Uses hnswlib-wasm for WASM-based vector search (10-50x faster than pure JS).
 *
 * Features:
 * - WASM-powered HNSW algorithm for fast vector search
 * - IndexedDB persistence (survives page refresh)
 * - Intelligent batching and caching
 * - Metadata filtering support
 * - Zero backend dependencies
 */
import type { HNSWIndexConfig, HNSWSearchResult, HNSWSearchOptions, BatchConfig, BatchStats } from '../embedding/types';
/**
 * Browser-compatible HNSW vector indexing service with IndexedDB persistence
 */
export declare class BrowserHnswIndexService {
    private readonly indexCache;
    private readonly batchJobs;
    private readonly config;
    private readonly indexConfig;
    private batchProcessor?;
    private cacheCleanup?;
    private db?;
    private hnswLib?;
    constructor(indexConfig?: Partial<HNSWIndexConfig>, batchConfig?: Partial<BatchConfig>);
    /**
     * Initialize IndexedDB for persistence
     */
    private initializeIndexedDB;
    /**
     * Load hnswlib-wasm dynamically (only when needed)
     */
    private loadHnswLib;
    /**
     * Create a new HNSW index
     */
    createIndex(userAddress: string, options?: Partial<HNSWIndexConfig>): Promise<{
        index: any;
        serialized: ArrayBuffer;
    }>;
    /**
     * Add vector to index with batching (main entry point)
     */
    addVectorToIndexBatched(userAddress: string, vectorId: number, vector: number[], metadata?: any): void;
    /**
     * Search vectors in the index (including pending vectors)
     */
    searchVectors(userAddress: string, queryVector: number[], options?: HNSWSearchOptions): Promise<HNSWSearchResult>;
    /**
     * Load index from IndexedDB
     */
    loadIndexFromDB(userAddress: string): Promise<boolean>;
    /**
     * Save index to IndexedDB
     */
    saveIndexToDB(userAddress: string): Promise<void>;
    /**
     * Force flush all pending vectors for a user
     */
    forceFlush(userAddress: string): Promise<void>;
    /**
     * Get cache statistics
     */
    getCacheStats(): BatchStats;
    /**
     * Clear user index and cache
     */
    clearUserIndex(userAddress: string): void;
    /**
     * Cleanup resources
     */
    destroy(): void;
    private scheduleBatchJob;
    private startBatchProcessor;
    private startCacheCleanup;
    private processBatchJobs;
    private flushPendingVectors;
    private cloneIndexWithPending;
    private applyMetadataFilter;
    private cleanupCache;
    private validateVector;
    private createVectorError;
}
export default BrowserHnswIndexService;
//# sourceMappingURL=BrowserHnswIndexService.d.ts.map