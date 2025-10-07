/**
 * MemoryDecryptionPipeline - Seamless SEAL-based Memory Decryption
 *
 * Provides comprehensive decryption capabilities for encrypted memories using
 * Mysten's SEAL SDK with official testnet key servers and configurable infrastructure.
 *
 * Features:
 * - 🔐 Seamless SEAL decryption integration
 * - 🔑 Automatic key server configuration (testnet/mainnet)
 * - ⚡ Batch decryption optimization
 * - 🛡️ Secure session key management
 * - 🔄 Automatic retry and fallback mechanisms
 * - 📊 Decryption analytics and monitoring
 * - 🌍 Environment-based configuration
 */
import { SessionKey } from '@mysten/seal';
import { EncryptionService } from '../services/EncryptionService';
import { StorageManager } from '../storage/StorageManager';
import { UnifiedMemoryResult } from '../retrieval/MemoryRetrievalService';
export interface KeyServerConfig {
    name: string;
    mode: 'open' | 'permissioned';
    objectId: string;
    url: string;
    provider: string;
    network: 'testnet' | 'mainnet';
    weight?: number;
    isDefault?: boolean;
}
export interface DecryptionConfig {
    keyServers?: KeyServerConfig[];
    defaultKeyServerMode?: 'open' | 'permissioned';
    customKeyServerUrl?: string;
    customKeyServerObjectId?: string;
    sessionKeyTTL?: number;
    maxSessionKeys?: number;
    autoRefreshSession?: boolean;
    enableBatchDecryption?: boolean;
    batchSize?: number;
    maxConcurrentDecryptions?: number;
    decryptionTimeout?: number;
    enableFallback?: boolean;
    maxRetryAttempts?: number;
    retryDelayMs?: number;
    verifyKeyServers?: boolean;
    enableDecryptionAudit?: boolean;
    requireOwnershipVerification?: boolean;
}
export interface DecryptionRequest {
    memoryId: string;
    encryptedContent: string;
    contentHash?: string;
    userAddress: string;
    ownerAddress?: string;
    sessionKey?: SessionKey;
    metadata?: Record<string, any>;
}
export interface DecryptionResult {
    memoryId: string;
    decryptedContent: string;
    contentHash: string;
    isVerified: boolean;
    decryptionTime: number;
    keyServerUsed: string;
    sessionKeyId: string;
}
export interface BatchDecryptionResult {
    successful: DecryptionResult[];
    failed: Array<{
        memoryId: string;
        error: string;
        retryCount: number;
    }>;
    stats: {
        totalRequests: number;
        successCount: number;
        failureCount: number;
        totalProcessingTime: number;
        averageDecryptionTime: number;
        keyServerPerformance: Record<string, {
            requests: number;
            successes: number;
            averageTime: number;
        }>;
    };
}
/**
 * Memory Decryption Pipeline Service
 */
export declare class MemoryDecryptionPipeline {
    private sealClient;
    private encryptionService;
    private storageManager;
    private config;
    private sessionKeys;
    private sessionKeyTimestamps;
    private decryptionCache;
    private readonly CACHE_TTL;
    private decryptionStats;
    private static readonly DEFAULT_TESTNET_SERVERS;
    private static readonly VERIFIED_TESTNET_SERVERS;
    constructor(encryptionService: EncryptionService, storageManager: StorageManager, config?: Partial<DecryptionConfig>);
    /**
     * Merge user config with environment variables and defaults
     */
    private mergeWithDefaults;
    /**
     * Get default key servers based on environment
     */
    private getDefaultKeyServers;
    /**
     * Initialize the decryption pipeline
     */
    private initializeDecryptionPipeline;
    /**
     * Decrypt a single memory with full pipeline support
     */
    decryptMemory(request: DecryptionRequest): Promise<DecryptionResult>;
    /**
     * Decrypt multiple memories in batch for performance
     */
    decryptMemoryBatch(requests: DecryptionRequest[]): Promise<BatchDecryptionResult>;
    /**
     * Get or create session key for user
     */
    getOrCreateSessionKey(userAddress: string): Promise<SessionKey>;
    /**
     * Cleanup expired session keys
     */
    private startSessionKeyCleanup;
    /**
     * Cleanup oldest session keys when limit exceeded
     */
    private cleanupOldestSessionKeys;
    /**
     * Perform the actual decryption using SEAL
     */
    private performDecryption;
    /**
     * Verify user access to encrypted content
     */
    private verifyAccess;
    /**
     * Verify content integrity using hash
     */
    private verifyContentIntegrity;
    /**
     * Retry failed decryptions with exponential backoff
     */
    private retryFailedDecryptions;
    private getFromCache;
    private addToCache;
    private base64ToUint8Array;
    private chunkArray;
    private getSessionKeyId;
    private updateDecryptionStats;
    private generateBatchStats;
    /**
     * Decrypt encrypted content from unified memory results
     */
    decryptMemoryResults(memories: UnifiedMemoryResult[], userAddress: string): Promise<UnifiedMemoryResult[]>;
    /**
     * Get decryption pipeline statistics
     */
    getDecryptionStats(): {
        totalDecryptions: number;
        successRate: number;
        averageDecryptionTime: number;
        cacheHitRate: number;
        activeSessionKeys: number;
        keyServerStatus: string[];
    };
    /**
     * Clear decryption cache
     */
    clearCache(): void;
    /**
     * Check if decryption pipeline is ready
     */
    isReady(): boolean;
    /**
     * Get pipeline configuration info
     */
    getConfigInfo(): {
        keyServers: number;
        defaultNetwork: string;
        batchingEnabled: boolean;
        cacheEnabled: boolean;
    };
}
//# sourceMappingURL=MemoryDecryptionPipeline.d.ts.map