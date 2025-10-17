/**
 * VectorManager - High-level Vector Operations Orchestrator
 *
 * Provides a unified interface for vector operations combining
 * embedding generation and HNSW indexing with smart caching.
 * Uses hnswlib-wasm for full browser compatibility.
 */
import { StorageService } from '../services/StorageService';
import { VectorEmbedding, EmbeddingConfig, HNSWIndexConfig, BatchConfig, VectorSearchMatch } from '../embedding/types';
export interface VectorManagerConfig {
    embedding: EmbeddingConfig;
    index?: Partial<HNSWIndexConfig>;
    batch?: Partial<BatchConfig>;
    enableAutoIndex?: boolean;
    enableMemoryCache?: boolean;
}
export interface VectorOperationResult {
    success: boolean;
    vectorId?: number;
    embedding?: VectorEmbedding;
    indexBlobId?: string;
    processingTime: number;
    error?: string;
}
export interface VectorSearchStats {
    searchTime: number;
    embeddingTime: number;
    indexSearchTime: number;
    totalResults: number;
    cacheHits: number;
    indexSize: number;
}
/**
 * Unified vector operations manager
 */
export declare class VectorManager {
    private embeddingService;
    private indexService;
    private vectorIdCounter;
    private memoryCache;
    private config;
    constructor(storageService: StorageService, config: VectorManagerConfig);
    /**
     * Add text content to vector index (embed + index)
     */
    addTextToIndex(userAddress: string, text: string, options?: {
        vectorId?: number;
        metadata?: any;
        embeddingType?: 'content' | 'metadata' | 'query';
        enableCache?: boolean;
    }): Promise<VectorOperationResult>;
    /**
     * Search for similar texts using vector similarity
     */
    searchSimilarTexts(userAddress: string, queryText: string, options?: {
        k?: number;
        threshold?: number;
        efSearch?: number;
        category?: string;
        metadata?: any;
        includeEmbeddings?: boolean;
    }): Promise<{
        results: VectorSearchMatch[];
        stats: VectorSearchStats;
    }>;
    /**
     * Batch add multiple texts to index
     */
    addTextsBatch(userAddress: string, texts: Array<{
        text: string;
        metadata?: any;
        embeddingType?: 'content' | 'metadata' | 'query';
    }>, options?: {
        batchSize?: number;
        enableCache?: boolean;
    }): Promise<{
        results: VectorOperationResult[];
        stats: {
            totalTime: number;
            embeddingTime: number;
            indexingTime: number;
            successCount: number;
            failureCount: number;
        };
    }>;
    /**
     * Load user's vector index from storage
     */
    loadUserIndex(userAddress: string, indexBlobId: string): Promise<void>;
    /**
     * Save user's vector index to storage
     */
    saveUserIndex(userAddress: string): Promise<string>;
    /**
     * Force flush pending vectors for a user
     */
    forceFlushUser(userAddress: string): Promise<void>;
    /**
     * Get vector processing statistics
     */
    getStats(): {
        index: import(".").BatchStats;
        embedding: {
            totalRequests: number;
            requestsThisMinute: number;
            model: string;
            dimensions: number;
            rateLimit: number;
        };
        cache: {
            memoryCache: {
                size: number;
                enabled: boolean | undefined;
            };
            vectorIdCounters: {
                [k: string]: number;
            };
        };
    };
    /**
     * Clear cache and reset state for a user
     */
    clearUserData(userAddress: string): void;
    /**
     * Cleanup resources
     */
    destroy(): void;
    private getNextVectorId;
    private hashText;
    private matchesMetadata;
}
export default VectorManager;
//# sourceMappingURL=VectorManager.d.ts.map