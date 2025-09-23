/**
 * Streamlined WalrusService for Vector Index Storage
 */
import { WalrusUploadResult, WalrusRetrievalResult } from '../types';
export interface WalrusConfig {
    network?: 'testnet' | 'mainnet';
    publisherUrl?: string;
    aggregatorUrl?: string;
    enableLocalFallback?: boolean;
}
export declare class WalrusService {
    private readonly network;
    private readonly enableLocalFallback;
    private walrusClient;
    private suiClient;
    private signer;
    private localCache;
    constructor(config?: WalrusConfig);
    /**
     * Upload vector index buffer to Walrus
     */
    uploadVectorIndex(buffer: Buffer, metadata: {
        userId: string;
        indexType: 'hnsw' | 'metadata';
        category?: string;
    }): Promise<WalrusUploadResult>;
    /**
     * Retrieve vector index buffer from Walrus
     */
    retrieveVectorIndex(blobId: string): Promise<WalrusRetrievalResult>;
    /**
     * Check if blob exists
     */
    blobExists(blobId: string): Promise<boolean>;
    /**
     * Get service statistics
     */
    getStats(): {
        network: "testnet" | "mainnet";
        walrusClientReady: boolean;
        suiClientReady: boolean;
        localCacheSize: number;
        enableLocalFallback: boolean;
    };
    /**
     * Clear local cache
     */
    clearCache(): void;
    private uploadToWalrus;
    private retrieveFromWalrus;
}
//# sourceMappingURL=WalrusService.d.ts.map