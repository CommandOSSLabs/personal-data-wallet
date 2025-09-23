/**
 * WalrusService - Decentralized storage on Walrus network
 */
import { WalrusConfig, WalrusUploadResult, WalrusRetrievalResult, PDWMemoryMetadata } from '../types';
export declare class WalrusService {
    private config;
    private walrusClient;
    private suiClient;
    private defaultSigner?;
    private cache;
    private readonly cacheTimeoutMs;
    constructor(config?: WalrusConfig & {
        defaultSigner?: any;
    });
    /**
     * Initialize Walrus client
     */
    private initializeClients;
    /**
     * Store data on Walrus
     * Note: This method requires a signer for blockchain operations
     */
    store(data: string | Uint8Array, metadata?: Partial<PDWMemoryMetadata>, options?: {
        signer?: any;
        epochs?: number;
        deletable?: boolean;
        owner?: string;
    }): Promise<WalrusUploadResult>;
    /**
     * Retrieve data from Walrus
     */
    retrieve(blobId: string): Promise<WalrusRetrievalResult>;
    /**
     * Store vector index on Walrus
     */
    storeVectorIndex(userId: string, indexData: Uint8Array, signer?: any): Promise<WalrusUploadResult>;
    /**
     * Retrieve vector index from Walrus
     */
    retrieveVectorIndex(blobId: string): Promise<Uint8Array>;
    /**
     * Retry operation with exponential backoff
     */
    private retryOperation;
    /**
     * Add data to cache
     */
    private addToCache;
    /**
     * Get data from cache if not expired
     */
    private getFromCache;
    /**
     * Clean up expired cache entries
     */
    private cleanupCache;
    /**
     * Clear all cache
     */
    clearCache(): void;
    /**
     * Generate hash for data integrity
     */
    private hashData;
    /**
     * Set default signer for Walrus operations
     */
    setDefaultSigner(signer: any): void;
    /**
     * Check if blob exists on Walrus
     */
    blobExists(blobId: string): Promise<boolean>;
    /**
     * Get blob size without downloading full content
     */
    getBlobSize(blobId: string): Promise<number>;
    /**
     * Store multiple items in batch
     */
    storeBatch(items: Array<{
        data: string | Uint8Array;
        metadata?: Partial<PDWMemoryMetadata>;
        options?: {
            epochs?: number;
            deletable?: boolean;
        };
    }>, batchOptions?: {
        signer?: any;
        owner?: string;
        maxConcurrent?: number;
    }): Promise<Array<WalrusUploadResult | {
        error: string;
    }>>;
    /**
     * Retrieve multiple items in batch
     */
    retrieveBatch(blobIds: string[], options?: {
        maxConcurrent?: number;
    }): Promise<Array<WalrusRetrievalResult | {
        error: string;
    }>>;
    /**
     * Get service statistics
     */
    getStats(): {
        network: "testnet" | "mainnet";
        encryption: boolean;
        batching: boolean;
        clientInitialized: boolean;
        hasDefaultSigner: boolean;
        cache: {
            size: number;
            timeoutMs: number;
        };
    };
}
//# sourceMappingURL=WalrusService.d.ts.map