/**
 * SEAL Service Integration
 *
 * Production-ready SEAL service wrapper with comprehensive error handling,
 * session management, and performance analytics integration.
 */
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
interface SealConfig {
    suiClient: SuiClient;
    packageId: string;
    keyServerUrls: string[];
    keyServerObjectIds: string[];
    threshold: number;
    network: 'testnet' | 'mainnet';
    enableMetrics: boolean;
    retryAttempts: number;
    timeoutMs: number;
}
interface EncryptionOptions {
    data: Uint8Array;
    id: string;
    threshold?: number;
}
interface DecryptionOptions {
    encryptedObject: Uint8Array;
    sessionKey: any;
    txBytes: Uint8Array;
}
interface SessionConfig {
    address: string;
    packageId: string;
    ttlMin: number;
}
interface PerformanceMetric {
    operation: string;
    startTime: number;
    endTime: number;
    duration: number;
    success: boolean;
    errorType?: string;
    metadata?: any;
}
/**
 * SEAL Service - Production Implementation
 */
export declare class SealService {
    private sealClient;
    private sessionKey;
    private config;
    private performanceMetrics;
    private activeSessions;
    constructor(config: SealConfig);
    /**
     * Initialize SEAL client with retry logic
     */
    initializeClient(): Promise<void>;
    /**
     * Create and manage session key
     */
    createSession(config: SessionConfig, signature?: Uint8Array | string): Promise<any>;
    /**
     * Encrypt data with comprehensive error handling
     */
    encryptData(options: EncryptionOptions): Promise<{
        encryptedObject: Uint8Array;
        key: Uint8Array;
    }>;
    /**
     * Decrypt data with session management
     */
    decryptData(options: DecryptionOptions): Promise<Uint8Array>;
    /**
     * Create transaction for seal_approve (legacy - without app_id)
     * @deprecated Use createSealApproveTransactionWithAppId for OAuth-style permissions
     */
    createSealApproveTransaction(id: string, userAddress: string, accessRegistry?: string): Promise<Uint8Array>;
    /**
     * Create transaction for seal_approve with app_id (OAuth-style permissions)
     *
     * This method builds a SEAL approval transaction that includes the requesting
     * application identifier, enabling OAuth-style permission validation where apps
     * must be explicitly granted access by users.
     *
     * @param contentId - Content identifier (identity bytes)
     * @param appId - Requesting application identifier
     * @param accessRegistry - Optional custom access registry ID
     * @returns Transaction object for SEAL approval
     */
    buildSealApproveTransactionWithAppId(contentId: Uint8Array, appId: string, accessRegistry?: string): Transaction;
    /**
     * Parse encrypted object structure
     */
    parseEncryptedObject(encryptedBytes: Uint8Array): any;
    /**
     * Session management utilities
     */
    getActiveSession(address: string): any | null;
    cleanupExpiredSessions(): number;
    getSessionStats(): {
        total: number;
        expired: number;
        active: number;
    };
    /**
     * Performance metrics and analytics
     */
    private startMetric;
    private completeMetric;
    getPerformanceMetrics(): PerformanceMetric[];
    getPerformanceStats(): {
        totalOperations: number;
        averageTime: number;
        successRate: number;
        successfulOperations?: undefined;
        averageSuccessTime?: undefined;
        operationBreakdown?: undefined;
    } | {
        totalOperations: number;
        successfulOperations: number;
        successRate: number;
        averageTime: number;
        averageSuccessTime: number;
        operationBreakdown: Record<string, any>;
    };
    private getOperationBreakdown;
    /**
     * Health checks and diagnostics
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details: any;
    }>;
    /**
     * Configuration and utilities
     */
    getConfiguration(): Partial<SealConfig>;
    updateConfiguration(updates: Partial<SealConfig>): void;
}
export {};
//# sourceMappingURL=SealService.d.ts.map