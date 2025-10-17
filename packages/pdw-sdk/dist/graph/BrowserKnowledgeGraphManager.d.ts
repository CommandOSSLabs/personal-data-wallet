/**
 * BrowserKnowledgeGraphManager - Client-Side Knowledge Graph with IndexedDB
 *
 * Browser-compatible knowledge graph manager with IndexedDB persistence.
 * Provides entity and relationship management for memory organization.
 *
 * Features:
 * - IndexedDB persistence (survives page refresh)
 * - Fast graph queries and traversal
 * - Entity-relationship mapping
 * - Memory-graph integration
 * - Zero backend dependencies
 */
import type { KnowledgeGraph, Entity, Relationship, GraphExtractionResult } from './GraphService';
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
/**
 * Browser-compatible knowledge graph manager with IndexedDB persistence
 */
export declare class BrowserKnowledgeGraphManager {
    private db?;
    private memoryMappings;
    private graphCache;
    constructor();
    /**
     * Initialize IndexedDB for graph persistence
     */
    private initializeIndexedDB;
    /**
     * Get user's knowledge graph from IndexedDB
     */
    getUserGraph(userId: string): Promise<KnowledgeGraph | null>;
    /**
     * Update user's knowledge graph
     */
    updateUserGraph(userId: string, graph: KnowledgeGraph): Promise<void>;
    /**
     * Add entities and relationships to graph
     */
    addToGraph(userId: string, entities: Entity[], relationships: Relationship[], memoryId: string): Promise<void>;
    /**
     * Search graph with complex queries
     */
    searchGraph(userId: string, query: GraphSearchQuery): Promise<GraphSearchResult>;
    /**
     * Find entities related to a specific entity
     */
    findRelatedEntities(userId: string, entityId: string, maxHops?: number): Promise<Entity[]>;
    /**
     * Clear user's knowledge graph
     */
    clearUserGraph(userId: string): Promise<void>;
    /**
     * Cleanup resources
     */
    destroy(): void;
    private createEmptyGraph;
    private loadGraphFromDB;
    private saveGraphToDB;
}
export default BrowserKnowledgeGraphManager;
//# sourceMappingURL=BrowserKnowledgeGraphManager.d.ts.map