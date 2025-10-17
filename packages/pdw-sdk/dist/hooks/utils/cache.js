/**
 * React Query cache keys for memory operations
 */
export const cacheKeys = {
    // Memory manager instance
    memoryManager: (address) => ['memoryManager', address],
    // Memory search queries
    searchMemories: (address, query) => ['searchMemories', address, query],
    // Wallet memories
    walletMemories: (address) => ['walletMemories', address],
    walletMemoriesWithFilters: (address, filters) => ['walletMemories', address, filters],
    // Individual memory
    memory: (blobId) => ['memory', blobId],
    // Memory metadata
    memoryMetadata: (blobId) => ['memoryMetadata', blobId],
    // Chat history
    chatHistory: (sessionId) => ['chatHistory', sessionId],
    // Memory stats
    memoryStats: (address) => ['memoryStats', address],
};
/**
 * Default stale times for different query types (in milliseconds)
 */
export const defaultStaleTimes = {
    // Memory manager is stable once created
    memoryManager: Infinity,
    // Search results can be cached for 5 minutes
    searchMemories: 5 * 60 * 1000,
    // Wallet memories should be fresh (1 minute cache)
    walletMemories: 60 * 1000,
    // Individual memory content can be cached longer (10 minutes)
    memory: 10 * 60 * 1000,
    // Chat history is session-specific
    chatHistory: Infinity,
    // Stats should be relatively fresh
    memoryStats: 30 * 1000,
};
//# sourceMappingURL=cache.js.map