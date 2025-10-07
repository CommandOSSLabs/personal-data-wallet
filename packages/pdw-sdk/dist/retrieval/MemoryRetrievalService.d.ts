/**
 * MemoryRetrievalService - Unified Memory Retrieval & Search
 *
 * Consolidates all memory retrieval operations into a single, powerful service
 * with advanced caching, decryption, analytics, and multi-dimensional search.
 *
 * Features:
 * - 🔍 Vector similarity search with HNSW indexing
 * - 📊 Semantic search with AI understanding
 * - 🕒 Time-based and metadata filtering
 * - 🔐 Automatic SEAL decryption pipeline
 * - 📈 Memory analytics and relationship discovery
 * - ⚡ Multi-tier caching for performance
 * - 🔄 Real-time memory streaming
 * - 📤 Export and backup capabilities
 */
import { EmbeddingService } from '../services/EmbeddingService';
import { VectorManager } from '../vector/VectorManager';
import { KnowledgeGraphManager } from '../graph/KnowledgeGraphManager';
import { StorageManager } from '../storage/StorageManager';
import { BlockchainManager } from '../blockchain/BlockchainManager';
import { EncryptionService } from '../services/EncryptionService';
import { BatchManager } from '../batch/BatchManager';
import { DecryptionConfig } from './MemoryDecryptionPipeline';
export interface UnifiedMemoryQuery {
    query?: string;
    userId: string;
    searchType?: 'vector' | 'semantic' | 'keyword' | 'hybrid' | 'graph' | 'temporal';
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
    contentTypes?: string[];
    similarity?: {
        threshold?: number;
        k?: number;
        efSearch?: number;
    };
    graphTraversal?: {
        maxDepth?: number;
        includeEntities?: string[];
        excludeRelations?: string[];
    };
    includeContent?: boolean;
    includeMetadata?: boolean;
    includeEmbeddings?: boolean;
    includeAnalytics?: boolean;
    useCache?: boolean;
    timeout?: number;
    batchSize?: number;
}
export interface UnifiedMemoryResult {
    id: string;
    content?: string;
    category: string;
    created: Date;
    updated?: Date;
    similarity?: number;
    relevanceScore: number;
    searchRelevance: {
        vectorSimilarity?: number;
        semanticMatch?: number;
        keywordMatch?: number;
        graphRelevance?: number;
        temporalRelevance?: number;
    };
    metadata: {
        owner: string;
        size: number;
        importance: number;
        tags: string[];
        contentType: string;
        isEncrypted: boolean;
        accessCount?: number;
        lastAccessed?: Date;
    };
    storage: {
        blobId: string;
        walrusHash?: string;
        blockchainId?: string;
        cacheStatus: 'cached' | 'retrieved' | 'not-cached';
    };
    relationships?: {
        relatedMemories: string[];
        knowledgeGraphNodes: string[];
        semanticClusters: string[];
    };
    analytics?: {
        viewCount: number;
        shareCount: number;
        editCount: number;
        sentimentScore?: number;
        topicDistribution?: Record<string, number>;
    };
}
export interface RetrievalStats {
    totalResults: number;
    processingTime: number;
    cacheHitRate: number;
    searchBreakdown: {
        vectorSearchTime: number;
        semanticAnalysisTime: number;
        decryptionTime: number;
        graphTraversalTime: number;
    };
    dataSourcesUsed: string[];
    qualityMetrics: {
        averageRelevance: number;
        diversityScore: number;
        freshnessScore: number;
    };
}
export interface RetrievalContext {
    query: UnifiedMemoryQuery;
    results: UnifiedMemoryResult[];
    stats: RetrievalStats;
    suggestions: {
        relatedQueries: string[];
        filterSuggestions: string[];
        explorationPaths: string[];
    };
    timeline?: {
        events: Array<{
            date: Date;
            type: 'created' | 'modified' | 'accessed' | 'shared';
            memoryId: string;
            description: string;
        }>;
    };
}
/**
 * Unified Memory Retrieval Service
 */
export declare class MemoryRetrievalService {
    private embeddingService;
    private vectorManager;
    private graphManager;
    private storageManager;
    private blockchainManager;
    private encryptionService;
    private batchManager;
    private decryptionPipeline;
    private queryCache;
    private contentCache;
    private analyticsCache;
    private readonly QUERY_CACHE_TTL;
    private readonly CONTENT_CACHE_TTL;
    private readonly ANALYTICS_CACHE_TTL;
    constructor(config?: {
        embeddingService?: EmbeddingService;
        vectorManager?: VectorManager;
        graphManager?: KnowledgeGraphManager;
        storageManager?: StorageManager;
        blockchainManager?: BlockchainManager;
        encryptionService?: EncryptionService;
        batchManager?: BatchManager;
        decryptionConfig?: DecryptionConfig;
    });
    /**
     * Main unified search method - handles all types of memory retrieval
     */
    searchMemories(query: UnifiedMemoryQuery): Promise<RetrievalContext>;
    /**
     * Vector similarity search using HNSW index
     */
    private performVectorSearch;
    /**
     * Semantic search with AI understanding
     */
    private performSemanticSearch;
    /**
     * Knowledge graph traversal search
     */
    private performGraphSearch;
    /**
     * Temporal/time-based search
     */
    private performTemporalSearch;
    /**
     * Keyword-based search
     */
    private performKeywordSearch;
    /**
     * Hybrid search combining multiple methods
     */
    private performHybridSearch;
    /**
     * Apply filters to search results
     */
    private applyFilters;
    /**
     * Enrich results with additional data
     */
    private enrichResults;
    /**
     * Rank and sort results by relevance
     */
    private rankAndSortResults;
    /**
     * Generate comprehensive search statistics
     */
    private generateStats;
    private generateCacheKey;
    private getCachedQuery;
    private cacheQuery;
    private calculateCacheHitRate;
    private getDataSourcesUsed;
    private calculateDiversityScore;
    private calculateFreshnessScore;
    private convertVectorResults;
    private analyzeQuerySemantics;
    private calculateSemanticMatch;
    private combineRelevanceScores;
    private calculateTemporalRelevance;
    private getAllUserMemories;
    private retrieveMemoryById;
    private loadMemoryContent;
    private loadMemoryAnalytics;
    private loadMemoryRelationships;
    private generateSuggestions;
    private generateTimeline;
    /**
     * Get comprehensive memory retrieval statistics
     */
    getRetrievalStats(): {
        cacheStats: {
            queries: number;
            content: number;
            analytics: number;
        };
        performanceMetrics: any;
    };
    /**
     * Clear all caches
     */
    clearCache(): void;
    /**
     * Warm up caches for a user
     */
    warmupCache(userId: string): Promise<void>;
}
//# sourceMappingURL=MemoryRetrievalService.d.ts.map