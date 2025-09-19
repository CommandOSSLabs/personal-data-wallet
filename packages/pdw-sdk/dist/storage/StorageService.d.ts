import { PDWConfig, StorageOptions, StorageResult, RetrieveOptions, RetrieveResult, StorageMetadata, StorageStats, StorageFilter } from '../types';
/**
 * StorageService handles Walrus decentralized storage operations with
 * caching, encryption, compression, and local fallback capabilities.
 */
export declare class StorageService {
    private config;
    private cache;
    private walrusConfig;
    private stats;
    constructor(config: PDWConfig);
    /**
     * Upload content to Walrus storage with optional encryption and compression
     */
    upload(content: Uint8Array | string, options?: StorageOptions): Promise<StorageResult>;
    /**
     * Retrieve content from Walrus storage with caching support
     */
    retrieve(blobId: string, options?: RetrieveOptions): Promise<RetrieveResult>;
    /**
     * Delete content from cache and Walrus (if supported)
     */
    delete(blobId: string): Promise<boolean>;
    /**
     * List stored items (from cache and metadata store)
     */
    list(filter?: StorageFilter): Promise<Array<{
        blobId: string;
        metadata: StorageMetadata;
    }>>;
    /**
     * Get storage statistics
     */
    getStats(): StorageStats;
    /**
     * Clear cache with optional filter
     */
    clearCache(filter?: StorageFilter): number;
    /**
     * Cleanup expired cache entries
     */
    cleanupCache(): number;
    private uploadToWalrus;
    private retrieveFromWalrus;
    private compressContent;
    private decompressContent;
    private encryptContent;
    private decryptContent;
    private detectContentType;
    private addToCache;
    private getFromCache;
    private matchesFilter;
    private calculateCacheSize;
    private updateStorageStats;
    private updateRetrievalStats;
    private calculateSha256;
}
//# sourceMappingURL=StorageService.d.ts.map