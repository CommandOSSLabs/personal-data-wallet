/**
 * useMemorySearch - Hook for searching memories with vector similarity
 *
 * Provides high-level interface for semantic memory search combining:
 * - Vector similarity (HNSW)
 * - Knowledge graph expansion
 * - Metadata filtering
 * - Relevance scoring
 */
import { type MemoryServicesConfig } from './useMemoryServices';
import type { HNSWSearchResult } from '../embedding/types';
export interface SearchOptions {
    /** Number of results to return */
    k?: number;
    /** Similarity threshold (0-1) */
    threshold?: number;
    /** Search mode */
    mode?: 'semantic' | 'hybrid' | 'exact';
    /** Filter by categories */
    categories?: string[];
    /** Date range filter */
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    /** Importance range filter */
    importanceRange?: {
        min?: number;
        max?: number;
    };
    /** Include knowledge graph expansion */
    includeGraph?: boolean;
    /** Boost recent memories */
    boostRecent?: boolean;
    /** Result diversity factor (0-1) */
    diversityFactor?: number;
}
export interface SearchResult {
    /** Vector search results */
    vectorResults: {
        ids: number[];
        distances: number[];
        similarities: number[];
    };
    /** Graph search results (if enabled) */
    graphResults?: {
        entities: any[];
        relationships: any[];
        relatedMemories: string[];
    };
    /** Search metadata */
    metadata: {
        queryTime: number;
        totalResults: number;
        mode: string;
    };
}
/**
 * Search memories using semantic vector similarity
 *
 * @param userAddress - User's blockchain address
 * @param config - Optional services configuration
 * @returns Search function and state
 *
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const account = useCurrentAccount();
 *   const { search, results, isSearching, error } = useMemorySearch(account?.address);
 *
 *   const handleSearch = async () => {
 *     const results = await search('memories about Paris', {
 *       k: 10,
 *       categories: ['travel'],
 *       includeGraph: true
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleSearch} disabled={isSearching}>
 *         Search
 *       </button>
 *       {results && <ResultsList results={results} />}
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useMemorySearch(userAddress?: string, config?: MemoryServicesConfig): {
    search: (query: string, options?: SearchOptions) => Promise<SearchResult>;
    searchByVector: (vector: number[], options?: Omit<SearchOptions, "includeGraph">) => Promise<HNSWSearchResult>;
    results: SearchResult | null;
    isSearching: boolean;
    isReady: boolean;
    error: Error | null;
    lastQuery: string;
    clearResults: () => void;
};
//# sourceMappingURL=useMemorySearch.d.ts.map