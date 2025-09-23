/**
 * HnswIndexService - Local HNSW Vector Indexing
 *
 * Provides local Hierarchical Navigable Small World (HNSW) vector indexing
 * with intelligent batching, caching, and Walrus persistence for the PDW SDK.
 */
import * as hnswlib from 'hnswlib-node';
import { StorageService } from '../storage/StorageService';
import { HNSWIndexConfig, HNSWSearchResult, HNSWSearchOptions, BatchConfig, BatchStats } from '../embedding/types';
/**
 * Local HNSW vector indexing service with batching and Walrus persistence
 */
export declare class HnswIndexService {
    private storageService;
    private readonly indexCache;
    private readonly batchJobs;
    private readonly config;
    private readonly indexConfig;
    private batchProcessor?;
    private cacheCleanup?;
    constructor(storageService: StorageService, indexConfig?: Partial<HNSWIndexConfig>, batchConfig?: Partial<BatchConfig>);
    /**
     * Create a new HNSW index
     */
    createIndex(userAddress: string, options?: Partial<HNSWIndexConfig>): Promise<{
        index: hnswlib.HierarchicalNSW;
        serialized: Buffer;
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
     * Load index from Walrus storage
     */
    loadIndex(blobId: string, userAddress: string): Promise<hnswlib.HierarchicalNSW>;
    /**
     * Save index to Walrus storage
     */
    saveIndex(userAddress: string): Promise<string>;
    /**
     * Force flush all pending vectors for a user
     */
    forceFlush(userAddress: string): Promise<void>;
    /**
     * Get cache statistics
     */
    getCacheStats(): BatchStats;
    /**
     * Remove a vector from the index
     */
    removeVector(userAddress: string, vectorId: number): void;
    /**
     * Clear user index and cache
     */
    clearUserIndex(userAddress: string): void;
    /**
     * Cleanup resources
     */
    destroy(): void;
    private createCacheEntry;
    private scheduleBatchJob;
    private startBatchProcessor;
    private startCacheCleanup;
    private processBatchJobs;
    private flushPendingVectors;
    private saveIndexToWalrus;
    private cloneIndexWithPending;
    private applyMetadataFilter;
    private cleanupCache;
    private validateVector;
    private getTempFilePath;
    private cleanupTempFile;
    private createVectorError;
}
export default HnswIndexService;
//# sourceMappingURL=HnswIndexService.d.ts.map