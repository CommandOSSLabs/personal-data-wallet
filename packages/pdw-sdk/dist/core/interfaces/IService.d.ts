/**
 * Base Service Interface
 *
 * Defines the standard interface that all services in the PDW SDK should implement.
 * Provides consistent lifecycle management, error handling, logging, and metrics.
 */
/**
 * Service lifecycle states
 */
export declare enum ServiceState {
    UNINITIALIZED = "uninitialized",
    INITIALIZING = "initializing",
    READY = "ready",
    ERROR = "error",
    DESTROYED = "destroyed"
}
/**
 * Service configuration base interface
 */
export interface IServiceConfig {
    /** Service name for logging and metrics */
    name?: string;
    /** Enable debug logging */
    debug?: boolean;
    /** Enable metrics collection */
    enableMetrics?: boolean;
    /** Custom logger instance */
    logger?: ILogger;
}
/**
 * Logger interface for consistent logging across services
 */
export interface ILogger {
    debug(message: string, context?: Record<string, any>): void;
    info(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: string, error?: Error, context?: Record<string, any>): void;
}
/**
 * Service metrics interface
 */
export interface IServiceMetrics {
    /** Total number of operations performed */
    operationCount: number;
    /** Total number of errors encountered */
    errorCount: number;
    /** Average operation duration in milliseconds */
    averageDuration: number;
    /** Last operation timestamp */
    lastOperationTime?: number;
    /** Service uptime in milliseconds */
    uptime: number;
    /** Custom metrics specific to the service */
    custom?: Record<string, number>;
}
/**
 * Base service interface that all services should implement
 */
export interface IService {
    /**
     * Service name for identification
     */
    readonly name: string;
    /**
     * Current service state
     */
    readonly state: ServiceState;
    /**
     * Initialize the service
     * Should be called before using the service
     * @returns Promise that resolves when initialization is complete
     */
    initialize?(): Promise<void>;
    /**
     * Destroy the service and cleanup resources
     * Should be called when the service is no longer needed
     * @returns Promise that resolves when cleanup is complete
     */
    destroy?(): Promise<void>;
    /**
     * Reset the service to initial state
     * Useful for testing or recovering from errors
     * @returns Promise that resolves when reset is complete
     */
    reset?(): Promise<void>;
    /**
     * Get service health status
     * @returns Health check result
     */
    getHealth?(): Promise<ServiceHealth>;
    /**
     * Get service metrics
     * @returns Current service metrics
     */
    getMetrics?(): IServiceMetrics;
}
/**
 * Service health check result
 */
export interface ServiceHealth {
    /** Whether the service is healthy */
    healthy: boolean;
    /** Service state */
    state: ServiceState;
    /** Health check timestamp */
    timestamp: number;
    /** Optional error message if unhealthy */
    error?: string;
    /** Additional health details */
    details?: Record<string, any>;
}
/**
 * Default console logger implementation
 */
export declare class ConsoleLogger implements ILogger {
    private serviceName;
    private debugEnabled;
    constructor(serviceName: string, debugEnabled?: boolean);
    debug(message: string, context?: Record<string, any>): void;
    info(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: string, error?: Error, context?: Record<string, any>): void;
}
/**
 * Abstract base service class with common functionality
 */
export declare abstract class BaseService implements IService {
    protected config: IServiceConfig;
    protected _state: ServiceState;
    protected _logger: ILogger;
    protected _metrics: IServiceMetrics;
    protected _startTime: number;
    constructor(config: IServiceConfig);
    get name(): string;
    get state(): ServiceState;
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    reset(): Promise<void>;
    getHealth(): Promise<ServiceHealth>;
    getMetrics(): IServiceMetrics;
    /**
     * Track an operation for metrics
     */
    protected trackOperation<T>(operationName: string, operation: () => Promise<T>): Promise<T>;
    /**
     * Update metrics with operation duration
     */
    private updateMetrics;
    /**
     * Hook for service-specific initialization
     */
    protected abstract onInitialize(): Promise<void>;
    /**
     * Hook for service-specific destruction
     */
    protected abstract onDestroy(): Promise<void>;
    /**
     * Hook for service-specific reset
     */
    protected abstract onReset(): Promise<void>;
}
//# sourceMappingURL=IService.d.ts.map