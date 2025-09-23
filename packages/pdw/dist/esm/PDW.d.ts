/**
 * PDW - Personal Data Wallet for Vector Embedding Storage
 *
 * Main class that orchestrates AI embeddings, vector indexing, and Walrus storage
 */
import { PDWConfig, VectorSearchOptions, VectorSearchResult } from './types';
export declare class PDW {
    private embeddingService;
    private vectorService;
    private walrusService;
    private userIndices;
    constructor(config: PDWConfig);
    /**
     * Store text as vector embedding on Walrus
     */
    storeText(userId: string, text: string, options?: {
        category?: string;
        metadata?: any;
        autoSave?: boolean;
    }): Promise<{
        vectorId: number;
        blobId?: string;
        embedding: number[];
    }>;
    /**
     * Store multiple texts in batch
     */
    storeTextsBatch(userId: string, texts: Array<{
        text: string;
        category?: string;
        metadata?: any;
    }>, options?: {
        autoSave?: boolean;
    }): Promise<{
        results: Array<{
            success: boolean;
            vectorId?: number;
            error?: string;
        }>;
        blobId?: string;
        successCount: number;
        failureCount: number;
    }>;
    /**
     * Search similar texts using vector similarity
     */
    searchSimilar(userId: string, queryText: string, options?: VectorSearchOptions): Promise<VectorSearchResult>;
    /**
     * Save user's vector index to Walrus
     */
    saveUserIndex(userId: string): Promise<string>;
    /**
     * Load user's vector index from Walrus
     */
    loadUserIndex(userId: string, blobId?: string): Promise<boolean>;
    /**
     * Check if vector index exists for user
     */
    hasUserIndex(userId: string, blobId?: string): Promise<boolean>;
    /**
     * Get user's vector index statistics
     */
    getUserIndexStats(userId: string): {
        vectorCount: number;
        indexSize: number;
        memoryUsage: number;
    };
    /**
     * Get user's stored index blob ID
     */
    getUserIndexBlobId(userId: string): string | undefined;
    /**
     * Clear user data (from memory, not from Walrus)
     */
    clearUserData(userId: string): void;
    /**
     * Get comprehensive service statistics
     */
    getStats(): {
        embedding: {
            totalRequests: number;
            requestsThisMinute: number;
            model: string;
            dimensions: number;
            rateLimit: number;
        };
        walrus: {
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
        users: {
            totalUsers: number;
            userMappings: {
                [k: string]: string;
            };
        };
    };
}
/**
 * Create PDW instance with configuration
 */
export declare function createPDW(config: PDWConfig): PDW;
export default PDW;
//# sourceMappingURL=PDW.d.ts.map