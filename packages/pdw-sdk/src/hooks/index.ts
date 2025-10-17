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

export {
  useMemoryManager,
  type MemoryManagerConfig
} from './useMemoryManager';

export {
  useCreateMemory,
  type UseCreateMemoryOptions,
  type UseCreateMemoryReturn
} from './useCreateMemory';

export {
  useSearchMemories,
  type UseSearchMemoriesOptions,
  type UseSearchMemoriesReturn
} from './useSearchMemories';

export {
  useWalletMemories,
  type UseWalletMemoriesOptions,
  type UseWalletMemoriesReturn
} from './useWalletMemories';

export {
  useMemoryChat,
  type UseMemoryChatOptions,
  type UseMemoryChatReturn
} from './useMemoryChat';

// ==================== Browser-Compatible Hooks ====================

export {
  useMemoryServices,
  clearMemoryServices,
  getMemoryServicesStats,
  type MemoryServices,
  type MemoryServicesConfig
} from './useMemoryServices';

export {
  useMemorySearch,
  type SearchOptions,
  type SearchResult
} from './useMemorySearch';

export {
  useMemoryIndex,
  type AddMemoryOptions,
  type IndexedMemory,
  type IndexStats
} from './useMemoryIndex';

export {
  useKnowledgeGraph
} from './useKnowledgeGraph';

// ==================== Shared Types ====================

export type {
  Account,
  SignAndExecuteFunction,
  SignPersonalMessageFunction,
  CreateMemoryInput,
  CreateMemoryProgress,
  CreateMemoryResult,
  SearchMemoryOptions,
  SearchMemoryResult,
  MemoryFilters,
  SortOption,
  MemoryStats,
  WalletMemory,
  ChatMessage,
  MemoryChatConfig,
  MutationState,
  QueryState
} from './utils/types';
