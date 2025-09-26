/**
 * WalrusTestAdapter - Adapter to make StorageService compatible with existing test interfaces
 * This allows us to use the proper StorageService (with official @mysten/walrus)
 * while maintaining the test API expectations
 */
import { SuiClient } from '@mysten/sui/client';
export interface WalrusUploadResult {
    blobId: string;
    metadata: {
        category: string;
        topic?: string;
        importance?: number;
        contentSize: number;
        contentType: string;
        contentHash: string;
        createdTimestamp: number;
        customMetadata?: Record<string, any>;
    };
    uploadTimeMs: number;
    isEncrypted: boolean;
}
export interface WalrusRetrievalResult {
    content: string;
    metadata: any;
    blobId: string;
    isFromCache: boolean;
    retrievalTimeMs: number;
}
export interface BlobInfo {
    blobId: string;
    size: number;
    contentType: string;
    uploadDate: Date;
    metadata: Record<string, any>;
    isAvailable: boolean;
}
/**
 * Adapter that wraps StorageService to provide the test interface
 */
export declare class WalrusTestAdapter {
    private storageService;
    private testKeypair;
    constructor(config: {
        network?: 'testnet' | 'mainnet';
        storageEpochs?: number;
        retryAttempts?: number;
        timeoutMs?: number;
        suiClient?: SuiClient;
        packageId?: string;
    });
    /**
     * Upload content with metadata (adapts to StorageService.upload)
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
     * Retrieve content (adapts to StorageService.retrieve)
     */
    retrieveContent(blobId: string, decryptionKey?: string): Promise<WalrusRetrievalResult>;
    /**
     * Check Walrus availability (mock implementation)
     */
    checkWalrusAvailability(): Promise<boolean>;
    /**
     * Get blob information (using StorageService.getBlob)
     */
    getBlobInfo(blobId: string): Promise<BlobInfo | null>;
    /**
     * Delete blob (adapts to StorageService.delete)
     */
    deleteBlob(blobId: string): Promise<boolean>;
    /**
     * Upload batch of items
     */
    uploadBatch(items: Array<{
        content: string;
        ownerAddress: string;
        category?: string;
        topic?: string;
        importance?: number;
    }>): Promise<WalrusUploadResult[]>;
    /**
     * Retrieve batch of items
     */
    retrieveBatch(blobIds: string[]): Promise<WalrusRetrievalResult[]>;
    /**
     * List user blobs (mock implementation)
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
}
//# sourceMappingURL=WalrusTestAdapter.d.ts.map