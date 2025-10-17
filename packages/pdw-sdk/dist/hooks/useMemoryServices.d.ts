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
import { EmbeddingService } from '../services/EmbeddingService';
import { BrowserHnswIndexService } from '../vector/BrowserHnswIndexService';
import { BrowserKnowledgeGraphManager } from '../graph/BrowserKnowledgeGraphManager';
export interface MemoryServicesConfig {
    geminiApiKey?: string;
    embeddingModel?: string;
    embeddingDimension?: number;
    hnswMaxElements?: number;
    hnswM?: number;
    hnswEfConstruction?: number;
    batchSize?: number;
    batchDelayMs?: number;
}
export interface MemoryServices {
    embeddingService: EmbeddingService | null;
    hnswService: BrowserHnswIndexService | null;
    graphManager: BrowserKnowledgeGraphManager | null;
    isReady: boolean;
    isLoading: boolean;
    error: Error | null;
}
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
export declare function useMemoryServices(userAddress?: string, config?: MemoryServicesConfig): MemoryServices;
/**
 * Clear all services for a specific user (useful for logout)
 */
export declare function clearMemoryServices(userAddress: string): void;
/**
 * Get current service statistics
 */
export declare function getMemoryServicesStats(): {
    activeUsers: number;
    services: {
        userAddress: string;
        refCount: number;
        hnswStats: import("../vector").BatchStats;
    }[];
};
//# sourceMappingURL=useMemoryServices.d.ts.map