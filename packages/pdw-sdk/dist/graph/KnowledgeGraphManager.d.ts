/**
 * KnowledgeGraphManager - Integration layer for memory-graph processing
 *
 * Orchestrates knowledge graph updates as memories are processed,
 * provides intelligent graph queries, and manages graph persistence.
 */
import { GraphService, KnowledgeGraph, Entity, Relationship, GraphExtractionResult } from './GraphService';
import { Memory, ProcessedMemory } from '../embedding/types';
export interface GraphMemoryMapping {
    memoryId: string;
    entityIds: string[];
    relationshipIds: string[];
    extractionDate: Date;
    confidence: number;
}
export interface GraphUpdateResult {
    success: boolean;
    entitiesAdded: number;
    relationshipsAdded: number;
    entitiesUpdated: number;
    relationshipsUpdated: number;
    processingTimeMs: number;
    extractionResult?: GraphExtractionResult;
    error?: string;
}
export interface GraphSearchQuery {
    keywords?: string[];
    entityTypes?: string[];
    relationshipTypes?: string[];
    memoryIds?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    similarToMemory?: string;
    maxResults?: number;
}
export interface GraphSearchResult {
    entities: Entity[];
    relationships: Relationship[];
    relatedMemories: string[];
    searchPaths?: Array<{
        score: number;
        entities: string[];
        relationships: string[];
    }>;
    totalResults: number;
    queryTimeMs: number;
}
export interface KnowledgeGraphStats {
    totalGraphs: number;
    totalEntities: number;
    totalRelationships: number;
    averageConnections: number;
    topEntityTypes: Array<{
        type: string;
        count: number;
    }>;
    topRelationshipTypes: Array<{
        type: string;
        count: number;
    }>;
    memoryMappings: number;
    lastUpdate: Date;
}
/**
 * High-level knowledge graph manager integrating with memory processing
 */
export declare class KnowledgeGraphManager {
    private graphService;
    private memoryMappings;
    private graphCache;
    private stats;
    constructor(graphService?: GraphService);
    /**
     * Process memory and update knowledge graph
     */
    processMemoryForGraph(memory: ProcessedMemory, userIdParam?: string, options?: {
        forceReprocess?: boolean;
        skipCache?: boolean;
        confidenceThreshold?: number;
    }): Promise<GraphUpdateResult>;
    /**
     * Process multiple memories for graph updates (alias for compatibility)
     */
    processBatchMemoriesForGraph(userId: string, memories: Memory[], options?: {
        batchSize?: number;
        delayMs?: number;
        onProgress?: (completed: number, total: number) => void;
    }): Promise<GraphUpdateResult[]>;
    /**
     * Process multiple memories for graph updates
     */
    processMemoriesForGraphBatch(memories: ProcessedMemory[], userId: string, options?: {
        batchSize?: number;
        delayMs?: number;
        onProgress?: (completed: number, total: number) => void;
    }): Promise<GraphUpdateResult[]>;
    /**
     * Search knowledge graph with complex queries
     */
    searchGraph(userId: string, query: GraphSearchQuery): Promise<GraphSearchResult>;
    /**
     * Find memories connected to a specific entity or concept
     */
    findMemoriesRelatedToEntity(userId: string, entityId: string, options?: {
        maxHops?: number;
        includeRelationships?: boolean;
    }): Promise<{
        memories: string[];
        connectedEntities: Entity[];
        pathways: Array<{
            memory: string;
            entities: string[];
            score: number;
        }>;
    }>;
    /**
     * Get user's knowledge graph
     */
    getUserGraph(userId: string): Promise<KnowledgeGraph | null>;
    /**
     * Update user's knowledge graph
     */
    updateUserGraph(userId: string, graph: KnowledgeGraph): void;
    /**
     * Clear user's knowledge graph
     */
    clearUserGraph(userId: string): void;
    /**
     * Record a memory mapping (public method for tests)
     */
    recordMemoryMapping(mapping: GraphMemoryMapping): void;
    /**
     * Get memory mappings by memory ID (public method for tests)
     */
    getMemoryMappings(memoryId: string): GraphMemoryMapping[];
    /**
     * Get statistics for a specific user's graph
     */
    getGraphStatistics(userId: string): {
        totalEntities: number;
        totalRelationships: number;
        sourceMemoriesCount: number;
        entityTypeDistribution: Record<string, number>;
        relationshipTypeDistribution: Record<string, number>;
        averageEntityConfidence: number;
        averageRelationshipConfidence: number;
    };
    /**
     * Get comprehensive statistics
     */
    getKnowledgeGraphStats(): KnowledgeGraphStats;
    private isMemoryProcessed;
    private addMemoryMapping;
    private generateRelationshipId;
    private updateAverageProcessingTime;
    private delay;
}
export default KnowledgeGraphManager;
//# sourceMappingURL=KnowledgeGraphManager.d.ts.map