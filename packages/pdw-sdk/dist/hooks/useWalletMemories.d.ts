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
import type { WalletMemory, MemoryFilters, SortOption, MemoryStats } from './utils/types';
export interface UseWalletMemoriesOptions {
    /**
     * Initial filters to apply
     */
    initialFilters?: MemoryFilters;
    /**
     * Initial sort option
     * @default 'timestamp-desc'
     */
    sortBy?: SortOption;
    /**
     * Package ID for memory contract
     */
    packageId?: string;
    /**
     * Whether to enable the query
     * @default true
     */
    enabled?: boolean;
    /**
     * How long to consider data fresh (in milliseconds)
     * @default 1 minute
     */
    staleTime?: number;
}
export interface UseWalletMemoriesReturn {
    /**
     * Filtered and sorted memories
     */
    memories: WalletMemory[];
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
     * Refetch the memories
     */
    refetch: () => void;
    /**
     * Current filters
     */
    filters: MemoryFilters;
    /**
     * Update filters
     */
    setFilters: (filters: Partial<MemoryFilters>) => void;
    /**
     * Current sort option
     */
    sortBy: SortOption;
    /**
     * Update sort option
     */
    setSortBy: (sort: SortOption) => void;
    /**
     * Memory statistics
     */
    stats: MemoryStats;
}
/**
 * Hook for fetching and managing all memories owned by the connected wallet
 */
export declare function useWalletMemories(userAddress: string | undefined, options?: UseWalletMemoriesOptions): UseWalletMemoriesReturn;
export default useWalletMemories;
//# sourceMappingURL=useWalletMemories.d.ts.map