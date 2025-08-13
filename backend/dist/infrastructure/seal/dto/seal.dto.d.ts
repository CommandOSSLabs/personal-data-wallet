export declare class InitializeSessionKeyDto {
    identity: string;
}
export declare class CompleteSessionKeyDto {
    identity: string;
    signature: string;
}
export declare class SessionKeyResponseDto {
    sessionKey: string;
    identity: string;
    expiresAt: number;
    status: string;
}
export declare class EncryptContentDto {
    content: string;
    userAddress: string;
    metadata?: Record<string, any>;
}
export declare class DecryptContentDto {
    encryptedData: string;
    userAddress: string;
    sessionKey?: string;
}
export declare class SealOperationMetricsDto {
    encryptions: number;
    decryptions: number;
    failures: number;
}
export declare class SealPerformanceMetricsDto {
    avgEncryptionTime: number;
    avgDecryptionTime: number;
    successRate: number;
}
export declare class SealHealthCheckDto {
    keyServerId: string;
    url: string;
    isHealthy: boolean;
    responseTime?: number;
    lastChecked: number;
    error?: string;
}
export declare class SealCacheMetricsDto {
    hits: number;
    misses: number;
    size: number;
}
export declare class SealMetricsDto {
    operations: SealOperationMetricsDto;
    performance: SealPerformanceMetricsDto;
    keyServers: SealHealthCheckDto[];
    cache: SealCacheMetricsDto;
}
