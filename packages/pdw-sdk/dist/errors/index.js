"use strict";
/**
 * Error Handling System for Personal Data Wallet SDK
 *
 * Provides structured error types, validation, and user-friendly messages
 * for all SDK operations including blockchain, storage, and encryption errors.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RETRYABLE_ERROR_CODES = exports.ERROR_MESSAGES = exports.WalletNotConnectedError = exports.InvalidSignatureError = exports.AuthenticationError = exports.RateLimitError = exports.TimeoutError = exports.ConnectionError = exports.NetworkError = exports.SessionKeyError = exports.AccessDeniedError = exports.DecryptionFailedError = exports.EncryptionFailedError = exports.SealInitializationError = exports.EncryptionError = exports.StorageQuotaExceededError = exports.StorageRetrievalError = exports.StorageUploadError = exports.WalrusError = exports.StorageError = exports.ObjectNotFoundError = exports.ContractExecutionError = exports.InsufficientGasError = exports.TransactionError = exports.BlockchainError = exports.MissingParameterError = exports.InvalidParameterError = exports.ConfigurationError = exports.ValidationError = exports.PDWError = void 0;
exports.isPDWError = isPDWError;
exports.wrapError = wrapError;
exports.createBlockchainError = createBlockchainError;
exports.createNetworkError = createNetworkError;
// ==================== BASE ERROR CLASSES ====================
/**
 * Base error class for all Personal Data Wallet SDK errors
 */
