/**
 * GraphService - Knowledge Graph Extraction and Management
 *
 * Ports sophisticated knowledge graph logic from the backend with AI-powered
 * entity/relationship extraction, graph traversal, and intelligent updates.
 */
import { EmbeddingService } from '../embedding/EmbeddingService';
import { type GeminiConfig } from '../services/GeminiAIService';
export interface Entity {
    id: string;
    label: string;
    type: string;
    properties?: Record<string, any>;
    confidence?: number;
    sourceMemoryIds?: string[];
    createdAt?: Date;
    lastUpdated?: Date;
}
export interface Relationship {
    id?: string;
    source: string;
    target: string;
    label: string;
    type?: string;
    properties?: Record<string, any>;
    confidence?: number;
    sourceMemoryIds?: string[];
    createdAt?: Date;
    lastUpdated?: Date;
}
export interface KnowledgeGraph {
    entities: Entity[];
    relationships: Relationship[];
    metadata: {
        version: string;
        createdAt: Date;
        lastUpdated: Date;
        totalEntities: number;
        totalRelationships: number;
        sourceMemories: string[];
    };
}
export interface GraphExtractionResult {
    entities: Entity[];
    relationships: Relationship[];
    confidence: number;
    processingTimeMs: number;
    extractedFromMemory: string;
}
export interface GraphQueryResult {
    entities: Entity[];
    relationships: Relationship[];
    paths?: Array<{
        entities: string[];
        relationships: string[];
        score: number;
    }>;
    totalResults: number;
}
export interface GraphConfig {
    extractionModel?: string;
    confidenceThreshold?: number;
    maxHops?: number;
    enableEmbeddings?: boolean;
    deduplicationThreshold?: number;
    geminiApiKey?: string;
    geminiConfig?: Partial<GeminiConfig>;
    useMockAI?: boolean;
}
/**
 * Advanced knowledge graph service with AI extraction and intelligent management
 */
export declare class GraphService {
    private embeddingService?;
    private geminiAI?;
    private readonly config;
    private graphs;
    private extractionStats;
    constructor(config?: Partial<GraphConfig>, embeddingService?: EmbeddingService);
    /**
     * Create empty knowledge graph
     */
    createGraph(userId?: string): KnowledgeGraph;
    /**
     * Get cached graph for user
     */
    getUserGraph(userId: string): KnowledgeGraph | undefined;
    /**
     * Cache graph for user
     */
    setUserGraph(userId: string, graph: KnowledgeGraph): void;
    /**
     * Extract entities and relationships from memory content using AI
     */
    extractEntitiesAndRelationships(content: string, memoryId: string, options?: {
        includeEmbeddings?: boolean;
        confidenceThreshold?: number;
    }): Promise<GraphExtractionResult>;
    /**
     * Extract entities from multiple memories in batch
     */
    extractFromMemoriesBatch(memories: Array<{
        id: string;
        content: string;
    }>, options?: {
        batchSize?: number;
        delayMs?: number;
    }): Promise<GraphExtractionResult[]>;
    /**
     * Add extracted data to knowledge graph with intelligent deduplication
     */
    addToGraph(graph: KnowledgeGraph, newEntities: Entity[], newRelationships: Relationship[], sourceMemoryId?: string): KnowledgeGraph;
    /**
     * Find related entities using graph traversal
     */
    findRelatedEntities(graph: KnowledgeGraph, seedEntityIds: string[], options?: {
        maxHops?: number;
        relationshipTypes?: string[];
        includeWeights?: boolean;
    }): GraphQueryResult;
    /**
     * Query graph by entity type or relationship patterns
     */
    queryGraph(graph: KnowledgeGraph, query: {
        entityTypes?: string[];
        relationshipTypes?: string[];
        searchText?: string;
        limit?: number;
    }): GraphQueryResult;
    /**
     * Get graph statistics
     */
    getGraphStats(graph: KnowledgeGraph): {
        totalEntities: number;
        totalRelationships: number;
        entityTypes: {
            [k: string]: number;
        };
        relationshipTypes: {
            [k: string]: number;
        };
        averageConnections: number;
        graphDensity: number;
        extractionStats: {
            totalExtractions: number;
            averageEntities: number;
            averageRelationships: number;
            averageConfidence: number;
            processingTime: number;
        };
        lastUpdated: Date;
    };
    private buildExtractionPrompt;
    private mockGeminiResponse;
    private extractEntitiesHeuristic;
    private extractRelationshipsHeuristic;
    private parseExtractionResponse;
    private sanitizeId;
    private calculateExtractionConfidence;
    private mergeEntities;
    private findSimilarEntity;
    private calculateEntitySimilarity;
    private stringSimilarity;
    private levenshteinDistance;
    private generateRelationshipId;
    private updateExtractionStats;
    private delay;
    /**
     * Test AI service connectivity
     */
    testAIConnection(): Promise<{
        connected: boolean;
        usingMock: boolean;
        service: string;
    }>;
    /**
     * Get service configuration (without sensitive data)
     */
    getConfig(): Omit<Required<GraphConfig>, 'geminiApiKey'> & {
        aiConfigured: boolean;
    };
    /**
     * Get extraction statistics
     */
    getExtractionStats(): {
        totalExtractions: number;
        averageEntities: number;
        averageRelationships: number;
        averageConfidence: number;
        processingTime: number;
    };
}
export default GraphService;
//# sourceMappingURL=GraphService.d.ts.map