/**
 * React Query cache keys for memory operations
 */
export declare const cacheKeys: {
    readonly memoryManager: (address?: string) => readonly ["memoryManager", string | undefined];
    readonly searchMemories: (address?: string, query?: string) => readonly ["searchMemories", string | undefined, string | undefined];
    readonly walletMemories: (address?: string) => readonly ["walletMemories", string | undefined];
    readonly walletMemoriesWithFilters: (address?: string, filters?: any) => readonly ["walletMemories", string | undefined, any];
    readonly memory: (blobId: string) => readonly ["memory", string];
    readonly memoryMetadata: (blobId: string) => readonly ["memoryMetadata", string];
    readonly chatHistory: (sessionId: string) => readonly ["chatHistory", string];
    readonly memoryStats: (address?: string) => readonly ["memoryStats", string | undefined];
};
/**
 * Default stale times for different query types (in milliseconds)
 */
export declare const defaultStaleTimes: {
    readonly memoryManager: number;
    readonly searchMemories: number;
    readonly walletMemories: number;
    readonly memory: number;
    readonly chatHistory: number;
    readonly memoryStats: number;
};
//# sourceMappingURL=cache.d.ts.map