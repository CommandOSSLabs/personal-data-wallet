/**
 * StorageManager - Unified Storage Operations Manager
 *
 * Orchestrates Walrus storage operations with intelligent batching,
 * encryption management, and seamless integration with memory processing.
 */
import { MemoryMetadata } from './WalrusService';
import { ProcessedMemory } from '../embedding/types';
export interface StorageManagerConfig {
    walrusConfig?: {
        network?: 'testnet' | 'mainnet';
        enableEncryption?: boolean;
        enableBatching?: boolean;
        batchSize?: number;
        batchDelayMs?: number;
    };
    enableDistributedStorage?: boolean;
    enableCompressionn?: boolean;
    retentionPolicyDays?: number;
}
export interface StorageResult {
    success: boolean;
    blobId?: string;
    metadata?: MemoryMetadata;
    error?: string;
    processingTimeMs: number;
    isEncrypted: boolean;
    storageProvider: 'walrus' | 'local' | 'distributed';
}
export interface RetrievalOptions {
    includeMetadata?: boolean;
    decryptionKey?: string;
    preferCache?: boolean;
    timeout?: number;
}
export interface StorageBatchOperation {
    memory: ProcessedMemory;
    userId: string;
    priority?: 'low' | 'normal' | 'high';
    encryptionRequired?: boolean;
}
export interface StorageBatchResult {
    successful: StorageResult[];
    failed: Array<{
        memory: ProcessedMemory;
        error: string;
    }>;
    totalProcessingTime: number;
    averageProcessingTime: number;
}
export interface StorageStats {
    totalOperations: number;
    successfulUploads: number;
    failedUploads: number;
    totalRetrievals: number;
    storageProviders: {
        walrus: {
            uploads: number;
            retrievals: number;
            success_rate: number;
        };
        local: {
            uploads: number;
            retrievals: number;
            success_rate: number;
        };
    };
    averageUploadTime: number;
    averageRetrievalTime: number;
    totalStorageUsed: number;
    encryptionRate: number;
    compressionSavings: number;
}
/**
 * Unified storage manager coordinating multiple storage providers
 */
export declare class StorageManager {
    private walrusService;
    private pendingOperations;
    private batchQueue;
    private batchTimer?;
    private readonly config;
    private stats;
    constructor(config?: StorageManagerConfig);
    /**
     * Store processed memory with comprehensive options
     */
    storeMemory(memory: ProcessedMemory, userId: string, options?: {
        priority?: 'low' | 'normal' | 'high';
        enableEncryption?: boolean;
        enableBatching?: boolean;
        customMetadata?: Record<string, string>;
    }): Promise<StorageResult>;
    /**
     * Store multiple memories in batch
     */
    storeMemoryBatch(operations: StorageBatchOperation[], options?: {
        enableProgress?: boolean;
        onProgress?: (completed: number, total: number) => void;
        maxConcurrent?: number;
    }): Promise<StorageBatchResult>;
    /**
     * Add memory to batch queue for deferred processing
     */
    addToBatchQueue(memory: ProcessedMemory, userId: string, options?: {
        priority?: 'low' | 'normal' | 'high';
        encryptionRequired?: boolean;
    }): void;
    /**
     * Process pending batch queue
     */
    processBatchQueue(): Promise<StorageBatchResult>;
    /**
     * Retrieve memory by blob ID
     */
    retrieveMemory(blobId: string, options?: RetrievalOptions): Promise<{
        memory: ProcessedMemory | null;
        metadata: MemoryMetadata | null;
        retrievalTimeMs: number;
        isFromCache: boolean;
    }>;
    /**
     * Retrieve multiple memories by blob IDs
     */
    retrieveMemoryBatch(blobIds: string[], options?: RetrievalOptions & {
        batchSize?: number;
        decryptionKeys?: Record<string, string>;
    }): Promise<Array<{
        blobId: string;
        memory: ProcessedMemory | null;
        metadata: MemoryMetadata | null;
        success: boolean;
        error?: string;
    }>>;
    /**
     * List user's stored memories
     */
    listUserMemories(userId: string, options?: {
        category?: string;
        limit?: number;
        offset?: number;
        sortBy?: 'date' | 'size' | 'importance';
        includeMetadata?: boolean;
    }): Promise<{
        memory: ProcessedMemory;
        blobId: string;
        metadata: MemoryMetadata | null;
        blobInfo: import("./WalrusService").BlobInfo;
    }[]>;
    /**
     * Delete stored memory
     */
    deleteMemory(blobId: string): Promise<boolean>;
    /**
     * Get storage analytics
     */
    getStorageAnalytics(): {
        walrusService: import("./WalrusService").WalrusStats;
        cache: {
            size: number;
            totalSizeBytes: number;
            oldestEntry: Date | null;
            newestEntry: Date | null;
        };
        batchQueue: {
            pending: number;
            operations: number;
        };
        totalOperations: number;
        successfulUploads: number;
        failedUploads: number;
        totalRetrievals: number;
        storageProviders: {
            walrus: {
                uploads: number;
                retrievals: number;
                success_rate: number;
            };
            local: {
                uploads: number;
                retrievals: number;
                success_rate: number;
            };
        };
        averageUploadTime: number;
        averageRetrievalTime: number;
        totalStorageUsed: number;
        encryptionRate: number;
        compressionSavings: number;
    };
    /**
     * Cleanup old data based on retention policy
     */
    cleanupOldData(): Promise<{
        deletedCount: number;
        freedSpaceBytes: number;
    }>;
    private executeStoreOperation;
    private scheduleBatchProcessing;
    private updateStorageStats;
    private updateUploadStats;
    private updateRetrievalStats;
    private updateEncryptionRate;
    private updateProviderSuccessRates;
}
export default StorageManager;
//# sourceMappingURL=StorageManager.d.ts.map