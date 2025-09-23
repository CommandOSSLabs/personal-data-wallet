"use strict";
/**
 * Retry and Recovery Utilities for Personal Data Wallet SDK
 *
 * Provides automatic retry logic, circuit breaker patterns,
 * and error recovery strategies for resilient operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResilientOperation = exports.CacheRecovery = exports.FallbackRecovery = exports.RateLimiter = exports.CircuitBreaker = exports.CircuitState = exports.DEFAULT_RETRY_CONFIG = void 0;
exports.withRetry = withRetry;
exports.makeResilient = makeResilient;
exports.delay = delay;
exports.withTimeout = withTimeout;
exports.batch = batch;
const index_1 = require("./index");
exports.DEFAULT_RETRY_CONFIG = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
    shouldRetry: (error) => {
        if ((0, index_1.isPDWError)(error)) {
            return error.isRetryable();
        }
        // Retry network errors, timeouts, and temporary failures
        return error?.code === 'ECONNRESET' ||
            error?.code === 'ENOTFOUND' ||
            error?.code === 'TIMEOUT' ||
            error?.status >= 500;
    },
    onRetry: (error, attempt, delay) => {
        console.warn(`Retry attempt ${attempt} after ${delay}ms due to:`, error.message);
    },
};
// ==================== RETRY FUNCTION ====================
/**
 * Execute a function with automatic retry logic
 */