class PDWError extends Error {
    constructor(message, code, category, severity = 'error', context, originalError) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.category = category;
        this.severity = severity;
        this.context = context;
        this.timestamp = new Date();
        this.originalError = originalError;
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    /**
     * Convert error to a structured object for logging/reporting
     */
    toObject() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            category: this.category,
            severity: this.severity,
            context: this.context,
            timestamp: this.timestamp.toISOString(),
            stack: this.stack,
            originalError: this.originalError ? {
                name: this.originalError.name,
                message: this.originalError.message,
                stack: this.originalError.stack,
            } : undefined,
        };
    }
    /**
     * Get user-friendly error message
     */
    getUserMessage() {
        return exports.ERROR_MESSAGES[this.code] || this.message;
    }
    /**
     * Check if error is retryable
     */
    isRetryable() {
        return exports.RETRYABLE_ERROR_CODES.includes(this.code);
    }
}
exports.PDWError = PDWError;
// ==================== VALIDATION ERRORS ====================
class ValidationError extends PDWError {
    constructor(message, field, value, originalError) {
        super(message, 'VALIDATION_ERROR', 'validation', 'error', { field, value }, originalError);
    }
}
exports.ValidationError = ValidationError;
class ConfigurationError extends PDWError {
    constructor(message, configKey, originalError) {
        super(message, 'CONFIGURATION_ERROR', 'configuration', 'error', { configKey }, originalError);
    }
}
exports.ConfigurationError = ConfigurationError;
class InvalidParameterError extends PDWError {
    constructor(parameter, expected, received) {
        super(`Invalid parameter '${parameter}': expected ${expected}, received ${typeof received}`, 'INVALID_PARAMETER', 'validation', 'error', { field: parameter, value: received });
    }
}
exports.InvalidParameterError = InvalidParameterError;
class MissingParameterError extends PDWError {
    constructor(parameter) {
        super(`Missing required parameter: ${parameter}`, 'MISSING_PARAMETER', 'validation', 'error', { field: parameter });
    }
}
exports.MissingParameterError = MissingParameterError;
// ==================== BLOCKCHAIN ERRORS ====================
class BlockchainError extends PDWError {
    constructor(message, code, context, originalError) {
        super(message, code, 'blockchain', 'error', context, originalError);
    }
}
exports.BlockchainError = BlockchainError;
class TransactionError extends BlockchainError {
    constructor(message, transactionId, originalError) {
        super(message, 'TRANSACTION_ERROR', { transactionId }, originalError);
    }
}
exports.TransactionError = TransactionError;
class InsufficientGasError extends BlockchainError {
    constructor(required, available) {
        super(`Insufficient gas: required ${required}, available ${available}`, 'INSUFFICIENT_GAS', { required, available });
    }
}
exports.InsufficientGasError = InsufficientGasError;
class ContractExecutionError extends BlockchainError {
    constructor(contractFunction, reason, originalError) {
        super(`Contract execution failed: ${contractFunction} - ${reason}`, 'CONTRACT_EXECUTION_ERROR', { contractFunction, reason }, originalError);
    }
}
exports.ContractExecutionError = ContractExecutionError;
class ObjectNotFoundError extends BlockchainError {
    constructor(objectId, objectType) {
        super(`Object not found: ${objectId}${objectType ? ` (${objectType})` : ''}`, 'OBJECT_NOT_FOUND', { objectId, objectType });
    }
}
exports.ObjectNotFoundError = ObjectNotFoundError;
// ==================== STORAGE ERRORS ====================
class StorageError extends PDWError {
    constructor(message, code, context, originalError) {
        super(message, code, 'storage', 'error', context, originalError);
    }
}
exports.StorageError = StorageError;
class WalrusError extends StorageError {
    constructor(message, blobId, originalError) {
        super(message, 'WALRUS_ERROR', { blobId }, originalError);
    }
}
exports.WalrusError = WalrusError;
class StorageUploadError extends StorageError {
    constructor(reason, fileSize, originalError) {
        super(`Storage upload failed: ${reason}`, 'STORAGE_UPLOAD_ERROR', { fileSize }, originalError);
    }
}
exports.StorageUploadError = StorageUploadError;
class StorageRetrievalError extends StorageError {
    constructor(blobId, reason, originalError) {
        super(`Storage retrieval failed for ${blobId}: ${reason}`, 'STORAGE_RETRIEVAL_ERROR', { blobId }, originalError);
    }
}
exports.StorageRetrievalError = StorageRetrievalError;
class StorageQuotaExceededError extends StorageError {
    constructor(currentUsage, limit) {
        super(`Storage quota exceeded: ${currentUsage}/${limit} bytes`, 'STORAGE_QUOTA_EXCEEDED', { currentUsage, limit });
    }
}
exports.StorageQuotaExceededError = StorageQuotaExceededError;
// ==================== ENCRYPTION ERRORS ====================
class EncryptionError extends PDWError {
    constructor(message, code, context, originalError) {
        super(message, code, 'encryption', 'error', context, originalError);
    }
}
exports.EncryptionError = EncryptionError;
class SealInitializationError extends EncryptionError {
    constructor(reason, originalError) {
        super(`SEAL client initialization failed: ${reason}`, 'SEAL_INITIALIZATION_ERROR', { reason }, originalError);
    }
}
exports.SealInitializationError = SealInitializationError;
class EncryptionFailedError extends EncryptionError {
    constructor(userAddress, reason, originalError) {
        super(`Encryption failed for ${userAddress}: ${reason}`, 'ENCRYPTION_FAILED', { userAddress, reason }, originalError);
    }
}
exports.EncryptionFailedError = EncryptionFailedError;
class DecryptionFailedError extends EncryptionError {
    constructor(reason, contentId, originalError) {
        super(`Decryption failed: ${reason}`, 'DECRYPTION_FAILED', { contentId, reason }, originalError);
    }
}
exports.DecryptionFailedError = DecryptionFailedError;
class AccessDeniedError extends EncryptionError {
    constructor(userAddress, contentId, reason) {
        super(`Access denied for user ${userAddress} to content ${contentId}${reason ? `: ${reason}` : ''}`, 'ACCESS_DENIED', { userAddress, contentId, reason });
    }
}
exports.AccessDeniedError = AccessDeniedError;
class SessionKeyError extends EncryptionError {
    constructor(operation, reason, originalError) {
        super(`Session key ${operation} failed: ${reason}`, 'SESSION_KEY_ERROR', { operation, reason }, originalError);
    }
}
exports.SessionKeyError = SessionKeyError;
// ==================== NETWORK ERRORS ====================
class NetworkError extends PDWError {
    constructor(message, code, context, originalError) {
        super(message, code, 'network', 'error', context, originalError);
    }
}
exports.NetworkError = NetworkError;
class ConnectionError extends NetworkError {
    constructor(endpoint, originalError) {
        super(`Failed to connect to ${endpoint}`, 'CONNECTION_ERROR', { endpoint }, originalError);
    }
}
exports.ConnectionError = ConnectionError;
class TimeoutError extends NetworkError {
    constructor(operation, timeoutMs) {
        super(`Operation '${operation}' timed out after ${timeoutMs}ms`, 'TIMEOUT_ERROR', { operation, timeoutMs });
    }
}
exports.TimeoutError = TimeoutError;
class RateLimitError extends NetworkError {
    constructor(service, retryAfter) {
        super(`Rate limit exceeded for ${service}${retryAfter ? `, retry after ${retryAfter}s` : ''}`, 'RATE_LIMIT_ERROR', { service, retryAfter });
    }
}
exports.RateLimitError = RateLimitError;
// ==================== AUTHENTICATION ERRORS ====================
class AuthenticationError extends PDWError {
    constructor(message, code, context, originalError) {
        super(message, code, 'authentication', 'error', context, originalError);
    }
}
exports.AuthenticationError = AuthenticationError;
class InvalidSignatureError extends AuthenticationError {
    constructor(expectedAddress, actualAddress) {
        super(`Invalid signature: expected from ${expectedAddress}${actualAddress ? `, got from ${actualAddress}` : ''}`, 'INVALID_SIGNATURE', { expectedAddress, actualAddress });
    }
}
exports.InvalidSignatureError = InvalidSignatureError;
class WalletNotConnectedError extends AuthenticationError {
    constructor() {
        super('Wallet not connected. Please connect your wallet to continue.', 'WALLET_NOT_CONNECTED');
    }
}
exports.WalletNotConnectedError = WalletNotConnectedError;
// ==================== USER-FRIENDLY ERROR MESSAGES ====================
exports.ERROR_MESSAGES = {
    // Validation
    'VALIDATION_ERROR': 'The provided information is invalid. Please check your input and try again.',
    'CONFIGURATION_ERROR': 'There is an issue with the SDK configuration. Please check your settings.',
    'INVALID_PARAMETER': 'One of the provided values is invalid. Please check your input.',
    'MISSING_PARAMETER': 'Required information is missing. Please provide all necessary details.',
    // Blockchain
    'TRANSACTION_ERROR': 'The blockchain transaction failed. Please try again.',
    'INSUFFICIENT_GAS': 'Not enough gas to complete the transaction. Please add more SUI to your wallet.',
    'CONTRACT_EXECUTION_ERROR': 'The smart contract operation failed. Please try again later.',
    'OBJECT_NOT_FOUND': 'The requested item could not be found on the blockchain.',
    // Storage
    'WALRUS_ERROR': 'There was an issue with decentralized storage. Please try again.',
    'STORAGE_UPLOAD_ERROR': 'Failed to save your data. Please check your connection and try again.',
    'STORAGE_RETRIEVAL_ERROR': 'Failed to retrieve your data. Please try again later.',
    'STORAGE_QUOTA_EXCEEDED': 'You have reached your storage limit. Please free up space or upgrade your plan.',
    // Encryption
    'SEAL_INITIALIZATION_ERROR': 'Encryption service is currently unavailable. Please try again later.',
    'ENCRYPTION_FAILED': 'Failed to encrypt your data. Please try again.',
    'DECRYPTION_FAILED': 'Failed to decrypt the requested content. Please check your permissions.',
    'ACCESS_DENIED': 'You do not have permission to access this content.',
    'SESSION_KEY_ERROR': 'Authentication session expired. Please reconnect and try again.',
    // Network
    'CONNECTION_ERROR': 'Unable to connect to the service. Please check your internet connection.',
    'TIMEOUT_ERROR': 'The operation took too long to complete. Please try again.',
    'RATE_LIMIT_ERROR': 'Too many requests. Please wait a moment before trying again.',
    // Authentication
    'INVALID_SIGNATURE': 'The signature verification failed. Please sign the transaction again.',
    'WALLET_NOT_CONNECTED': 'Please connect your wallet to use this feature.',
};
// ==================== RETRYABLE ERROR CODES ====================
exports.RETRYABLE_ERROR_CODES = [
    'CONNECTION_ERROR',
    'TIMEOUT_ERROR',
    'WALRUS_ERROR',
    'STORAGE_RETRIEVAL_ERROR',
    'NETWORK_ERROR',
    'SEAL_INITIALIZATION_ERROR',
];
// ==================== ERROR UTILITIES ====================
/**
 * Check if an error is a PDW SDK error
 */
