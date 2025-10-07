"use strict";
/**
 * Base Service Interface
 *
 * Defines the standard interface that all services in the PDW SDK should implement.
 * Provides consistent lifecycle management, error handling, logging, and metrics.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = exports.ConsoleLogger = exports.ServiceState = void 0;
/**
 * Service lifecycle states
 */
var ServiceState;
(function (ServiceState) {
    ServiceState["UNINITIALIZED"] = "uninitialized";
    ServiceState["INITIALIZING"] = "initializing";
    ServiceState["READY"] = "ready";
    ServiceState["ERROR"] = "error";
    ServiceState["DESTROYED"] = "destroyed";
})(ServiceState || (exports.ServiceState = ServiceState = {}));
/**
 * Default console logger implementation
 */
class ConsoleLogger {
    constructor(serviceName, debugEnabled = false) {
        this.serviceName = serviceName;
        this.debugEnabled = debugEnabled;
    }
    debug(message, context) {
        if (this.debugEnabled) {
            console.debug(`[${this.serviceName}] ${message}`, context || '');
        }
    }
    info(message, context) {
        console.log(`[${this.serviceName}] ${message}`, context || '');
    }
    warn(message, context) {
        console.warn(`[${this.serviceName}] ${message}`, context || '');
    }
    error(message, error, context) {
        console.error(`[${this.serviceName}] ${message}`, error, context || '');
    }
}
exports.ConsoleLogger = ConsoleLogger;
/**
 * Abstract base service class with common functionality
 */
class BaseService {
    constructor(config) {
        this.config = config;
        this._state = ServiceState.UNINITIALIZED;
        this._logger = config.logger || new ConsoleLogger(config.name || this.constructor.name, config.debug || false);
        this._startTime = Date.now();
        this._metrics = {
            operationCount: 0,
            errorCount: 0,
            averageDuration: 0,
            uptime: 0,
            custom: {},
        };
    }
    get name() {
        return this.config.name || this.constructor.name;
    }
    get state() {
        return this._state;
    }
    async initialize() {
        if (this._state !== ServiceState.UNINITIALIZED) {
            this._logger.warn('Service already initialized', { state: this._state });
            return;
        }
        this._state = ServiceState.INITIALIZING;
        this._logger.info('Initializing service...');
        try {
            await this.onInitialize();
            this._state = ServiceState.READY;
            this._logger.info('Service initialized successfully');
        }
        catch (error) {
            this._state = ServiceState.ERROR;
            this._logger.error('Service initialization failed', error);
            throw error;
        }
    }
    async destroy() {
        this._logger.info('Destroying service...');
        try {
            await this.onDestroy();
            this._state = ServiceState.DESTROYED;
            this._logger.info('Service destroyed successfully');
        }
        catch (error) {
            this._logger.error('Service destruction failed', error);
            throw error;
        }
    }
    async reset() {
        this._logger.info('Resetting service...');
        try {
            await this.onReset();
            this._metrics = {
                operationCount: 0,
                errorCount: 0,
                averageDuration: 0,
                uptime: 0,
                custom: {},
            };
            this._logger.info('Service reset successfully');
        }
        catch (error) {
            this._logger.error('Service reset failed', error);
            throw error;
        }
    }
    async getHealth() {
        return {
            healthy: this._state === ServiceState.READY,
            state: this._state,
            timestamp: Date.now(),
            details: {
                uptime: Date.now() - this._startTime,
                operationCount: this._metrics.operationCount,
                errorCount: this._metrics.errorCount,
            },
        };
    }
    getMetrics() {
        return {
            ...this._metrics,
            uptime: Date.now() - this._startTime,
        };
    }
    /**
     * Track an operation for metrics
     */
    async trackOperation(operationName, operation) {
        const startTime = performance.now();
        try {
            this._logger.debug(`Starting operation: ${operationName}`);
            const result = await operation();
            const duration = performance.now() - startTime;
            this.updateMetrics(duration);
            this._logger.debug(`Completed operation: ${operationName}`, { duration });
            return result;
        }
        catch (error) {
            this._metrics.errorCount++;
            this._logger.error(`Operation failed: ${operationName}`, error);
            throw error;
        }
    }
    /**
     * Update metrics with operation duration
     */
    updateMetrics(duration) {
        this._metrics.operationCount++;
        // Calculate rolling average
        const totalDuration = this._metrics.averageDuration * (this._metrics.operationCount - 1);
        this._metrics.averageDuration = (totalDuration + duration) / this._metrics.operationCount;
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=IService.js.map