/**
 * SuiService - Blockchain Integration for Memory Records
 *
 * Comprehensive Sui blockchain integration for memory ownership records,
 * transaction batching, and decentralized metadata management.
 */
export interface SuiConfig {
    network?: 'testnet' | 'mainnet' | 'devnet' | 'localnet';
    packageId?: string;
    adminPrivateKey?: string;
    rpcUrl?: string;
    enableBatching?: boolean;
    batchSize?: number;
    batchDelayMs?: number;
    gasObjectId?: string;
}
export interface MemoryRecord {
    id: string;
    owner: string;
    category: string;
    vectorId: number;
    blobId: string;
    metadata: MemoryMetadata;
    createdAt: Date;
    version: number;
}
export interface MemoryIndex {
    id: string;
    owner: string;
    version: number;
    indexBlobId: string;
    graphBlobId: string;
    lastUpdated: Date;
}
export interface MemoryMetadata {
    contentType: string;
    contentSize: number;
    contentHash: string;
    category: string;
    topic: string;
    importance: number;
    embeddingBlobId: string;
    embeddingDimension: number;
    createdTimestamp: number;
    updatedTimestamp: number;
    customMetadata: Record<string, string>;
}
export interface TransactionResult {
    digest: string;
    objectId?: string;
    effects?: any;
    events?: any[];
    success: boolean;
    error?: string;
    gasUsed?: number;
}
export interface BatchTransaction {
    id: string;
    userId: string;
    operation: 'create_memory' | 'create_index' | 'update_index';
    parameters: any;
    priority: number;
    timestamp: Date;
}
export interface SuiStats {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    averageGasUsed: number;
    batchedTransactions: number;
    totalGasCost: number;
    networkHealth: 'healthy' | 'degraded' | 'offline';
    lastSuccessfulTransaction?: Date;
}
/**
 * Sui blockchain service for memory ownership and metadata management
 */
export declare class SuiService {
    private client;
    private adminKeypair?;
    private readonly config;
    private batchQueue;
    private batchTimer?;
    private pendingTransactions;
    private stats;
    constructor(config?: Partial<SuiConfig>);
    /**
     * Create memory record on Sui blockchain
     */
    createMemoryRecord(userAddress: string, category: string, vectorId: number, blobId: string, metadata: MemoryMetadata, options?: {
        enableBatching?: boolean;
        priority?: number;
    }): Promise<TransactionResult>;
    /**
     * Create memory index on Sui blockchain
     */
    createMemoryIndex(userAddress: string, indexBlobId: string, graphBlobId: string, options?: {
        enableBatching?: boolean;
        priority?: number;
    }): Promise<TransactionResult>;
    /**
     * Update memory index on Sui blockchain
     */
    updateMemoryIndex(indexId: string, userAddress: string, expectedVersion: number, newIndexBlobId: string, newGraphBlobId: string, options?: {
        enableBatching?: boolean;
        priority?: number;
    }): Promise<TransactionResult>;
    /**
     * Get memory record by ID
     */
    getMemoryRecord(objectId: string): Promise<MemoryRecord | null>;
    /**
     * Get memory index by ID
     */
    getMemoryIndex(indexId: string): Promise<MemoryIndex | null>;
    /**
     * Get user's memory records
     */
    getUserMemoryRecords(userAddress: string, limit?: number): Promise<MemoryRecord[]>;
    /**
     * Get user's memory indices
     */
    getUserMemoryIndices(userAddress: string): Promise<MemoryIndex[]>;
    /**
     * Process pending batch transactions
     */
    processBatchQueue(): Promise<TransactionResult[]>;
    /**
     * Force process batch queue immediately
     */
    flushBatchQueue(): Promise<TransactionResult[]>;
    /**
     * Check network health
     */
    checkNetworkHealth(): Promise<'healthy' | 'degraded' | 'offline'>;
    /**
     * Get gas price recommendations
     */
    getGasPrice(): Promise<{
        referenceGasPrice: number;
        recommendation: string;
    }>;
    /**
     * Get transaction by digest
     */
    getTransaction(digest: string): Promise<import("@mysten/sui/client").SuiTransactionBlockResponse | null>;
    /**
     * Get service statistics
     */
    getStats(): SuiStats;
    /**
     * Get batch queue status
     */
    getBatchQueueStatus(): {
        pending: number;
        nextProcessing: Date | null;
        averageBatchSize: number;
    };
    /**
     * Reset statistics
     */
    resetStats(): void;
    private initializeSuiClient;
    private initializeAdminKeypair;
    private executeCreateMemoryRecord;
    private executeCreateMemoryIndex;
    private executeUpdateMemoryIndex;
    private executeTransaction;
    private extractCreatedObjectId;
    private addToBatch;
    private scheduleBatchProcessing;
    private serializeMetadata;
    private parseMetadata;
    private parseCustomMetadata;
    private updateGasStats;
    private generateTransactionId;
}
export default SuiService;
//# sourceMappingURL=SuiService.d.ts.map