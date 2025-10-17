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

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useMemorySearch } from './useMemorySearch';
import { cacheKeys, defaultStaleTimes } from './utils/cache';
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
export function useSearchMemories(
  userAddress: string | undefined,
  query: string,
  options: UseSearchMemoriesOptions = {}
): UseSearchMemoriesReturn {
  const {
    k = 10,
    minSimilarity = 0.5,
    enabled = true,
    staleTime = defaultStaleTimes.searchMemories,
    debounceMs = 500,
    geminiApiKey,
  } = options;

  // Debounce the query
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // DEBUG: Log API key status
  console.log('🔍 useSearchMemories - Config:', {
    hasApiKey: !!geminiApiKey,
    apiKeyPreview: geminiApiKey ? `${geminiApiKey.substring(0, 10)}...` : 'UNDEFINED',
    userAddress: userAddress ? `${userAddress.substring(0, 10)}...` : 'UNDEFINED'
  });

  // Use the browser-compatible memory search hook with API key config
  const { search, results, isSearching, error: searchError, isReady } = useMemorySearch(
    userAddress,
    geminiApiKey ? { geminiApiKey } : undefined
  );

  // React Query for caching and state management
  const queryResult = useQuery({
    queryKey: cacheKeys.searchMemories(userAddress, debouncedQuery),
    queryFn: async (): Promise<SearchMemoryResult[]> => {
      if (!userAddress) {
        throw new Error('No user address provided');
      }

      if (!debouncedQuery || debouncedQuery.trim().length === 0) {
        return [];
      }

      // Perform the search
      await search(debouncedQuery, { k, threshold: minSimilarity });

      // Convert results to expected format
      if (!results || !Array.isArray(results)) {
        return [];
      }

      return results.map((result: any) => ({
        blobId: result.blobId,
        content: result.content,
        category: result.category,
        similarity: result.similarity,
        timestamp: new Date(result.timestamp || Date.now()),
        embedding: result.embedding,
      }));
    },
    enabled: enabled && !!userAddress && debouncedQuery.trim().length > 0 && isReady,
    staleTime,
    retry: 1,
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading || isSearching,
    isSuccess: queryResult.isSuccess,
    isError: queryResult.isError,
    error: queryResult.error || searchError,
    refetch: queryResult.refetch,
    hasNextPage: false, // Pagination not implemented yet
    fetchNextPage: () => {
      // TODO: Implement pagination
      console.warn('Pagination not yet implemented');
    },
  };
}

export default useSearchMemories;
