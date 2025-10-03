/**
 * QueryService - Advanced Memory Query Operations
 *
 * High-level query service providing sophisticated memory search capabilities
 * similar to backend's MemoryQueryService. Combines vector search, semantic search,
 * knowledge graph traversal, and complex filtering operations.
 *
 * This service coordinates between MemoryIndexService, GraphService, and other
 * components to provide unified query capabilities.
 */
import { MemoryIndexService, type MemorySearchResult } from './MemoryIndexService';
import { EmbeddingService } from './EmbeddingService';
import { StorageService } from './StorageService';
import { GraphService } from '../graph/GraphService';
export interface AdvancedMemoryQuery {
    query?: string;
    userAddress: string;
    queryType?: 'vector' | 'semantic' | 'keyword' | 'hybrid' | 'graph' | 'temporal' | 'analytical';
    vector?: number[];
    k?: number;
    threshold?: number;
    categories?: string[];
    topics?: string[];
    tags?: string[];
    contentTypes?: string[];
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    importanceRange?: {
        min?: number;
        max?: number;
    };
    minRelevanceScore?: number;
    graphQuery?: {
        entityTypes?: string[];
        relationshipTypes?: string[];
        maxHops?: number;
        seedEntities?: string[];
    };
    includeContent?: boolean;
    includeGraph?: boolean;
    includeAnalytics?: boolean;
    limit?: number;
    offset?: number;
    boostRecent?: boolean;
    boostImportant?: boolean;
    diversifyResults?: boolean;
}
export interface QueryResult {
    memories: MemorySearchResult[];
    totalCount: number;
    queryTime: number;
    queryType: string;
    graphResults?: {
        entities: any[];
        relationships: any[];
    };
    analytics?: {
        categoryDistribution: Record<string, number>;
        importanceDistribution: Record<number, number>;
        temporalDistribution: Record<string, number>;
        averageRelevance: number;
    };
    suggestions?: string[];
}
export interface SemanticSearchOptions {
    expandQuery?: boolean;
    includeRelated?: boolean;
    semanticThreshold?: number;
    maxExpansions?: number;
}
export interface AnalyticalQuery {
    userAddress: string;
    analysis: 'trends' | 'categories' | 'importance' | 'temporal' | 'relationships' | 'insights';
    timeframe?: {
        start?: Date;
        end?: Date;
        granularity?: 'day' | 'week' | 'month' | 'year';
    };
    filters?: {
        categories?: string[];
        importanceRange?: {
            min?: number;
            max?: number;
        };
    };
}
/**
 * Advanced query service providing unified memory search capabilities
 */
export declare class QueryService {
    private memoryIndexService?;
    private embeddingService?;
    private storageService?;
    private graphService?;
    constructor(memoryIndexService?: MemoryIndexService, embeddingService?: EmbeddingService, storageService?: StorageService, graphService?: GraphService);
    /**
     * Get QueryService statistics including EmbeddingService stats
     */
    getStats(): {
        memoryIndexAvailable: boolean;
        embeddingServiceAvailable: boolean;
        storageAvailable: boolean;
        graphServiceAvailable: boolean;
        embeddingStats?: ReturnType<EmbeddingService['getStats']>;
    };
    /**
     * Initialize services (can be called after construction)
     */
    initialize(memoryIndexService: MemoryIndexService, embeddingService: EmbeddingService, storageService?: StorageService, graphService?: GraphService): void;
    /**
     * Execute advanced memory query with multiple search strategies
     */
    query(query: AdvancedMemoryQuery): Promise<QueryResult>;
    /**
     * Pure vector similarity search
     */
    vectorSearch(query: AdvancedMemoryQuery): Promise<MemorySearchResult[]>;
    /**
     * Semantic search with query expansion and context understanding
     */
    semanticSearch(query: AdvancedMemoryQuery, options?: SemanticSearchOptions): Promise<MemorySearchResult[]>;
    /**
     * Keyword-based search in metadata and content
     */
    keywordSearch(query: AdvancedMemoryQuery): Promise<MemorySearchResult[]>;
    /**
     * Knowledge graph-based search
     */
    graphSearch(query: AdvancedMemoryQuery): Promise<{
        memories: MemorySearchResult[];
        graphResults: any;
    }>;
    /**
     * Time-based search with temporal patterns
     */
    temporalSearch(query: AdvancedMemoryQuery): Promise<MemorySearchResult[]>;
    /**
     * Analytical search for insights and patterns
     */
    analyticalSearch(query: AdvancedMemoryQuery): Promise<{
        memories: MemorySearchResult[];
        analytics: any;
    }>;
    /**
     * Hybrid search combining multiple strategies
     */
    hybridSearch(query: AdvancedMemoryQuery): Promise<MemorySearchResult[]>;
    /**
     * Execute analytical queries for insights
     */
    analyzeMemories(query: AnalyticalQuery): Promise<any>;
    /**
     * Calculate similarity between two vectors using EmbeddingService
     */
    private calculateSimilarity;
    /**
     * Find most similar memories to a query using EmbeddingService
     */
    private findSimilarMemories;
    /**
     * Batch generate embeddings for multiple texts using EmbeddingService
     */
    private batchEmbedTexts;
    private postProcessResults;
    private deduplicateResults;
    private rerankSemanticResults;
    private rerankHybridResults;
    private boostRecentResults;
    private boostImportantResults;
    private diversifyResults;
    private generateAnalytics;
    private analyzeTrends;
    private analyzeCategories;
    private analyzeImportance;
    private analyzeTemporal;
    private analyzeRelationships;
    private generateInsights;
    private generateImportanceRecommendations;
}
//# sourceMappingURL=QueryService.d.ts.map