/**
 * useKnowledgeGraph - Hook for knowledge graph operations
 *
 * Provides interface for querying and traversing the knowledge graph.
 * Knowledge graphs store entities and relationships extracted from memories.
 */
import { type MemoryServicesConfig } from './useMemoryServices';
import type { GraphSearchQuery, GraphSearchResult } from '../graph/BrowserKnowledgeGraphManager';
import type { Entity, KnowledgeGraph } from '../graph/GraphService';
/**
 * Query and traverse the knowledge graph
 *
 * @param userId - User's unique identifier
 * @param config - Optional services configuration
 * @returns Graph operations and state
 *
 * @example
 * ```tsx
 * function GraphExplorer() {
 *   const account = useCurrentAccount();
 *   const { searchGraph, findRelated, graph, isLoading } = useKnowledgeGraph(
 *     account?.address
 *   );
 *
 *   const handleSearch = async () => {
 *     const results = await searchGraph({
 *       keywords: ['paris', 'vacation'],
 *       entityTypes: ['location', 'event']
 *     });
 *     console.log('Found:', results);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleSearch}>Search Graph</button>
 *       <p>Entities: {graph?.entities.length || 0}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useKnowledgeGraph(userId?: string, config?: MemoryServicesConfig): {
    searchGraph: (query: GraphSearchQuery) => Promise<GraphSearchResult>;
    findRelated: (entityId: string, maxHops?: number) => Promise<Entity[]>;
    addToGraph: (entities: Entity[], relationships: Array<{
        source: string;
        target: string;
        label: string;
        confidence?: number;
    }>, memoryId: string) => Promise<void>;
    clearGraph: () => Promise<void>;
    reloadGraph: () => Promise<void>;
    graph: KnowledgeGraph | null;
    lastSearchResults: GraphSearchResult | null;
    isLoading: boolean;
    isReady: boolean;
    error: Error | null;
    stats: {
        totalEntities: number;
        totalRelationships: number;
        entityTypes: Record<string, number>;
        relationshipTypes: Record<string, number>;
        sourceMemories: number;
    };
};
//# sourceMappingURL=useKnowledgeGraph.d.ts.map