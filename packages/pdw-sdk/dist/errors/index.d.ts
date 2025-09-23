/**
 * Error Handling System for Personal Data Wallet SDK
 *
 * Provides structured error types, validation, and user-friendly messages
 * for all SDK operations including blockchain, storage, and encryption errors.
 */
/**
 * Base error class for all Personal Data Wallet SDK errors
 */
export declare abstract class PDWError extends Error {
    readonly code: string;
    readonly category: ErrorCategory;
    readonly severity: ErrorSeverity;
    readonly context?: Record<string, any>;
    readonly timestamp: Date;
    readonly originalError?: Error;
    constructor(message: string, code: string, category: ErrorCategory, severity?: ErrorSeverity, context?: Record<string, any>, originalError?: Error);
    /**
     * Convert error to a structured object for logging/reporting
     */
    toObject(): ErrorObject;
    /**
     * Get user-friendly error message
     */
    getUserMessage(): string;
    /**
     * Check if error is retryable
     */
    isRetryable(): boolean;
}
export type ErrorCategory = 'validation' | 'blockchain' | 'storage' | 'encryption' | 'network' | 'configuration' | 'authentication' | 'permission';
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';
export interface ErrorObject {
    name: string;
    message: string;
    code: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    context?: Record<string, any>;
    timestamp: string;
    stack?: string;
    originalError?: {
        name: string;
        message: string;
        stack?: string;
    };
}
export declare class ValidationError extends PDWError {
    constructor(message: string, field?: string, value?: any, originalError?: Error);
}
export declare class ConfigurationError extends PDWError {
    constructor(message: string, configKey?: string, originalError?: Error);
}
export declare class InvalidParameterError extends PDWError {
    constructor(parameter: string, expected: string, received: any);
}
export declare class MissingParameterError extends PDWError {
    constructor(parameter: string);
}
export declare class BlockchainError extends PDWError {
    constructor(message: string, code: string, context?: Record<string, any>, originalError?: Error);
}
export declare class TransactionError extends BlockchainError {
    constructor(message: string, transactionId?: string, originalError?: Error);
}
export declare class InsufficientGasError extends BlockchainError {
    constructor(required: number, available: number);
}
export declare class ContractExecutionError extends BlockchainError {
    constructor(contractFunction: string, reason: string, originalError?: Error);
}
export declare class ObjectNotFoundError extends BlockchainError {
    constructor(objectId: string, objectType?: string);
}
export declare class StorageError extends PDWError {
    constructor(message: string, code: string, context?: Record<string, any>, originalError?: Error);
}
export declare class WalrusError extends StorageError {
    constructor(message: string, blobId?: string, originalError?: Error);
}
export declare class StorageUploadError extends StorageError {
    constructor(reason: string, fileSize?: number, originalError?: Error);
}
export declare class StorageRetrievalError extends StorageError {
    constructor(blobId: string, reason: string, originalError?: Error);
}
export declare class StorageQuotaExceededError extends StorageError {
    constructor(currentUsage: number, limit: number);
}
export declare class EncryptionError extends PDWError {
    constructor(message: string, code: string, context?: Record<string, any>, originalError?: Error);
}
export declare class SealInitializationError extends EncryptionError {
    constructor(reason: string, originalError?: Error);
}
export declare class EncryptionFailedError extends EncryptionError {
    constructor(userAddress: string, reason: string, originalError?: Error);
}
export declare class DecryptionFailedError extends EncryptionError {
    constructor(reason: string, contentId?: string, originalError?: Error);
}
export declare class AccessDeniedError extends EncryptionError {
    constructor(userAddress: string, contentId: string, reason?: string);
}
export declare class SessionKeyError extends EncryptionError {
    constructor(operation: string, reason: string, originalError?: Error);
}
export declare class NetworkError extends PDWError {
    constructor(message: string, code: string, context?: Record<string, any>, originalError?: Error);
}
export declare class ConnectionError extends NetworkError {
    constructor(endpoint: string, originalError?: Error);
}
export declare class TimeoutError extends NetworkError {
    constructor(operation: string, timeoutMs: number);
}
export declare class RateLimitError extends NetworkError {
    constructor(service: string, retryAfter?: number);
}
export declare class AuthenticationError extends PDWError {
    constructor(message: string, code: string, context?: Record<string, any>, originalError?: Error);
}
export declare class InvalidSignatureError extends AuthenticationError {
    constructor(expectedAddress: string, actualAddress?: string);
}
export declare class WalletNotConnectedError extends AuthenticationError {
    constructor();
}
export declare const ERROR_MESSAGES: Record<string, string>;
export declare const RETRYABLE_ERROR_CODES: string[];
/**
 * Check if an error is a PDW SDK error
 */
export declare function isPDWError(error: any): error is PDWError;
/**
 * Wrap unknown errors in a PDWError
 */
export declare function wrapError(error: unknown, category?: ErrorCategory, context?: Record<string, any>): PDWError;
/**
 * Create error from Sui/blockchain errors
 */
export declare function createBlockchainError(error: any, context?: Record<string, any>): BlockchainError;
/**
 * Create error from network/HTTP errors
 */
export declare function createNetworkError(error: any, endpoint?: string): NetworkError;
export * from './validation';
export * from './recovery';
//# sourceMappingURL=index.d.ts.map