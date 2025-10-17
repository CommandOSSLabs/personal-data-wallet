/**
 * useCreateMemory - Hook for creating memories with automatic state management
 *
 * Simplifies memory creation with loading states, error handling, and progress tracking.
 *
 * @example
 * ```tsx
 * import { useCreateMemory } from 'personal-data-wallet-sdk/hooks';
 * import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
 *
 * function MemoryCreator() {
 *   const account = useCurrentAccount();
 *   const { mutate: signAndExecute } = useSignAndExecuteTransaction();
 *   const client = useSuiClient();
 *
 *   const { mutate: createMemory, isPending, data, error, progress } = useCreateMemory({
 *     onSuccess: (blobId) => {
 *       console.log('Memory created:', blobId);
 *     },
 *     onError: (error) => {
 *       console.error('Failed:', error);
 *     }
 *   });
 *
 *   const handleCreate = () => {
 *     createMemory({
 *       content: 'I love TypeScript',
 *       category: 'personal'
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCreate} disabled={isPending}>
 *         {isPending ? 'Creating...' : 'Create Memory'}
 *       </button>
 *       {progress && <div>{progress.message}</div>}
 *       {error && <div>Error: {error.message}</div>}
 *     </div>
 *   );
 * }
 * ```
 */
import type { CreateMemoryInput, CreateMemoryProgress, CreateMemoryResult, MemoryManagerConfig } from './utils/types';
export interface UseCreateMemoryOptions {
    /**
     * Callback when memory creation succeeds
     */
    onSuccess?: (result: CreateMemoryResult) => void;
    /**
     * Callback when memory creation fails
     */
    onError?: (error: Error) => void;
    /**
     * Callback for progress updates
     */
    onProgress?: (progress: CreateMemoryProgress) => void;
    /**
     * Optional memory manager config override
     */
    config?: MemoryManagerConfig;
    /**
     * Whether to automatically invalidate memory queries on success
     * @default true
     */
    invalidateQueries?: boolean;
}
export interface UseCreateMemoryReturn {
    /**
     * Mutation function to create a memory
     */
    mutate: (input: CreateMemoryInput) => void;
    /**
     * Async mutation function (returns promise)
     */
    mutateAsync: (input: CreateMemoryInput) => Promise<CreateMemoryResult>;
    /**
     * Whether the mutation is currently loading
     */
    isPending: boolean;
    /**
     * Whether the mutation succeeded
     */
    isSuccess: boolean;
    /**
     * Whether the mutation failed
     */
    isError: boolean;
    /**
     * The result data (blobId) if successful
     */
    data?: CreateMemoryResult;
    /**
     * The error if failed
     */
    error: Error | null;
    /**
     * Current progress status
     */
    progress?: CreateMemoryProgress;
    /**
     * Reset mutation state
     */
    reset: () => void;
}
/**
 * Hook for creating memories with automatic state management
 */
export declare function useCreateMemory(options?: UseCreateMemoryOptions): UseCreateMemoryReturn;
export default useCreateMemory;
//# sourceMappingURL=useCreateMemory.d.ts.map