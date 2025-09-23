/**
 * BlockchainManager - Memory Ownership & Metadata Management
 *
 * Orchestrates blockchain operations for memory records, manages ownership,
 * and provides seamless integration with memory processing pipeline.
 */
import { MemoryRecord, MemoryIndex, TransactionResult } from './SuiService';
import { ProcessedMemory } from '../embedding/types';
export interface BlockchainManagerConfig {
    suiConfig?: {
        network?: 'testnet' | 'mainnet' | 'devnet' | 'localnet';
        packageId?: string;
        adminPrivateKey?: string;
        enableBatching?: boolean;
        batchSize?: number;
        batchDelayMs?: number;
    };
    enableOwnershipTracking?: boolean;
    enableMetadataSync?: boolean;
    retryAttempts?: number;
    enableCaching?: boolean;
}
export interface MemoryOwnershipRecord {
    memoryId: string;
    userId: string;
    blockchainRecordId: string;
    vectorId: number;
    blobId: string;
    category: string;
    createdAt: Date;
    transactionDigest: string;
    version: number;
}
export interface IndexOwnershipRecord {
    indexId: string;
    userId: string;
    blockchainRecordId: string;
    indexBlobId: string;
    graphBlobId: string;
    version: number;
    createdAt: Date;
    lastUpdated: Date;
}
export interface BlockchainOperation {
    id: string;
    type: 'create_memory' | 'create_index' | 'update_index';
    userId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    data: any;
    result?: TransactionResult;
    createdAt: Date;
    completedAt?: Date;
    error?: string;
}
export interface OwnershipVerification {
    isOwner: boolean;
    ownerAddress: string;
    recordExists: boolean;
    lastVerified: Date;
    blockchainRecord?: MemoryRecord | MemoryIndex;
}
export interface BlockchainStats {
    totalRecords: number;
    memoryRecords: number;
    indexRecords: number;
    successfulOperations: number;
    failedOperations: number;
    pendingOperations: number;
    averageProcessingTime: number;
    gasEfficiency: {
        averageGasUsed: number;
        totalGasCost: number;
        optimizationSavings: number;
    };
    networkHealth: string;
}
/**
 * Blockchain manager for memory ownership and decentralized metadata
 */
export declare class BlockchainManager {
    private suiService;
    private ownershipCache;
    private indexCache;
    private operations;
    private verificationCache;
    private readonly config;
    private stats;
    constructor(config?: BlockchainManagerConfig);
    /**
     * Create blockchain record for processed memory
     */
    createMemoryRecord(memory: ProcessedMemory, userId: string, options?: {
        priority?: 'low' | 'normal' | 'high';
        enableBatching?: boolean;
        customMetadata?: Record<string, string>;
    }): Promise<MemoryOwnershipRecord>;
    /**
     * Create or update memory index on blockchain
     */
    createOrUpdateMemoryIndex(userId: string, indexBlobId: string, graphBlobId: string, existingIndexId?: string, options?: {
        priority?: 'low' | 'normal' | 'high';
        enableBatching?: boolean;
        expectedVersion?: number;
    }): Promise<IndexOwnershipRecord>;
    /**
     * Verify memory ownership
     */
    verifyOwnership(memoryId: string, userId: string, options?: {
        useCache?: boolean;
        forceRefresh?: boolean;
    }): Promise<OwnershipVerification>;
    /**
     * Get user's memory ownership records
     */
    getUserOwnershipRecords(userId: string): Promise<{
        memoryRecords: MemoryOwnershipRecord[];
        indexRecords: IndexOwnershipRecord[];
    }>;
    /**
     * Process multiple memory records in batch
     */
    createMemoryRecordsBatch(memories: Array<{
        memory: ProcessedMemory;
        userId: string;
        customMetadata?: Record<string, string>;
    }>, options?: {
        batchSize?: number;
        onProgress?: (completed: number, total: number) => void;
    }): Promise<Array<MemoryOwnershipRecord | {
        error: string;
        memoryId: string;
    }>>;
    /**
     * Flush pending blockchain operations
     */
    flushPendingOperations(): Promise<TransactionResult[]>;
    /**
     * Get comprehensive blockchain statistics
     */
    getBlockchainStats(): BlockchainStats;
    /**
     * Get operation status
     */
    getOperationStatus(operationId: string): BlockchainOperation | null;
    /**
     * Get pending operations
     */
    getPendingOperations(): BlockchainOperation[];
    /**
     * Clear caches and reset
     */
    clearCaches(): void;
    private convertToBlockchainMetadata;
    private mapPriority;
    private generateContentHash;
    private generateOperationId;
    private updateProcessingTimeStats;
    private isCacheValid;
}
export default BlockchainManager;
//# sourceMappingURL=BlockchainManager.d.ts.map