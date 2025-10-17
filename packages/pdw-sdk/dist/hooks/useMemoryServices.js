/**
 * useMemoryServices - Core hook for client-side memory services
 *
 * Manages lifecycle of browser-compatible services:
 * - EmbeddingService (Gemini API)
 * - BrowserHnswIndexService (hnswlib-wasm + IndexedDB)
 * - BrowserKnowledgeGraphManager (IndexedDB)
 *
 * Services are singletons per user address, shared across components.
 */
import { useEffect, useState, useMemo } from 'react';
import { EmbeddingService } from '../services/EmbeddingService';
import { BrowserHnswIndexService } from '../vector/BrowserHnswIndexService';
import { BrowserKnowledgeGraphManager } from '../graph/BrowserKnowledgeGraphManager';
// Singleton store for services (shared across all hooks)
const servicesStore = new Map();
/**
 * Initialize and manage memory services for client-side operations
 *
 * @param userAddress - User's blockchain address (used as unique identifier)
 * @param config - Optional configuration for services
 * @returns Memory services and loading state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const account = useCurrentAccount();
 *   const { embeddingService, hnswService, isReady } = useMemoryServices(
 *     account?.address,
 *     { geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY }
 *   );
 *
 *   if (!isReady) return <Loading />;
 *   // Use services...
 * }
 * ```
 */
export function useMemoryServices(userAddress, config = {}) {
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Memoize config to prevent re-initialization
    const memoizedConfig = useMemo(() => ({
        geminiApiKey: config.geminiApiKey,
        embeddingModel: config.embeddingModel || 'text-embedding-004',
        embeddingDimension: config.embeddingDimension || 768,
        hnswMaxElements: config.hnswMaxElements || 10000,
        hnswM: config.hnswM || 16,
        hnswEfConstruction: config.hnswEfConstruction || 200,
        batchSize: config.batchSize || 50,
        batchDelayMs: config.batchDelayMs || 5000
    }), [
        config.geminiApiKey,
        config.embeddingModel,
        config.embeddingDimension,
        config.hnswMaxElements,
        config.hnswM,
        config.hnswEfConstruction,
        config.batchSize,
        config.batchDelayMs
    ]);
    // Initialize services on mount
    useEffect(() => {
        if (!userAddress) {
            setIsReady(false);
            return;
        }
        // Increment ref count on mount
        if (servicesStore.has(userAddress)) {
            const existing = servicesStore.get(userAddress);
            existing.refCount++;
            setIsReady(true);
            console.log(`✅ Using existing services for ${userAddress} (refCount: ${existing.refCount})`);
        }
        let mounted = true;
        const initializeServices = async () => {
            try {
                setIsLoading(true);
                setError(null);
                // Check if services already exist (already checked above, but keeping for clarity)
                if (servicesStore.has(userAddress)) {
                    setIsReady(true);
                    setIsLoading(false);
                    return;
                }
                // DEBUG: Log the API key status
                console.log('🔍 useMemoryServices - Initializing with config:', {
                    hasGeminiApiKey: !!memoizedConfig.geminiApiKey,
                    apiKeyPreview: memoizedConfig.geminiApiKey ? `${memoizedConfig.geminiApiKey.substring(0, 10)}...` : 'UNDEFINED',
                    model: memoizedConfig.embeddingModel,
                    dimensions: memoizedConfig.embeddingDimension
                });
                // Initialize embedding service
                const embeddingService = new EmbeddingService({
                    apiKey: memoizedConfig.geminiApiKey,
                    model: memoizedConfig.embeddingModel,
                    dimensions: memoizedConfig.embeddingDimension
                });
                // Initialize HNSW service
                const hnswService = new BrowserHnswIndexService({
                    dimension: memoizedConfig.embeddingDimension,
                    maxElements: memoizedConfig.hnswMaxElements,
                    m: memoizedConfig.hnswM,
                    efConstruction: memoizedConfig.hnswEfConstruction
                }, {
                    maxBatchSize: memoizedConfig.batchSize,
                    batchDelayMs: memoizedConfig.batchDelayMs
                });
                // Initialize knowledge graph manager
                const graphManager = new BrowserKnowledgeGraphManager();
                // Try to load existing index from IndexedDB
                try {
                    await hnswService.loadIndexFromDB(userAddress);
                    console.log('✅ Loaded existing HNSW index from IndexedDB');
                }
                catch (err) {
                    console.log('ℹ️ No existing index found, will create on first add');
                }
                // Store services
                servicesStore.set(userAddress, {
                    embedding: embeddingService,
                    hnsw: hnswService,
                    graph: graphManager,
                    refCount: 1
                });
                if (mounted) {
                    setIsReady(true);
                    setIsLoading(false);
                }
            }
            catch (err) {
                console.error('Failed to initialize memory services:', err);
                if (mounted) {
                    setError(err);
                    setIsLoading(false);
                }
            }
        };
        initializeServices();
        // Cleanup on unmount
        return () => {
            mounted = false;
            if (userAddress && servicesStore.has(userAddress)) {
                const services = servicesStore.get(userAddress);
                services.refCount--;
                // Destroy services if no more references
                if (services.refCount <= 0) {
                    console.log(`🧹 Cleaning up services for user ${userAddress}`);
                    services.hnsw.destroy();
                    services.graph.destroy();
                    servicesStore.delete(userAddress);
                }
            }
        };
    }, [userAddress, memoizedConfig]);
    // Return current services (get from store directly)
    if (!userAddress) {
        return {
            embeddingService: null,
            hnswService: null,
            graphManager: null,
            isReady: false,
            isLoading,
            error
        };
    }
    // Get services from store
    const services = servicesStore.get(userAddress);
    if (!services || !isReady) {
        return {
            embeddingService: null,
            hnswService: null,
            graphManager: null,
            isReady: false,
            isLoading,
            error
        };
    }
    return {
        embeddingService: services.embedding,
        hnswService: services.hnsw,
        graphManager: services.graph,
        isReady,
        isLoading,
        error
    };
}
/**
 * Clear all services for a specific user (useful for logout)
 */
export function clearMemoryServices(userAddress) {
    if (servicesStore.has(userAddress)) {
        const services = servicesStore.get(userAddress);
        services.hnsw.destroy();
        services.graph.destroy();
        servicesStore.delete(userAddress);
        console.log(`✅ Cleared services for user ${userAddress}`);
    }
}
/**
 * Get current service statistics
 */
export function getMemoryServicesStats() {
    return {
        activeUsers: servicesStore.size,
        services: Array.from(servicesStore.entries()).map(([userAddress, services]) => ({
            userAddress,
            refCount: services.refCount,
            hnswStats: services.hnsw.getCacheStats()
        }))
    };
}
//# sourceMappingURL=useMemoryServices.js.map