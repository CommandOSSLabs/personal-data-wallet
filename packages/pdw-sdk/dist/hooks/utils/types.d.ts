/**
 * Type definitions for React hooks
 */
import type { Transaction } from '@mysten/sui/transactions';
export interface Account {
    address: string;
}
export interface SignAndExecuteFunction {
    (params: {
        transaction: Transaction;
    }, callbacks: {
        onSuccess: (result: any) => void;
        onError: (error: Error) => void;
    }): void;
}
export interface SignPersonalMessageFunction {
    (params: {
        message: Uint8Array;
    }): Promise<{
        signature: string;
    }>;
}
export interface MemoryManagerConfig {
    packageId?: string;
    accessRegistryId?: string;
    walrusAggregator?: string;
    geminiApiKey?: string;
    sealServerObjectIds?: string[];
    walrusNetwork?: 'testnet' | 'mainnet';
    categories?: string[];
}
export interface CreateMemoryInput {
    content: string;
    category?: string;
}
export interface CreateMemoryProgress {
    stage: 'analyzing' | 'embedding' | 'encrypting' | 'uploading' | 'registering' | 'success' | 'error';
    message: string;
}
export interface CreateMemoryResult {
    blobId: string;
    transactionDigest?: string;
}
export interface SearchMemoryOptions {
    k?: number;
    minSimilarity?: number;
    category?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
    enabled?: boolean;
    staleTime?: number;
}
export interface SearchMemoryResult {
    blobId: string;
    content: string;
    category?: string;
    similarity: number;
    timestamp: Date;
    embedding?: number[];
}
export interface MemoryFilters {
    category?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
    minImportance?: number;
}
export type SortOption = 'timestamp-asc' | 'timestamp-desc' | 'importance' | 'category';
export interface MemoryStats {
    total: number;
    byCategory: Record<string, number>;
    totalStorageBytes: number;
}
export interface WalletMemory {
    blobId: string;
    category: string;
    importance: number;
    contentLength: number;
    timestamp: Date;
    owner: string;
}
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    memories?: SearchMemoryResult[];
}
export interface MemoryChatConfig {
    systemPrompt?: string;
    maxContextMemories?: number;
    aiProvider?: 'gemini' | 'openai' | 'anthropic';
    streamResponses?: boolean;
}
export interface MutationState<TData = unknown, TError = Error> {
    data?: TData;
    error: TError | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
}
export interface QueryState<TData = unknown, TError = Error> {
    data?: TData;
    error: TError | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    refetch: () => void;
}
//# sourceMappingURL=types.d.ts.map