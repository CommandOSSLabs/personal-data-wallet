/**
 * useSearchMemories - Hook for searching memories with automatic caching
 *
 * Vector search with intelligent caching and real-time updates.
 * Uses the browser-compatible useMemorySearch hook internally.
 *
 * @example
 * ```tsx
 * import { useSearchMemories } from 'personal-data-wallet-sdk/hooks';
 * import { useCurrentAccount } from '@mysten/dapp-kit';
 * import { useState } from 'react';
 *
 * function MemorySearch() {
 *   const account = useCurrentAccount();
 *   const [query, setQuery] = useState('');
 *
 *   const { data: results, isLoading, error, refetch } = useSearchMemories(
 *     account?.address,
 *     query,
 *     {
 *       k: 5,
 *       minSimilarity: 0.7,
 *       enabled: query.length > 0, // Only search when query exists
 *       staleTime: 5 * 60 * 1000 // Cache for 5 minutes
 *     }
 *   );
 *
 *   return (
 *     <div>
 *       <input value={query} onChange={(e) => setQuery(e.target.value)} />
 *       {isLoading && <span>Searching...</span>}
 *       {results?.map((memory) => (
 *         <div key={memory.blobId}>
 *           {memory.content} (similarity: {memory.similarity.toFixed(2)})
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
import type { SearchMemoryOptions, SearchMemoryResult } from './utils/types';
export interface UseSearchMemoriesOptions extends SearchMemoryOptions {
    /**
     * Whether to enable the query
     * @default true
     */
    enabled?: boolean;
    /**
     * How long to consider data fresh (in milliseconds)
     * @default 5 minutes
     */
    staleTime?: number;
    /**
     * Debounce delay in milliseconds
     * @default 500
     */
    debounceMs?: number;
    /**
     * Gemini API key for embeddings
     */
    geminiApiKey?: string;
}
export interface UseSearchMemoriesReturn {
    /**
     * Search results
     */
    data?: SearchMemoryResult[];
    /**
     * Whether the query is loading
     */
    isLoading: boolean;
    /**
     * Whether the query succeeded
     */
    isSuccess: boolean;
    /**
     * Whether the query failed
     */
    isError: boolean;
    /**
     * The error if failed
     */
    error: Error | null;
    /**
     * Refetch the search results
     */
    refetch: () => void;
    /**
     * Whether there are more results to load
     */
    hasNextPage: boolean;
    /**
     * Load the next page of results
     */
    fetchNextPage: () => void;
}
/**
 * Hook for searching memories with automatic caching and debouncing
 */
export declare function useSearchMemories(userAddress: string | undefined, query: string, options?: UseSearchMemoriesOptions): UseSearchMemoriesReturn;
export default useSearchMemories;
//# sourceMappingURL=useSearchMemories.d.ts.map