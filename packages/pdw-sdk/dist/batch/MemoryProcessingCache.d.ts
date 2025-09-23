/**
 * MemoryProcessingCache - Specialized caching for memory processing
 *
 * Optimized caching service for memory data with intelligent eviction,
 * embedding similarity, and memory-specific optimization patterns.
 */
import { Memory, ProcessedMemory, MemoryMetadata } from '../embedding/types';
import { CacheConfig } from './BatchingService';
export interface MemoryCacheConfig extends CacheConfig {
    embeddingCacheSize?: number;
    memoryCacheSize?: number;
    metadataCacheSize?: number;
    similarityThreshold?: number;
    enableSimilarityIndex?: boolean;
}
export interface CachedMemory extends Memory {
    cachedAt: Date;
    accessCount: number;
    lastAccessed: Date;
    embedding?: number[];
    processingState?: 'pending' | 'processing' | 'completed' | 'failed';
    errorInfo?: {
        lastError: string;
        errorCount: number;
        lastErrorAt: Date;
    };
}
export interface CachedEmbedding {
    content: string;
    embedding: number[];
    model: string;
    createdAt: Date;
    accessCount: number;
    contentHash: string;
}
export interface MemoryCacheStats {
    memories: {
        total: number;
        byState: Record<string, number>;
        averageAccessCount: number;
    };
    embeddings: {
        total: number;
        uniqueContent: number;
        averageReuseCount: number;
    };
    performance: {
        hitRateMemories: number;
        hitRateEmbeddings: number;
        averageRetrievalTime: number;
    };
    similarity: {
        indexSize: number;
        averageSimilarityScore: number;
        queryCount: number;
    };
}
/**
 * Specialized caching service for memory processing operations
 */
export declare class MemoryProcessingCache {
    private memoryCache;
    private embeddingCache;
    private metadataCache;
    private similarityIndex;
    private batchingService;
    private readonly config;
    private metrics;
    constructor(config?: Partial<MemoryCacheConfig>);
    /**
     * Cache processed memory
     */
    cacheMemory(memory: Memory, processed?: Partial<ProcessedMemory>): void;
    /**
     * Get cached memory
     */
    getCachedMemory(memoryId: string): CachedMemory | undefined;
    /**
     * Update memory processing state
     */
    updateMemoryState(memoryId: string, state: CachedMemory['processingState'], error?: string): void;
    /**
     * Get memories by processing state
     */
    getMemoriesByState(state: CachedMemory['processingState']): CachedMemory[];
    /**
     * Cache embedding result
     */
    cacheEmbedding(content: string, embedding: number[], model: string): string;
    /**
     * Get cached embedding
     */
    getCachedEmbedding(content: string): CachedEmbedding | undefined;
    /**
     * Find similar content by embedding
     */
    findSimilarContent(content: string, threshold?: number): Array<{
        content: string;
        similarity: number;
        embedding: number[];
    }>;
    /**
     * Cache memory metadata
     */
    cacheMetadata(memoryId: string, metadata: MemoryMetadata): void;
    /**
     * Get cached metadata
     */
    getCachedMetadata(memoryId: string): MemoryMetadata | undefined;
    /**
     * Add memory to processing batch
     */
    addToProcessingBatch(memory: Memory, priority?: 'low' | 'normal' | 'high'): void;
    /**
     * Process memory batch
     */
    processMemoryBatch(): Promise<void>;
    /**
     * Find similar memories by content
     */
    findSimilarMemories(memoryId: string, limit?: number): Array<{
        memoryId: string;
        similarity: number;
        memory?: CachedMemory;
    }>;
    /**
     * Get comprehensive cache statistics
     */
    getStats(): MemoryCacheStats;
    /**
     * Clear all caches
     */
    clearAll(): void;
    /**
     * Cleanup and destroy cache
     */
    destroy(): void;
    private updateSimilarityIndex;
    private evictLeastAccessedMemories;
    private evictLeastUsedEmbeddings;
    private evictRandomMetadata;
    private hashContent;
    private calculateCosineSimilarity;
    private getHitRate;
}
export default MemoryProcessingCache;
//# sourceMappingURL=MemoryProcessingCache.d.ts.map