/**
 * VectorService - HNSW vector indexing and similarity search
 */
import { VectorConfig, VectorSearchOptions, VectorSearchResult } from '../types';
export declare class VectorService {
    private indices;
    private vectorData;
    private vectorIdCounters;
    private config;
    constructor(config?: VectorConfig);
    /**
     * Initialize or get HNSW index for a user
     */
    private getOrCreateIndex;
    /**
     * Add vector to user's index
     */
    addVector(userId: string, vector: number[], text: string, metadata?: any): number;
    /**
     * Search for similar vectors
     */
    searchSimilar(userId: string, queryVector: number[], options?: VectorSearchOptions): Promise<VectorSearchResult>;
    /**
     * Save index to binary data (for Walrus storage)
     */
    saveIndex(userId: string): Uint8Array | null;
    /**
     * Load index from binary data (from Walrus storage)
     */
    loadIndex(userId: string, data: Uint8Array): boolean;
    /**
     * Get index statistics
     */
    getIndexStats(userId: string): {
        vectorCount: number;
        indexSize: number;
        memoryUsage: number;
    };
    /**
     * Clear user's index
     */
    clearIndex(userId: string): void;
    /**
     * Get next vector ID for user
     */
    private getNextVectorId;
}
//# sourceMappingURL=VectorService.d.ts.map