/**
 * React Hooks for Personal Data Wallet SDK
 *
 * High-level hooks for React dApps:
 * - useMemoryManager: Initialize ClientMemoryManager
 * - useCreateMemory: Create memories with progress tracking
 * - useSearchMemories: Search memories with caching
 * - useWalletMemories: Fetch and manage all user memories
 * - useMemoryChat: Memory-aware chat with AI integration
 *
 * Browser-compatible hooks for client-side operations:
 * - useMemorySearch: Vector search with HNSW
 * - useMemoryIndex: Memory indexing
 * - useKnowledgeGraph: Knowledge graph operations
 * - useMemoryServices: Low-level service management
 *
 * @example
 * ```tsx
 * import { useCreateMemory, useSearchMemories } from 'personal-data-wallet-sdk/hooks';
 * import { useCurrentAccount } from '@mysten/dapp-kit';
 *
 * function MyComponent() {
 *   const account = useCurrentAccount();
 *   const { mutate: createMemory, isPending } = useCreateMemory();
 *   const { data: results } = useSearchMemories(account?.address, query);
 *
 *   // Use the hooks...
 * }
 * ```
 */
// ==================== High-Level Hooks ====================
export { useMemoryManager } from './useMemoryManager';
export { useCreateMemory } from './useCreateMemory';
export { useSearchMemories } from './useSearchMemories';
export { useWalletMemories } from './useWalletMemories';
export { useMemoryChat } from './useMemoryChat';
// ==================== Browser-Compatible Hooks ====================
export { useMemoryServices, clearMemoryServices, getMemoryServicesStats } from './useMemoryServices';
export { useMemorySearch } from './useMemorySearch';
export { useMemoryIndex } from './useMemoryIndex';
export { useKnowledgeGraph } from './useKnowledgeGraph';
//# sourceMappingURL=index.js.map