function isPDWError(error) {
    return error instanceof PDWError;
}
/**
 * Wrap unknown errors in a PDWError
 */
function wrapError(error, category = 'unknown', context) {
    if (isPDWError(error)) {
        return error;
    }
    if (error instanceof Error) {
        return new ValidationError(error.message, undefined, undefined, error);
    }
    return new ValidationError('An unknown error occurred', undefined, error);
}
/**
 * Create error from Sui/blockchain errors
 */
function createBlockchainError(error, context) {
    const message = error?.message || 'Unknown blockchain error';
    // Check for specific Sui error patterns
    if (message.includes('InsufficientGas')) {
        const gasMatch = message.match(/required: (\d+), available: (\d+)/);
        if (gasMatch) {
            return new InsufficientGasError(parseInt(gasMatch[1]), parseInt(gasMatch[2]));
        }
        return new InsufficientGasError(0, 0);
    }
    if (message.includes('ObjectNotExists') || message.includes('not found')) {
        const objectId = context?.objectId || 'unknown';
        return new ObjectNotFoundError(objectId);
    }
    if (message.includes('execution_failure') || message.includes('MoveAbort')) {
        return new ContractExecutionError(context?.function || 'unknown', message, error);
    }
    return new BlockchainError(message, 'BLOCKCHAIN_ERROR', context, error);
}
/**
 * Create error from network/HTTP errors
 */
function createNetworkError(error, endpoint) {
    const message = error?.message || 'Network error occurred';
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
        return new ConnectionError(endpoint || 'unknown endpoint', error);
    }
    if (error?.code === 'TIMEOUT' || message.includes('timeout')) {
        return new TimeoutError('network request', error?.timeout || 30000);
    }
    if (error?.status === 429 || message.includes('rate limit')) {
        return new RateLimitError(endpoint || 'unknown service', error?.retryAfter);
    }
    return new NetworkError(message, 'NETWORK_ERROR', { endpoint }, error);
}
// Re-export validation utilities
__exportStar(require("./validation"), exports);
// Re-export recovery utilities
__exportStar(require("./recovery"), exports);
//# sourceMappingURL=index.js.map