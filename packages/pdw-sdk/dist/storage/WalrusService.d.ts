/**
 * WalrusService - Advanced Decentralized Storage Operations
 *
 * Production-ready Walrus integration with official client, SEAL encryption,
 * standardized tagging, and content verification following https://docs.wal.app/
 */
import type { SealService } from '../security/SealService';
export interface WalrusConfig {
    network?: 'testnet' | 'mainnet';
    adminAddress?: string;
    storageEpochs?: number;
    uploadRelayHost?: string;
    retryAttempts?: number;
    timeoutMs?: number;
    sealService?: SealService;
}
export interface MemoryMetadata {
    contentType: string;
    contentSize: number;
    contentHash: string;
    category: string;
    topic: string;
    importance: number;
    embeddingBlobId?: string;
    embeddingDimension: number;
    createdTimestamp: number;
    updatedTimestamp?: number;
    customMetadata?: Record<string, string>;
    isEncrypted?: boolean;
    encryptionType?: string;
}
export interface WalrusUploadResult {
    blobId: string;
    metadata: MemoryMetadata;
    embeddingBlobId?: string;
    isEncrypted: boolean;
    backupKey?: string;
    storageEpochs: number;
    uploadTimeMs: number;
}
export interface WalrusRetrievalResult {
    content: string | Buffer;
    metadata: MemoryMetadata;
    blobId: string;
    isFromCache: boolean;
    retrievalTimeMs: number;
}
export interface BlobInfo {
    blobId: string;
    size: number;
    contentType: string;
    uploadDate: Date;
    expiryDate?: Date;
    metadata: Record<string, string>;
    isAvailable: boolean;
}
export interface WalrusStats {
    totalUploads: number;
    totalRetrievals: number;
    successfulUploads: number;
    failedUploads: number;
    cacheHitRate: number;
    averageUploadTime: number;
    averageRetrievalTime: number;
    localFallbackCount: number;
    totalStorageUsed: number;
}
/**
 * Advanced Walrus service with comprehensive storage and metadata operations
 */
export declare class WalrusService {
    private readonly config;
    private cache;
    private pendingUploads;
    private stats;
    private readonly CACHE_TTL_MS;
    private sealService?;
    constructor(config?: Partial<WalrusConfig>);
    /**
     * Upload content with comprehensive metadata
     */
    uploadContentWithMetadata(content: string, ownerAddress: string, options?: {
        category?: string;
        topic?: string;
        importance?: number;
        epochs?: number;
        additionalTags?: Record<string, string>;
        enableEncryption?: boolean;
    }): Promise<WalrusUploadResult>;
    /**
     * Upload content with automatic encryption
     */
    uploadEncryptedContent(content: string, ownerAddress: string, metadata: MemoryMetadata, epochs?: number): Promise<{
        blobId: string;
        backupKey: string;
    }>;
    /**
     * Upload multiple files in batch
     */
    uploadBatch(items: Array<{
        content: string;
        ownerAddress: string;
        category?: string;
        topic?: string;
        importance?: number;
    }>, options?: {
        batchSize?: number;
        delayMs?: number;
        onProgress?: (completed: number, total: number) => void;
    }): Promise<WalrusUploadResult[]>;
    /**
     * Retrieve content with metadata
     */
    retrieveContent(blobId: string, decryptionKey?: string): Promise<WalrusRetrievalResult>;
    /**
     * Retrieve multiple blobs in batch
     */
    retrieveBatch(blobIds: string[], options?: {
        batchSize?: number;
        includeMetadata?: boolean;
        decryptionKeys?: Record<string, string>;
    }): Promise<Array<WalrusRetrievalResult | {
        error: string;
        blobId: string;
    }>>;
    /**
     * Get blob information without downloading content
     */
    getBlobInfo(blobId: string): Promise<BlobInfo | null>;
    /**
     * List user's blobs with metadata
     */
    listUserBlobs(userAddress: string, options?: {
        category?: string;
        limit?: number;
        offset?: number;
        sortBy?: 'date' | 'size' | 'importance';
    }): Promise<{
        blobs: BlobInfo[];
        totalCount: number;
    }>;
    /**
     * Delete blob (mark as deleted locally)
     */
    deleteBlob(blobId: string): Promise<boolean>;
    /**
     * Get comprehensive service statistics
     */
    getStats(): WalrusStats;
    /**
     * Check Walrus availability
     */
    checkWalrusAvailability(): Promise<boolean>;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Get cache info
     */
    getCacheInfo(): {
        size: number;
        totalSizeBytes: number;
        oldestEntry: Date | null;
        newestEntry: Date | null;
    };
    private createMetadataWithEmbedding;
    private generateContentHash;
    private generateEncryptionKey;
    private xorEncrypt;
    private xorDecrypt;
    private uploadToWalrus;
    private storeInWalrus;
    private retrieveFromWalrus;
    private findDuplicateContent;
    private cacheContent;
    private isCacheValid;
    private createUploadResult;
    private updateCacheHitRate;
    private updateAverageUploadTime;
    private updateAverageRetrievalTime;
    private delay;
}
export default WalrusService;
//# sourceMappingURL=WalrusService.d.ts.map