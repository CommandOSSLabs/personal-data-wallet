/**
 * VectorService - Unified Vector Operations
 *
 * Consolidated service combining embedding generation and HNSW indexing
 * with smart caching and Walrus persistence.
 *
 * Replaces: HnswIndexService + VectorManager
 */
import { EmbeddingService } from './EmbeddingService';
import { StorageService } from './StorageService';
import { VectorEmbedding, EmbeddingConfig, HNSWIndexConfig, BatchConfig, VectorSearchOptions, VectorSearchResult } from '../embedding/types';
export interface VectorServiceConfig {
    embedding: EmbeddingConfig;
    index?: Partial<HNSWIndexConfig>;
    batch?: Partial<BatchConfig>;
    enableAutoIndex?: boolean;
    enableMemoryCache?: boolean;
}
/**
 * VectorService provides unified vector operations including:
 * - Embedding generation via EmbeddingService
 * - HNSW vector indexing and search
 * - Intelligent batching and caching
 * - Persistence via Walrus storage
 */
export declare class VectorService {
    private config;
    private embeddingService;
    private storageService;
    private indexCache;
    constructor(config: VectorServiceConfig, embeddingService?: EmbeddingService, storageService?: StorageService);
    /**
     * Generate embeddings for text content
     */
    generateEmbedding(text: string): Promise<VectorEmbedding>;
    /**
     * Create or get HNSW index for a specific space
     */
    createIndex(spaceId: string, dimension: number, config?: Partial<HNSWIndexConfig>): Promise<void>;
    /**
     * Add vector to index
     */
    addVector(spaceId: string, vectorId: number, vector: number[], metadata?: any): Promise<void>;
    /**
     * Search vectors in index
     */
    searchVectors(spaceId: string, queryVector: number[], options?: Partial<VectorSearchOptions>): Promise<VectorSearchResult>;
    /**
     * Save index to Walrus storage
     */
    saveIndex(spaceId: string): Promise<string>;
    /**
     * Load index from Walrus storage
     */
    loadIndex(spaceId: string, blobId: string): Promise<void>;
    /**
     * Process text to vector pipeline
     */
    processText(spaceId: string, text: string, vectorId: number, metadata?: any): Promise<VectorEmbedding>;
    /**
     * Search by text query
     */
    searchByText(spaceId: string, query: string, options?: Partial<VectorSearchOptions>): Promise<VectorSearchResult>;
    /**
     * Get index statistics
     */
    getIndexStats(spaceId: string): any;
    /**
     * Clean up resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=VectorService.d.ts.map