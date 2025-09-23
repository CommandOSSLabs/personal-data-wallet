/**
 * Streamlined VectorManager for HNSW Vector Operations
 */
import { EmbeddingService } from '../embedding';
import { HNSWIndexConfig, VectorSearchOptions, VectorSearchResult } from '../types';
export interface VectorIndexMetadata {
    id: number;
    text: string;
    metadata?: any;
    timestamp: number;
}
export declare class VectorManager {
    private indices;
    private metadata;
    private vectorIdCounters;
    private embeddingService;
    private config;
    constructor(embeddingService: EmbeddingService, config?: Partial<HNSWIndexConfig>);
    /**
     * Initialize or get HNSW index for a user
     */
    private getOrCreateIndex;
    /**
     * Add text to vector index (embed + index)
     */
    addTextToIndex(userId: string, text: string, options?: {
        vectorId?: number;
        metadata?: any;
    }): Promise<{
        success: boolean;
        vectorId?: number;
        embedding?: number[];
        error?: string;
    }>;
    /**
     * Search for similar texts using vector similarity
     */
    searchSimilarTexts(userId: string, queryText: string, options?: VectorSearchOptions): Promise<VectorSearchResult>;
    /**
     * Add multiple texts in batch
     */
    addTextsBatch(userId: string, texts: Array<{
        text: string;
        metadata?: any;
    }>): Promise<{
        results: Array<{
            success: boolean;
            vectorId?: number;
            error?: string;
        }>;
        successCount: number;
        failureCount: number;
    }>;
    /**
     * Save index to buffer for storage
     */
    saveIndexToBuffer(userId: string): Buffer | null;
    /**
     * Load index from buffer
     */
    loadIndexFromBuffer(userId: string, buffer: Buffer): boolean;
    /**
     * Get index statistics
     */
    getIndexStats(userId: string): {
        vectorCount: number;
        maxElements: number;
        dimension: number;
        metadataCount?: undefined;
    } | {
        vectorCount: number;
        maxElements: number;
        dimension: number;
        metadataCount: number;
    };
    /**
     * Clear user data
     */
    clearUserData(userId: string): void;
    private getNextVectorId;
}
//# sourceMappingURL=VectorManager.d.ts.map