async function withRetry(operation, config = {}) {
    const finalConfig = { ...exports.DEFAULT_RETRY_CONFIG, ...config };
    let lastError;
    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            // Check if we should retry
            if (attempt >= finalConfig.maxAttempts ||
                !finalConfig.shouldRetry(error, attempt)) {
                throw error;
            }
            // Calculate delay with exponential backoff and jitter
            const baseDelay = Math.min(finalConfig.initialDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1), finalConfig.maxDelay);
            const jitter = finalConfig.jitter ?
                Math.random() * 0.1 * baseDelay : 0;
            const delay = Math.floor(baseDelay + jitter);
            // Call retry callback
            if (finalConfig.onRetry) {
                finalConfig.onRetry(error, attempt, delay);
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
class CircuitBreaker {
    constructor(config = {}) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.totalCalls = 0;
        this.lastFailureTime = 0;
        this.config = {
            failureThreshold: 5,
            resetTimeout: 30000,
            minimumCalls: 10,
            successThreshold: 0.8,
            ...config,
        };
    }
    async execute(operation) {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
                this.state = CircuitState.HALF_OPEN;
                this.successCount = 0;
                this.totalCalls = 0;
            }
            else {
                throw new index_1.NetworkError('Circuit breaker is open - service temporarily unavailable', 'CIRCUIT_BREAKER_OPEN');
            }
        }
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.successCount++;
        this.totalCalls++;
        if (this.state === CircuitState.HALF_OPEN) {
            const successRatio = this.successCount / this.totalCalls;
            if (this.totalCalls >= this.config.minimumCalls &&
                successRatio >= this.config.successThreshold) {
                this.reset();
            }
        }
        else {
            this.failureCount = 0;
        }
    }
    onFailure() {
        this.failureCount++;
        this.totalCalls++;
        this.lastFailureTime = Date.now();
        if (this.state === CircuitState.HALF_OPEN) {
            this.state = CircuitState.OPEN;
        }
        else if (this.failureCount >= this.config.failureThreshold &&
            this.totalCalls >= this.config.minimumCalls) {
            this.state = CircuitState.OPEN;
        }
    }
    reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.totalCalls = 0;
    }
    getState() {
        return this.state;
    }
    getMetrics() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            totalCalls: this.totalCalls,
            lastFailureTime: this.lastFailureTime,
        };
    }
}
exports.CircuitBreaker = CircuitBreaker;
// ==================== RATE LIMITER ====================
class RateLimiter {
    constructor(capacity, refillRate) {
        this.capacity = capacity;
        this.refillRate = refillRate;
        this.tokens = capacity;
        this.lastRefill = Date.now();
    }
    async acquire(tokens = 1) {
        this.refill();
        if (this.tokens >= tokens) {
            this.tokens -= tokens;
            return;
        }
        // Wait for tokens to be available
        const tokensNeeded = tokens - this.tokens;
        const waitTime = (tokensNeeded / this.refillRate) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.refill();
        this.tokens -= tokens;
    }
    refill() {
        const now = Date.now();
        const timePassed = (now - this.lastRefill) / 1000;
        const tokensToAdd = timePassed * this.refillRate;
        this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
        this.lastRefill = now;
    }
    getTokens() {
        this.refill();
        return this.tokens;
    }
}
exports.RateLimiter = RateLimiter;
class FallbackRecovery {
    constructor(fallbackOperation, canRecoverFn = () => true) {
        this.fallbackOperation = fallbackOperation;
        this.canRecoverFn = canRecoverFn;
    }
    canRecover(error) {
        return this.canRecoverFn(error);
    }
    async recover(error) {
        return this.fallbackOperation(error);
    }
}
exports.FallbackRecovery = FallbackRecovery;
class CacheRecovery {
    constructor(keyGenerator, ttl = 300000 // 5 minutes
    ) {
        this.keyGenerator = keyGenerator;
        this.ttl = ttl;
        this.cache = new Map();
    }
    canRecover(error) {
        return (0, index_1.isPDWError)(error) &&
            (error.code === 'NETWORK_ERROR' ||
                error.code === 'TIMEOUT_ERROR' ||
                error.code === 'CONNECTION_ERROR');
    }
    async recover(error, originalOperation) {
        // This is a simplified recovery - in practice, you'd need access to the original arguments
        throw new Error('Cache recovery requires implementation context');
    }
    setCacheEntry(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }
    getCacheEntry(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
}
exports.CacheRecovery = CacheRecovery;
class ResilientOperation {
    constructor(config = {}) {
        this.retryConfig = { ...exports.DEFAULT_RETRY_CONFIG, ...config.retry };
        if (config.circuitBreaker) {
            this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
        }
        if (config.rateLimiter) {
            this.rateLimiter = new RateLimiter(config.rateLimiter.capacity, config.rateLimiter.refillRate);
        }
        this.recoveryStrategies = config.recoveryStrategies || [];
    }
    async execute(operation) {
        // Apply rate limiting
        if (this.rateLimiter) {
            await this.rateLimiter.acquire();
        }
        const executeWithCircuitBreaker = this.circuitBreaker ?
            () => this.circuitBreaker.execute(operation) :
            operation;
        try {
            return await withRetry(executeWithCircuitBreaker, this.retryConfig);
        }
        catch (error) {
            // Try recovery strategies
            for (const strategy of this.recoveryStrategies) {
                if (strategy.canRecover(error)) {
                    try {
                        return await strategy.recover(error, operation);
                    }
                    catch (recoveryError) {
                        // If recovery fails, continue to next strategy
                        continue;
                    }
                }
            }
            // If no recovery worked, throw the original error
            throw error;
        }
    }
}
exports.ResilientOperation = ResilientOperation;
// ==================== UTILITY FUNCTIONS ====================
/**
 * Create a resilient version of an async function
 */
function makeResilient(fn, config = {}) {
    const resilientOp = new ResilientOperation(config);
    return (...args) => {
        return resilientOp.execute(() => fn(...args));
    };
}
/**
 * Delay execution for a specified time
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Create a timeout wrapper for promises
 */
function withTimeout(promise, timeoutMs, timeoutMessage = 'Operation timed out') {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new index_1.TimeoutError('operation', timeoutMs));
        }, timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]);
}
/**
 * Batch operations with concurrency control
 */
async function batch(items, operation, concurrency = 5) {
    const results = [];
    const errors = [];
    for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        const promises = batch.map((item, batchIndex) => operation(item, i + batchIndex)
            .catch(error => ({ error, index: i + batchIndex })));
        const batchResults = await Promise.all(promises);
        batchResults.forEach((result, batchIndex) => {
            if (result && typeof result === 'object' && 'error' in result) {
                errors.push(result);
            }
            else {
                results[i + batchIndex] = result;
            }
        });
    }
    if (errors.length > 0) {
        throw new index_1.ValidationError(`Batch operation failed for ${errors.length} items`, 'batch', { errors: errors.map(e => ({ index: e.index, message: e.error.message })) });
    }
    return results;
}
//# sourceMappingURL=recovery.js.map