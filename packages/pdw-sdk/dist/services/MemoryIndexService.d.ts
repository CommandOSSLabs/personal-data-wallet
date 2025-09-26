/**
 * MemoryIndexService - Enhanced Memory Indexing and Vector Search
 *
 * Browser-compatible HNSW-powered memory indexing service providing:
 * - O(log N) vector similarity search performance
 * - Advanced clustering and graph-based memory organization
 * - Intelligent semantic search with relevance scoring
 * - Dynamic index optimization and parameter tuning
 * - Multi-dimensional vector space analysis
 *
 * Enhanced from basic wrapper to sophisticated vector search engine
 * matching backend's performance while maintaining browser compatibility.
 */
import { EmbeddingService } from '../embedding/EmbeddingService';
import { StorageService, type MemoryMetadata } from './StorageService';
export interface MemoryIndexEntry {
    memoryId: string;
    blobId: string;
    vectorId: number;
    embedding: number[];
    metadata: MemoryMetadata;
    indexedAt: Date;
    lastAccessed?: Date;
}
export interface MemoryIndexOptions {
    maxElements?: number;
    dimension?: number;
    efConstruction?: number;
    m?: number;
    batchSize?: number;
    autoFlushInterval?: number;
}
export interface MemorySearchQuery {
    query?: string;
    vector?: number[];
    userAddress: string;
    k?: number;
    threshold?: number;
    categories?: string[];
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    importanceRange?: {
        min?: number;
        max?: number;
    };
    tags?: string[];
    includeContent?: boolean;
    searchMode?: 'semantic' | 'hybrid' | 'exact';
    boostRecent?: boolean;
    diversityFactor?: number;
}
export interface MemorySearchResult {
    memoryId: string;
    blobId: string;
    metadata: MemoryMetadata;
    similarity: number;
    relevanceScore: number;
    content?: string | Uint8Array;
    extractedAt?: Date;
    clusterInfo?: {
        clusterId: number;
        clusterCenter: number[];
        intraClusterSimilarity: number;
    };
}
/**
 * Memory-focused indexing service providing high-level memory operations
 * Enhanced with browser-compatible HNSW for O(log N) search performance
 */
export declare class MemoryIndexService {
    private hnswService;
    private embeddingService?;
    private storageService?;
    private memoryIndex;
    private nextMemoryId;
    private browserIndexes;
    private vectorClusters;
    private indexStats;
    constructor(storageService?: StorageService, options?: MemoryIndexOptions);
    /**
     * Initialize with embedding service
     */
    initialize(embeddingService: EmbeddingService, storageService?: StorageService): void;
    /**
     * Index a memory with its content, metadata, and vector embedding
     */
    indexMemory(userAddress: string, memoryId: string, blobId: string, content: string, metadata: MemoryMetadata, embedding?: number[]): Promise<{
        vectorId: number;
        indexed: boolean;
    }>;
    /**
     * Enhanced memory search using browser-compatible HNSW with advanced features
     * Supports semantic search, clustering, and intelligent relevance scoring
     */
    searchMemories(query: MemorySearchQuery): Promise<MemorySearchResult[]>;
    /**
     * Get all memories for a user with optional filtering
     */
    getUserMemories(userAddress: string, filters?: {
        categories?: string[];
        dateRange?: {
            start?: Date;
            end?: Date;
        };
        importanceRange?: {
            min?: number;
            max?: number;
        };
        limit?: number;
    }): Promise<MemorySearchResult[]>;
    /**
     * Remove memory from index
     */
    removeMemory(userAddress: string, memoryId: string): Promise<boolean>;
    /**
     * Get index statistics for a user
     */
    getIndexStats(userAddress: string): {
        totalMemories: number;
        categoryCounts: Record<string, number>;
        importanceDistribution: Record<number, number>;
        averageImportance: number;
        oldestMemory: Date | null;
        newestMemory: Date | null;
        indexSize: number;
    };
    /**
     * Flush pending operations and save index
     */
    flush(userAddress: string): Promise<void>;
    /**
     * Load index from storage
     */
    loadIndex(userAddress: string, indexBlobId?: string): Promise<void>;
    /**
     * Save index to storage
     */
    saveIndex(userAddress: string): Promise<string | null>;
    /**
     * Clear user's index
     */
    clearUserIndex(userAddress: string): void;
    /**
     * Get overall service statistics
     */
    getServiceStats(): {
        totalUsers: number;
        totalMemories: number;
        hnswStats: import("../embedding/types").BatchStats;
        hasEmbeddingService: boolean;
        hasStorageService: boolean;
    };
    /**
     * Destroy service and cleanup resources
     */
    destroy(): void;
    private createMemoryFilter;
    /**
     * Initialize browser-compatible HNSW index for a user
     */
    private initializeBrowserIndex;
    /**
     * Fallback linear search when HNSW index is not available
     */
    private fallbackLinearSearch;
    /**
     * Enhanced relevance scoring with multiple factors
     */
    private calculateAdvancedRelevanceScore;
    /**
     * Calculate recency boost based on creation timestamp
     */
    private calculateRecencyBoost;
    /**
     * Get cluster information for a vector
     */
    private getClusterInfo;
    /**
     * Diversify search results to avoid clustering
     */
    private diversifyResults;
    /**
     * Update search performance statistics
     */
    private updateSearchStats;
    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity;
    /**
     * Calculate vector magnitude
     */
    private calculateVectorMagnitude;
    /**
     * Calculate semantic consistency score
     */
    private calculateSemanticConsistency;
    private calculateRelevanceScore;
}
//# sourceMappingURL=MemoryIndexService.d.ts.map