/**
 * useMemoryIndex - Hook for indexing memories
 *
 * Provides interface for adding memories to vector index and knowledge graph.
 * Handles embedding generation, batching, and persistence automatically.
 */
import { type MemoryServicesConfig } from './useMemoryServices';
export interface AddMemoryOptions {
    /** Memory content (will be embedded) */
    content: string;
    /** Category for filtering */
    category: string;
    /** Importance score (1-10) */
    importance?: number;
    /** Custom metadata */
    metadata?: Record<string, any>;
    /** Entities to extract/add to graph */
    entities?: Array<{
        id: string;
        label: string;
        type: string;
        confidence?: number;
    }>;
    /** Relationships to add to graph */
    relationships?: Array<{
        source: string;
        target: string;
        label: string;
        confidence?: number;
    }>;
}
export interface IndexedMemory {
    memoryId: string;
    vectorId: number;
    embedding: number[];
    indexed: boolean;
    indexedAt: Date;
}
export interface IndexStats {
    totalMemories: number;
    pendingVectors: number;
    cacheSize: number;
    lastFlush?: Date;
}
/**
 * Add and manage memories in the vector index
 *
 * @param userAddress - User's blockchain address
 * @param config - Optional services configuration
 * @returns Functions for indexing memories and stats
 *
 * @example
 * ```tsx
 * function AddMemoryForm() {
 *   const account = useCurrentAccount();
 *   const { addMemory, flush, isIndexing, stats } = useMemoryIndex(account?.address);
 *
 *   const handleSubmit = async (content: string) => {
 *     const result = await addMemory({
 *       content,
 *       category: 'personal',
 *       importance: 7,
 *       entities: [{ id: 'paris', label: 'Paris', type: 'location' }]
 *     });
 *     console.log('Indexed:', result);
 *   };
 *
 *   return (
 *     <div>
 *       <textarea onChange={(e) => handleSubmit(e.target.value)} />
 *       <p>Pending: {stats.pendingVectors}</p>
 *       <button onClick={flush}>Save Now</button>
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useMemoryIndex(userAddress?: string, config?: MemoryServicesConfig): {
    addMemory: (options: AddMemoryOptions) => Promise<IndexedMemory>;
    addBatch: (memories: AddMemoryOptions[]) => Promise<IndexedMemory[]>;
    flush: () => Promise<void>;
    removeMemory: (memoryId: string, vectorId: number) => Promise<boolean>;
    isIndexing: boolean;
    isReady: boolean;
    error: Error | null;
    lastIndexed: IndexedMemory | null;
    stats: IndexStats;
    getDetailedStats: () => import("../vector").BatchStats | null;
};
//# sourceMappingURL=useMemoryIndex.d.ts.map