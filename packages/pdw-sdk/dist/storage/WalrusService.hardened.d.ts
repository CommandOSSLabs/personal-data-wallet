import { SealService } from '../security/SealService';
export interface MemoryMetadata {
    contentType: string;
    contentSize: number;
    contentHash: string;
    category: string;
    topic: string;
    importance: number;
    embeddingDimension: number;
    createdTimestamp: number;
    customMetadata: Record<string, string>;
    isEncrypted: boolean;
}
export interface WalrusConfig {
    network?: 'testnet' | 'mainnet';
    adminAddress?: string;
    storageEpochs?: number;
    uploadRelayHost?: string;
    retryAttempts?: number;
    timeoutMs?: number;
    sealService?: SealService;
}
export interface WalrusUploadOptions {
    category?: string;
    topic?: string;
    importance?: number;
    additionalTags?: Record<string, string>;
    enableEncryption?: boolean;
    epochs?: number;
}
export interface WalrusUploadResult {
    success: boolean;
    blobId: string;
    contentHash: string;
    metadata: MemoryMetadata;
    isEncrypted: boolean;
    uploadTimeMs: number;
    backupKey?: string;
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
    isEncrypted: boolean;
    tags: Record<string, string>;
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
export declare class WalrusService {
    private config;
    private cache;
    private stats;
    private readonly CACHE_TTL_MS;
    private sealService?;
    constructor(config?: Partial<WalrusConfig>);
    /**
     * Upload content to Walrus
     */
    uploadContent(content: string, ownerAddress: string, options?: WalrusUploadOptions): Promise<WalrusUploadResult>;
    /**
     * Retrieve content from Walrus
     */
    retrieveContent(blobId: string, decryptionKey?: string): Promise<WalrusRetrievalResult>;
    /**
     * Get blob information
     */
    getBlobInfo(blobId: string): Promise<BlobInfo | null>;
    /**
     * Delete blob from Walrus
     */
    deleteBlob(blobId: string): Promise<boolean>;
    /**
     * Get service statistics
     */
    getStats(): WalrusStats;
    /**
     * Clear cache
     */
    clearCache(): void;
    private createMetadataWithEmbedding;
    private generateContentHash;
    private uploadToWalrus;
    private retrieveFromWalrus;
    private findDuplicateContent;
    private cacheContent;
    private isCacheValid;
    private createUploadResult;
    private updateAverageUploadTime;
    private delay;
}
//# sourceMappingURL=WalrusService.hardened.d.ts.map