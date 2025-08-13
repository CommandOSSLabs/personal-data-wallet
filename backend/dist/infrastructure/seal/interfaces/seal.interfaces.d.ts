export interface SealKeyServer {
    id: string;
    url: string;
    objectId?: string;
    isActive: boolean;
    mode: 'open' | 'permissioned';
}
export interface SealConfig {
    environment: 'testnet' | 'mainnet';
    keyServers: SealKeyServer[];
    threshold: number;
    keyCache: {
        ttl: number;
        maxSize: number;
    };
    batch: {
        size: number;
        flushInterval: number;
    };
    timeout: number;
    pdwPackageId: string;
    verifyKeyServers: boolean;
}
export interface EncryptionRequest {
    content: string;
    identity: string;
    metadata?: Record<string, any>;
}
export interface EncryptionResult {
    encryptedData: string;
    keyServersUsed: string[];
    timestamp: number;
    metadata?: Record<string, any>;
}
export interface DecryptionRequest {
    encryptedData: string;
    identity: string;
    sessionKey?: string;
}
export interface DecryptionResult {
    content: string;
    keyServersUsed: string[];
    timestamp: number;
    metadata?: Record<string, any>;
}
export interface BatchEncryptionRequest {
    items: EncryptionRequest[];
    options?: {
        parallel?: boolean;
        failFast?: boolean;
    };
}
export interface BatchEncryptionResult {
    results: (EncryptionResult | Error)[];
    summary: {
        successful: number;
        failed: number;
        totalTime: number;
    };
}
export interface SessionKeyRequest {
    identity: string;
    duration?: number;
}
export interface SessionKeyResult {
    sessionKey: string;
    expiresAt: number;
    identity: string;
}
export interface SealHealthCheck {
    keyServerId: string;
    url: string;
    isHealthy: boolean;
    responseTime?: number;
    lastChecked: number;
    error?: string;
}
export interface SealMetrics {
    operations: {
        encryptions: number;
        decryptions: number;
        failures: number;
    };
    performance: {
        avgEncryptionTime: number;
        avgDecryptionTime: number;
        successRate: number;
    };
    keyServers: SealHealthCheck[];
    cache: {
        hits: number;
        misses: number;
        size: number;
    };
}
export interface AccessPermission {
    id: string;
    ownerAddress: string;
    delegatedAddress: string;
    resourceId: string;
    accessLevel: 'read' | 'write' | 'admin';
    expiresAt?: number;
    createdAt: number;
    metadata?: Record<string, any>;
}
export interface DelegatedDecryptionRequest {
    encryptedData: string;
    ownerIdentity: string;
    delegatedIdentity: string;
    permissionId?: string;
    sessionKey?: string;
}
export interface DelegatedDecryptionResult extends DecryptionResult {
    permissionId?: string;
    accessGrantedBy: string;
}
export interface BatchDecryptionRequest {
    items: (DecryptionRequest | DelegatedDecryptionRequest)[];
    options?: {
        parallel?: boolean;
        failFast?: boolean;
    };
}
export interface BatchDecryptionResult {
    results: (DecryptionResult | DelegatedDecryptionResult | Error)[];
    summary: {
        successful: number;
        failed: number;
        totalTime: number;
    };
}
