/**
 * WalrusStorageService - Production Decentralized Storage
 *
 * Official Walrus client integration with SEAL encryption,
 * content verification, and standardized tagging per https://docs.wal.app/
 *
 * Removed all demo/placeholder code including:
 * - XOR encryption fallbacks
 * - Local storage fallbacks
 * - Node.js fs/path dependencies
 * - Mock availability checks
 */
import type { SealService } from '../seal/SealService';
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
    content: string;
    metadata: MemoryMetadata;
    isDecrypted: boolean;
    retrievalTimeMs: number;
}
export interface BlobInfo {
    blobId: string;
    contentType: string;
    contentLength: number;
    contentHash: string;
    metadata: Record<string, string>;
    tags: string[];
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
 * Production-ready Walrus storage service with official client integration
 */
export declare class WalrusStorageService {
    private readonly config;
    private readonly cache;
    private stats;
    private readonly CACHE_TTL_MS;
    private sealService?;
    constructor(config?: Partial<WalrusConfig>);
    /**
     * Store memory with encryption and metadata
     */
    storeMemory(content: string, category: string, options?: {
        topic?: string;
        importance?: number;
        customMetadata?: Record<string, string>;
        contextId?: string;
        appId?: string;
        encrypt?: boolean;
        userAddress?: string;
    }): Promise<WalrusUploadResult>;
    /**
     * Retrieve memory with decryption
     */
    retrieveMemory(blobId: string, options?: {
        userAddress?: string;
        sessionKey?: any;
        txBytes?: Uint8Array;
    }): Promise<WalrusRetrievalResult>;
    /**
     * Get service statistics
     */
    getStats(): WalrusStats;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Retrieve content by blobId with optional decryption
     */
    retrieveContent(blobId: string, decryptionKey?: string | Uint8Array): Promise<{
        content: string;
        metadata: MemoryMetadata;
        retrievalTimeMs: number;
        isFromCache: boolean;
    }>;
    /**
     * List blobs for a specific user
     */
    listUserBlobs(userId: string, options?: {
        category?: string;
        limit?: number;
        offset?: number;
        sortBy?: 'date' | 'size' | 'importance';
        filters?: Record<string, any>;
    }): Promise<{
        blobs: BlobInfo[];
        totalCount: number;
    }>;
    /**
     * Delete a blob by ID
     */
    deleteBlob(blobId: string): Promise<boolean>;
    /**
     * Check Walrus service availability
     */
    checkWalrusAvailability(): Promise<boolean>;
    /**
     * Get cache information
     */
    getCacheInfo(): {
        size: number;
        maxSize: number;
        hitRate: number;
        entries: number;
    };
    /**
     * Upload content with metadata
     */
    uploadContentWithMetadata(content: string, userId: string, options: {
        category?: string;
        topic?: string;
        importance?: number;
        additionalTags?: Record<string, string>;
        enableEncryption?: boolean;
    }): Promise<{
        blobId: string;
        metadata: MemoryMetadata;
        uploadTimeMs: number;
        isEncrypted: boolean;
    }>;
    private createMetadataWithEmbedding;
    private uploadToWalrus;
    private retrieveFromWalrus;
    private createWalrusTags;
    private isCacheValid;
    private updateAverageUploadTime;
    private updateAverageRetrievalTime;
}
//# sourceMappingURL=WalrusStorageService.d.ts.map