/**
 * HnswWasmService - Browser-Compatible HNSW Vector Indexing
 *
 * Provides browser-compatible Hierarchical Navigable Small World (HNSW) vector indexing
 * using hnswlib-wasm with IndexedDB persistence. Replaces Node.js-only hnswlib-node.
 *
 * Key Features:
 * - ✅ Runs in browsers (WebAssembly)
 * - ✅ IndexedDB persistence (no filesystem needed)
 * - ✅ Intelligent batching and caching
 * - ✅ Walrus storage integration
 * - ✅ Near-native performance via WASM
 */
import { type HierarchicalNSW } from 'hnswlib-wasm';
import { StorageService } from '../services/StorageService';
import { HNSWIndexConfig, HNSWSearchResult, HNSWSearchOptions, BatchConfig, BatchStats } from '../embedding/types';
/**
 * Browser-compatible HNSW vector indexing service using WebAssembly
 * Drop-in replacement for HnswIndexService with identical API
 */
export declare class HnswWasmService {
    private storageService;
    private hnswlib;
    private readonly indexCache;
    private readonly batchJobs;
    private readonly config;
    private readonly indexConfig;
    private batchProcessor?;
    private cacheCleanup?;
    private initPromise;
    constructor(storageService: StorageService, indexConfig?: Partial<HNSWIndexConfig>, batchConfig?: Partial<BatchConfig>);
    /**
     * Initialize hnswlib-wasm (must be called before use)
     */
    private initialize;
    /**
     * Ensure WASM library is loaded
     */
    private ensureInitialized;
    /**
     * Create a new HNSW index
     */
    createIndex(userAddress: string, options?: Partial<HNSWIndexConfig>): Promise<{
        index: HierarchicalNSW;
        serialized: Uint8Array;
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
    loadIndex(blobId: string, userAddress: string): Promise<HierarchicalNSW>;
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
    private applyMetadataFilter;
    private cleanupCache;
    private validateVector;
    private createVectorError;
}
export default HnswWasmService;
//# sourceMappingURL=HnswWasmService.d.ts.map