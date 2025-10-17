/**
 * useKnowledgeGraph - Hook for knowledge graph operations
 *
 * Provides interface for querying and traversing the knowledge graph.
 * Knowledge graphs store entities and relationships extracted from memories.
 */
import { useState, useCallback, useEffect } from 'react';
import { useMemoryServices } from './useMemoryServices';
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
export function useKnowledgeGraph(userId, config) {
    const { graphManager, isReady, error: servicesError } = useMemoryServices(userId, config);
    const [graph, setGraph] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastSearchResults, setLastSearchResults] = useState(null);
    // Load graph on mount
    useEffect(() => {
        if (!userId || !graphManager || !isReady)
            return;
        let mounted = true;
        const loadGraph = async () => {
            try {
                setIsLoading(true);
                const userGraph = await graphManager.getUserGraph(userId);
                if (mounted) {
                    setGraph(userGraph);
                    setIsLoading(false);
                }
            }
            catch (err) {
                console.error('Failed to load graph:', err);
                if (mounted) {
                    setError(err);
                    setIsLoading(false);
                }
            }
        };
        loadGraph();
        return () => {
            mounted = false;
        };
    }, [userId, graphManager, isReady]);
    /**
     * Search the knowledge graph
     */
    const searchGraph = useCallback(async (query) => {
        if (!graphManager || !userId) {
            throw new Error('Graph manager not initialized');
        }
        try {
            setIsLoading(true);
            setError(null);
            const results = await graphManager.searchGraph(userId, query);
            setLastSearchResults(results);
            return results;
        }
        catch (err) {
            const error = err;
            setError(error);
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    }, [userId, graphManager]);
    /**
     * Find entities related to a specific entity
     */
    const findRelated = useCallback(async (entityId, maxHops = 2) => {
        if (!graphManager || !userId) {
            throw new Error('Graph manager not initialized');
        }
        try {
            setIsLoading(true);
            setError(null);
            const relatedEntities = await graphManager.findRelatedEntities(userId, entityId, maxHops);
            return relatedEntities;
        }
        catch (err) {
            const error = err;
            setError(error);
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    }, [userId, graphManager]);
    /**
     * Add entities and relationships to the graph
     */
    const addToGraph = useCallback(async (entities, relationships, memoryId) => {
        if (!graphManager || !userId) {
            throw new Error('Graph manager not initialized');
        }
        try {
            setIsLoading(true);
            setError(null);
            await graphManager.addToGraph(userId, entities, relationships, memoryId);
            // Reload graph
            const updatedGraph = await graphManager.getUserGraph(userId);
            setGraph(updatedGraph);
        }
        catch (err) {
            const error = err;
            setError(error);
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    }, [userId, graphManager]);
    /**
     * Clear the entire knowledge graph for the user
     */
    const clearGraph = useCallback(async () => {
        if (!graphManager || !userId) {
            throw new Error('Graph manager not initialized');
        }
        try {
            setIsLoading(true);
            setError(null);
            await graphManager.clearUserGraph(userId);
            setGraph(null);
            setLastSearchResults(null);
            console.log('✅ Knowledge graph cleared');
        }
        catch (err) {
            const error = err;
            setError(error);
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    }, [userId, graphManager]);
    /**
     * Reload graph from IndexedDB
     */
    const reloadGraph = useCallback(async () => {
        if (!graphManager || !userId)
            return;
        try {
            setIsLoading(true);
            const userGraph = await graphManager.getUserGraph(userId);
            setGraph(userGraph);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setIsLoading(false);
        }
    }, [userId, graphManager]);
    /**
     * Get graph statistics
     */
    const getStats = useCallback(() => {
        if (!graph) {
            return {
                totalEntities: 0,
                totalRelationships: 0,
                entityTypes: {},
                relationshipTypes: {},
                sourceMemories: 0
            };
        }
        const entityTypes = {};
        graph.entities.forEach(entity => {
            entityTypes[entity.type] = (entityTypes[entity.type] || 0) + 1;
        });
        const relationshipTypes = {};
        graph.relationships.forEach(rel => {
            const type = rel.type || rel.label;
            relationshipTypes[type] = (relationshipTypes[type] || 0) + 1;
        });
        return {
            totalEntities: graph.entities.length,
            totalRelationships: graph.relationships.length,
            entityTypes,
            relationshipTypes,
            sourceMemories: graph.metadata.sourceMemories?.length || 0
        };
    }, [graph]);
    return {
        searchGraph,
        findRelated,
        addToGraph,
        clearGraph,
        reloadGraph,
        graph,
        lastSearchResults,
        isLoading,
        isReady,
        error: error || servicesError,
        stats: getStats()
    };
}
//# sourceMappingURL=useKnowledgeGraph.js.map