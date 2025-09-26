import { SuiClient } from '@mysten/sui/client';
import type { Signer } from '@mysten/sui/cryptography';
import { PDWConfig, StorageOptions, StorageResult, RetrieveOptions, RetrieveResult, StorageMetadata, StorageStats, StorageFilter } from '../types';
/**
 * StorageService handles Walrus decentralized storage operations using
 * the official @mysten/walrus SDK with upload relay and proper network configuration.
 * Based on official examples from https://github.com/MystenLabs/ts-sdks/tree/main/packages/walrus/examples
 */
export declare class StorageService {
    private config;
    private suiClient;
    private cache;
    private stats;
    constructor(config: PDWConfig & {
        suiClient?: SuiClient;
        network?: 'testnet' | 'mainnet';
        maxFileSize?: number;
        timeout?: number;
    });
    /**
     * Configure network settings for better reliability based on official examples
     */
    private initializeNetworkConfiguration;
    /**
     * Store multiple files as a Walrus quilt with proper SDK integration
     */
    storeFiles(files: Array<{
        identifier: string;
        content: Uint8Array | string;
        tags?: Record<string, string>;
    }>, options: {
        signer: Signer;
        epochs?: number;
        deletable?: boolean;
    }): Promise<{
        id: string;
        blobId: string;
        files: Array<{
            identifier: string;
            blobId: string;
        }>;
    }>;
    /**
     * Retrieve files by their IDs using Walrus SDK
     */
    getFiles(ids: string[]): Promise<Array<{
        identifier: string;
        content: Uint8Array;
        tags: Record<string, string>;
    }>>;
    /**
     * Get a Walrus blob object for advanced operations
     */
    getBlob(blobId: string): Promise<{
        blobId: string;
        exists: boolean;
        storedUntil: number | null;
    }>;
    /**
     * Get files from a blob
     */
    getFilesFromBlob(blobId: string): Promise<Array<{
        identifier: string;
        content: Uint8Array;
        tags: Record<string, string>;
    }>>;
    /**
     * Upload content to Walrus storage with optional encryption and compression
     */
    upload(content: Uint8Array | string, options?: StorageOptions & {
        signer?: Signer;
        epochs?: number;
    }): Promise<StorageResult>;
    /**
     * Upload SEAL encrypted memory package using successful test pattern
     *
     * SUCCESSFUL PATTERN from memory-workflow-seal.ts test:
     * - Direct binary storage for SEAL encrypted data (preserves Uint8Array format)
     * - Rich metadata stored in Walrus attributes for searchability
     * - Binary format preservation throughout the process
     *
     * @param memoryData - The memory content with SEAL encrypted data
     * @param options - Upload options including signer and metadata
     * @returns Upload result with blob ID and metadata
     */
    uploadSealMemory(memoryData: {
        content: string;
        embedding: number[];
        metadata: Record<string, any>;
        encryptedContent: Uint8Array;
        encryptionType: string;
        identity: string;
    }, options: {
        signer: Signer;
        epochs?: number;
    }): Promise<StorageResult>;
    /**
     * Retrieve content from Walrus storage with caching support
     */
    retrieve(blobId: string, options?: RetrieveOptions): Promise<RetrieveResult>;
    /**
     * Retrieve SEAL encrypted memory package using successful test pattern
     *
     * SUCCESSFUL PATTERN from memory-workflow-seal.ts test:
     * - Direct binary retrieval preserves SEAL Uint8Array format
     * - Binary format detection and validation
     * - Proper format preservation for SEAL decryption
     *
     * @param blobId - The Walrus blob ID to retrieve
     * @returns Retrieved SEAL encrypted data ready for decryption
     */
    retrieveSealMemory(blobId: string): Promise<{
        content: Uint8Array;
        storageApproach: 'direct-binary';
        metadata: StorageMetadata;
        isEncrypted: true;
    }>;
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
    /**
     * Upload blob to Walrus using official SDK with signer
     * Note: This requires a signer for the full upload process
     */
    private uploadBlobWithSigner;
    /**
     * Encode blob and get blobId without blockchain registration
     * This is useful for getting the blobId without a signer
     */
    private encodeBlobForId;
    /**
     * Retrieve blob from Walrus using official SDK
     */
    private retrieveBlobFromWalrus;
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