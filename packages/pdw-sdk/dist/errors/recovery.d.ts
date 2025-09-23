/**
 * Retry and Recovery Utilities for Personal Data Wallet SDK
 *
 * Provides automatic retry logic, circuit breaker patterns,
 * and error recovery strategies for resilient operations.
 */
export interface RetryConfig {
    /** Maximum number of retry attempts */
    maxAttempts: number;
    /** Initial delay between retries in milliseconds */
    initialDelay: number;
    /** Maximum delay between retries in milliseconds */
    maxDelay: number;
    /** Backoff multiplier for exponential backoff */
    backoffMultiplier: number;
    /** Whether to add random jitter to delays */
    jitter: boolean;
    /** Function to determine if error should be retried */
    shouldRetry?: (error: any, attempt: number) => boolean;
    /** Function called before each retry attempt */
    onRetry?: (error: any, attempt: number, delay: number) => void;
}
export declare const DEFAULT_RETRY_CONFIG: RetryConfig;
/**
 * Execute a function with automatic retry logic
 */
export declare function withRetry<T>(operation: () => Promise<T>, config?: Partial<RetryConfig>): Promise<T>;
export interface CircuitBreakerConfig {
    /** Number of failures before opening circuit */
    failureThreshold: number;
    /** Time in milliseconds to wait before attempting to close circuit */
    resetTimeout: number;
    /** Minimum number of calls before circuit can open */
    minimumCalls: number;
    /** Success ratio threshold to close circuit (0-1) */
    successThreshold: number;
}
export declare enum CircuitState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}
export declare class CircuitBreaker {
    private state;
    private failureCount;
    private successCount;
    private totalCalls;
    private lastFailureTime;
    private readonly config;
    constructor(config?: Partial<CircuitBreakerConfig>);
    execute<T>(operation: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    private reset;
    getState(): CircuitState;
    getMetrics(): {
        state: CircuitState;
        failureCount: number;
        successCount: number;
        totalCalls: number;
        lastFailureTime: number;
    };
}
export declare class RateLimiter {
    private tokens;
    private lastRefill;
    private readonly capacity;
    private readonly refillRate;
    constructor(capacity: number, refillRate: number);
    acquire(tokens?: number): Promise<void>;
    private refill;
    getTokens(): number;
}
export interface RecoveryStrategy<T> {
    canRecover(error: any): boolean;
    recover(error: any, originalOperation: () => Promise<T>): Promise<T>;
}
export declare class FallbackRecovery<T> implements RecoveryStrategy<T> {
    private fallbackOperation;
    private canRecoverFn;
    constructor(fallbackOperation: (error: any) => Promise<T>, canRecoverFn?: (error: any) => boolean);
    canRecover(error: any): boolean;
    recover(error: any): Promise<T>;
}
export declare class CacheRecovery<T> implements RecoveryStrategy<T> {
    private keyGenerator;
    private ttl;
    private cache;
    constructor(keyGenerator: (...args: any[]) => string, ttl?: number);
    canRecover(error: any): boolean;
    recover(error: any, originalOperation: () => Promise<T>): Promise<T>;
    setCacheEntry(key: string, data: T): void;
    getCacheEntry(key: string): T | null;
}
export interface ResilienceConfig {
    retry?: Partial<RetryConfig>;
    circuitBreaker?: Partial<CircuitBreakerConfig>;
    rateLimiter?: {
        capacity: number;
        refillRate: number;
    };
    recoveryStrategies?: RecoveryStrategy<any>[];
}
export declare class ResilientOperation<T> {
    private circuitBreaker?;
    private rateLimiter?;
    private retryConfig;
    private recoveryStrategies;
    constructor(config?: ResilienceConfig);
    execute(operation: () => Promise<T>): Promise<T>;
}
/**
 * Create a resilient version of an async function
 */
export declare function makeResilient<T extends any[], R>(fn: (...args: T) => Promise<R>, config?: ResilienceConfig): (...args: T) => Promise<R>;
/**
 * Delay execution for a specified time
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Create a timeout wrapper for promises
 */
export declare function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage?: string): Promise<T>;
/**
 * Batch operations with concurrency control
 */
export declare function batch<T, R>(items: T[], operation: (item: T, index: number) => Promise<R>, concurrency?: number): Promise<R[]>;
//# sourceMappingURL=recovery.d.ts.map