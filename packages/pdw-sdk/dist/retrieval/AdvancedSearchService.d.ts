/**
 * AdvancedSearchService - Sophisticated Search & Filtering
 *
 * Provides advanced search capabilities including:
 * - Multi-dimensional filtering with facets
 * - Semantic search with AI understanding
 * - Time-series analysis and temporal queries
 * - Knowledge graph traversal
 * - Search aggregations and analytics
 * - Custom scoring algorithms
 */
import { UnifiedMemoryQuery, UnifiedMemoryResult } from './MemoryRetrievalService';
import { EmbeddingService } from '../services/EmbeddingService';
import { KnowledgeGraphManager } from '../graph/KnowledgeGraphManager';
export interface SearchFilter {
    type: 'category' | 'dateRange' | 'importance' | 'tags' | 'contentType' | 'similarity' | 'custom';
    field: string;
    operator: 'equals' | 'contains' | 'range' | 'greater' | 'less' | 'in' | 'regex';
    value: any;
    weight?: number;
}
export interface SearchAggregation {
    name: string;
    type: 'count' | 'sum' | 'avg' | 'max' | 'min' | 'histogram' | 'terms' | 'dateHistogram';
    field: string;
    size?: number;
    interval?: string;
    ranges?: Array<{
        from?: number;
        to?: number;
        key?: string;
    }>;
}
export interface SearchFacets {
    categories: Array<{
        value: string;
        count: number;
        selected?: boolean;
    }>;
    dateRanges: Array<{
        label: string;
        from: Date;
        to: Date;
        count: number;
    }>;
    importanceRanges: Array<{
        label: string;
        min: number;
        max: number;
        count: number;
    }>;
    tags: Array<{
        value: string;
        count: number;
        coOccurrence?: string[];
    }>;
    contentTypes: Array<{
        value: string;
        count: number;
        extensions?: string[];
    }>;
    similarityScores: Array<{
        range: string;
        count: number;
        avgScore: number;
    }>;
}
export interface SemanticSearchQuery {
    query: string;
    intent?: 'question' | 'statement' | 'command' | 'exploration';
    context?: string;
    entities?: string[];
    semanticExpansion?: boolean;
    conceptualDepth?: number;
}
export interface TemporalSearchQuery {
    timeframe: 'last_hour' | 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';
    customRange?: {
        start: Date;
        end: Date;
    };
    temporalPattern?: 'frequency' | 'seasonality' | 'trends' | 'anomalies';
    groupBy?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}
export interface GraphSearchQuery {
    startNodes?: string[];
    maxDepth: number;
    relationshipTypes?: string[];
    pathFinding?: 'shortest' | 'all' | 'weighted';
    includeMetadata?: boolean;
    traversalDirection?: 'outgoing' | 'incoming' | 'both';
}
export interface HybridSearchQuery {
    vectorWeight: number;
    semanticWeight: number;
    keywordWeight: number;
    graphWeight: number;
    temporalWeight: number;
    customScoring?: (result: UnifiedMemoryResult) => number;
}
export interface SearchResult {
    results: UnifiedMemoryResult[];
    facets: SearchFacets;
    aggregations: Record<string, any>;
    suggestions: {
        queryExpansions: string[];
        similarQueries: string[];
        recommendedFilters: SearchFilter[];
        explorationPaths: string[];
    };
    performance: {
        totalTime: number;
        searchTime: number;
        aggregationTime: number;
        facetTime: number;
    };
}
/**
 * Advanced Search Service with sophisticated filtering and analysis
 */
export declare class AdvancedSearchService {
    private embeddingService;
    private graphManager;
    constructor(config?: {
        embeddingService?: EmbeddingService;
        graphManager?: KnowledgeGraphManager;
    });
    /**
     * Multi-faceted search with dynamic filtering
     */
    facetedSearch(baseQuery: UnifiedMemoryQuery, filters: SearchFilter[], aggregations: SearchAggregation[], options?: {
        includeFacets?: boolean;
        facetSize?: number;
        timeout?: number;
    }): Promise<SearchResult>;
    /**
     * Semantic search with AI-powered understanding
     */
    semanticSearch(semanticQuery: SemanticSearchQuery, baseQuery: UnifiedMemoryQuery): Promise<UnifiedMemoryResult[]>;
    /**
     * Temporal search with time-series analysis
     */
    temporalSearch(temporalQuery: TemporalSearchQuery, baseQuery: UnifiedMemoryQuery): Promise<{
        results: UnifiedMemoryResult[];
        timeline: Array<{
            period: string;
            count: number;
            memories: string[];
            trends: {
                direction: 'up' | 'down' | 'stable';
                strength: number;
                anomalies: boolean;
            };
        }>;
        patterns: {
            peakHours: number[];
            peakDays: string[];
            seasonality: any;
            correlations: Array<{
                event: string;
                correlation: number;
            }>;
        };
    }>;
    /**
     * Knowledge graph traversal search
     */
    graphSearch(graphQuery: GraphSearchQuery, baseQuery: UnifiedMemoryQuery): Promise<{
        results: UnifiedMemoryResult[];
        paths: Array<{
            startNode: string;
            endNode: string;
            path: string[];
            relationships: Array<{
                from: string;
                to: string;
                type: string;
                weight: number;
            }>;
            score: number;
        }>;
        subgraphs: Array<{
            nodes: string[];
            relationships: Array<{
                from: string;
                to: string;
                type: string;
            }>;
            centrality: Record<string, number>;
        }>;
    }>;
    /**
     * Hybrid search combining multiple algorithms
     */
    hybridSearch(hybridQuery: HybridSearchQuery, baseQuery: UnifiedMemoryQuery, specificQueries: {
        semantic?: SemanticSearchQuery;
        temporal?: TemporalSearchQuery;
        graph?: GraphSearchQuery;
    }): Promise<UnifiedMemoryResult[]>;
    private applyFiltersToQuery;
    private executeBaseSearch;
    private generateFacets;
    private executeAggregations;
    private generateSearchSuggestions;
    private analyzeSemanticQuery;
    private expandQuerySemantics;
    private executeSemanticQuery;
    private deduplicateResults;
    private rankSemanticResults;
    private convertTemporalQuery;
    private generateTimeline;
    private analyzeTempralPatterns;
    private executeGraphTraversal;
    private findMemoriesFromGraphNodes;
    private findSignificantPaths;
    private identifySubgraphs;
    private combineHybridResults;
    private generateDateRangeFacets;
    private generateImportanceRangeFacets;
    private generateTagFacets;
    private generateContentTypeFacets;
    private generateSimilarityFacets;
    private executeTermsAggregation;
    private executeDateHistogramAggregation;
    private executeHistogramAggregation;
    private generateQueryExpansions;
    private findSimilarQueries;
    private recommendFilters;
    private generateExplorationPaths;
}
//# sourceMappingURL=AdvancedSearchService.d.ts.map