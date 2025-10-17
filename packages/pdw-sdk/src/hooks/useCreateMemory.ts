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

import { useState, useCallback, useRef } from 'react';
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useMemoryManager } from './useMemoryManager';
import type {
  CreateMemoryInput,
  CreateMemoryProgress,
  CreateMemoryResult,
  MemoryManagerConfig,
} from './utils/types';

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
 * No React Query dependency - uses plain React state
 */
export function useCreateMemory(options: UseCreateMemoryOptions = {}): UseCreateMemoryReturn {
  const {
    onSuccess,
    onError,
    onProgress,
    config,
  } = options;

  const client = useSuiClient();
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const manager = useMemoryManager(config);

  // State management
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<CreateMemoryResult | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<CreateMemoryProgress | undefined>();

  // Use ref to track if component is mounted (prevent state updates after unmount)
  const isMountedRef = useRef(true);

  // Progress handler
  const handleProgress = useCallback(
    (status: string) => {
      if (!isMountedRef.current) return;

      let stage: CreateMemoryProgress['stage'] = 'analyzing';

      if (status.includes('Analyzing')) {
        stage = 'analyzing';
      } else if (status.includes('embedding')) {
        stage = 'embedding';
      } else if (status.includes('Encrypting')) {
        stage = 'encrypting';
      } else if (status.includes('Uploading')) {
        stage = 'uploading';
      } else if (status.includes('Registering')) {
        stage = 'registering';
      } else if (status.includes('successfully')) {
        stage = 'success';
      }

      const progressUpdate: CreateMemoryProgress = {
        stage,
        message: status,
      };

      setProgress(progressUpdate);
      onProgress?.(progressUpdate);
    },
    [onProgress]
  );

  // Async mutation function
  const mutateAsync = useCallback(
    async (input: CreateMemoryInput): Promise<CreateMemoryResult> => {
      if (!manager) {
        throw new Error('Memory manager not initialized. Check your configuration.');
      }

      if (!account) {
        throw new Error('No wallet connected. Please connect your wallet.');
      }

      if (!client) {
        throw new Error('Sui client not available.');
      }

      if (!isMountedRef.current) return { blobId: '' };

      // Reset state
      setIsPending(true);
      setIsSuccess(false);
      setIsError(false);
      setError(null);
      setData(undefined);

      try {
        // Create memory
        const blobId = await manager.createMemory({
          content: input.content,
          category: input.category,
          account,
          signAndExecute: signAndExecute as any,
          client: client as any,
          onProgress: handleProgress,
        });

        const result: CreateMemoryResult = { blobId };

        if (isMountedRef.current) {
          setData(result);
          setIsSuccess(true);
          setIsPending(false);
        }

        onSuccess?.(result);
        return result;
      } catch (err: any) {
        const errorObj = err instanceof Error ? err : new Error(String(err));

        if (isMountedRef.current) {
          setError(errorObj);
          setIsError(true);
          setIsPending(false);
          setProgress({
            stage: 'error',
            message: errorObj.message,
          });
        }

        onError?.(errorObj);
        throw errorObj;
      }
    },
    [manager, account, client, signAndExecute, handleProgress, onSuccess, onError]
  );

  // Fire-and-forget mutation function
  const mutate = useCallback(
    (input: CreateMemoryInput) => {
      mutateAsync(input).catch(() => {
        // Error already handled in mutateAsync
      });
    },
    [mutateAsync]
  );

  // Reset function
  const reset = useCallback(() => {
    setIsPending(false);
    setIsSuccess(false);
    setIsError(false);
    setData(undefined);
    setError(null);
    setProgress(undefined);
  }, []);

  return {
    mutate,
    mutateAsync,
    isPending,
    isSuccess,
    isError,
    data,
    error,
    progress,
    reset,
  };
}

export default useCreateMemory;
