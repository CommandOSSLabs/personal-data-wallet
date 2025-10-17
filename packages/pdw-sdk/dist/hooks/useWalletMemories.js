/**
 * useWalletMemories - Hook for fetching and managing all memories owned by the connected wallet
 *
 * Dashboard view of user's memories with filtering and sorting.
 *
 * @example
 * ```tsx
 * import { useWalletMemories } from 'personal-data-wallet-sdk/hooks';
 * import { useCurrentAccount } from '@mysten/dapp-kit';
 *
 * function MemoryDashboard() {
 *   const account = useCurrentAccount();
 *
 *   const {
 *     memories,
 *     isLoading,
 *     refetch,
 *     filters,
 *     setFilters,
 *     sortBy,
 *     setSortBy,
 *     stats
 *   } = useWalletMemories(account?.address, {
 *     initialFilters: {
 *       category: 'personal',
 *       dateRange: { start: new Date('2024-01-01'), end: new Date() }
 *     },
 *     sortBy: 'timestamp-desc'
 *   });
 *
 *   return (
 *     <div>
 *       <h2>My Memories ({stats.total})</h2>
 *       {memories.map((memory) => (
 *         <MemoryCard key={memory.blobId} memory={memory} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { cacheKeys, defaultStaleTimes } from './utils/cache';
/**
 * Hook for fetching and managing all memories owned by the connected wallet
 */
export function useWalletMemories(userAddress, options = {}) {
    const { initialFilters = {}, sortBy: initialSortBy = 'timestamp-desc', packageId, enabled = true, staleTime = defaultStaleTimes.walletMemories, } = options;
    const client = useSuiClient();
    const [filters, setFiltersState] = useState(initialFilters);
    const [sortBy, setSortBy] = useState(initialSortBy);
    // Fetch memories from chain
    const queryResult = useQuery({
        queryKey: cacheKeys.walletMemories(userAddress),
        queryFn: async () => {
            if (!userAddress) {
                throw new Error('No user address provided');
            }
            if (!packageId) {
                throw new Error('Package ID not provided');
            }
            // Query owned MemoryRecord objects
            const response = await client.getOwnedObjects({
                owner: userAddress,
                filter: {
                    StructType: `${packageId}::memory::MemoryRecord`,
                },
                options: {
                    showContent: true,
                    showType: true,
                },
            });
            // Parse memories
            const memories = response.data
                .filter((obj) => obj.data?.content?.dataType === 'moveObject')
                .map((obj) => {
                const fields = obj.data.content.fields;
                return {
                    blobId: fields.blob_id || '',
                    category: fields.category || 'personal',
                    importance: parseInt(fields.importance) || 5,
                    contentLength: parseInt(fields.content_length) || 0,
                    timestamp: new Date(parseInt(fields.timestamp) || Date.now()),
                    owner: userAddress,
                };
            });
            return memories;
        },
        enabled: enabled && !!userAddress && !!packageId,
        staleTime,
        retry: 2,
    });
    // Filter memories
    const filteredMemories = useMemo(() => {
        let result = queryResult.data || [];
        // Apply category filter
        if (filters.category && filters.category !== 'all') {
            result = result.filter((m) => m.category === filters.category);
        }
        // Apply date range filter
        if (filters.dateRange) {
            result = result.filter((m) => {
                const timestamp = m.timestamp.getTime();
                const start = filters.dateRange.start.getTime();
                const end = filters.dateRange.end.getTime();
                return timestamp >= start && timestamp <= end;
            });
        }
        // Apply importance filter
        if (filters.minImportance !== undefined) {
            result = result.filter((m) => m.importance >= filters.minImportance);
        }
        return result;
    }, [queryResult.data, filters]);
    // Sort memories
    const sortedMemories = useMemo(() => {
        const result = [...filteredMemories];
        switch (sortBy) {
            case 'timestamp-asc':
                return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            case 'timestamp-desc':
                return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            case 'importance':
                return result.sort((a, b) => b.importance - a.importance);
            case 'category':
                return result.sort((a, b) => a.category.localeCompare(b.category));
            default:
                return result;
        }
    }, [filteredMemories, sortBy]);
    // Calculate statistics
    const stats = useMemo(() => {
        const allMemories = queryResult.data || [];
        const byCategory = {};
        allMemories.forEach((memory) => {
            byCategory[memory.category] = (byCategory[memory.category] || 0) + 1;
        });
        const totalStorageBytes = allMemories.reduce((sum, memory) => sum + memory.contentLength, 0);
        return {
            total: allMemories.length,
            byCategory,
            totalStorageBytes,
        };
    }, [queryResult.data]);
    // Update filters function
    const setFilters = (newFilters) => {
        setFiltersState((prev) => ({ ...prev, ...newFilters }));
    };
    return {
        memories: sortedMemories,
        isLoading: queryResult.isLoading,
        isSuccess: queryResult.isSuccess,
        isError: queryResult.isError,
        error: queryResult.error,
        refetch: queryResult.refetch,
        filters,
        setFilters,
        sortBy,
        setSortBy,
        stats,
    };
}
export default useWalletMemories;
//# sourceMappingURL=useWalletMemories.js.map