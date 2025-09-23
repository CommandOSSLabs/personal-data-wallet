/**
 * MemoryPipeline - Unified Memory Processing Pipeline
 *
 * Orchestrates the complete memory processing workflow:
 * Memory Input → AI Embedding → Vector Indexing → Knowledge Graph → Walrus Storage → Sui Blockchain
 *
 * Provides comprehensive error handling, rollback capabilities, and monitoring.
 */
import { Memory, ProcessedMemory } from '../embedding/types';
export interface PipelineConfig {
    embedding?: {
        apiKey?: string;
        model?: string;
        enableBatching?: boolean;
        batchSize?: number;
    };
    vector?: {
        dimensions?: number;
        maxElements?: number;
        enablePersistence?: boolean;
    };
    batch?: {
        enableBatching?: boolean;
        batchSize?: number;
        batchDelayMs?: number;
    };
    graph?: {
        enableExtraction?: boolean;
        confidenceThreshold?: number;
        enableEmbeddings?: boolean;
    };
    storage?: {
        enableEncryption?: boolean;
        enableBatching?: boolean;
        network?: 'testnet' | 'mainnet';
    };
    blockchain?: {
        enableOwnershipTracking?: boolean;
        enableBatching?: boolean;
        network?: 'testnet' | 'mainnet';
        packageId?: string;
    };
    enableRollback?: boolean;
    enableMonitoring?: boolean;
    skipFailedSteps?: boolean;
    maxRetryAttempts?: number;
}
export interface PipelineStep {
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
    startTime?: Date;
    endTime?: Date;
    processingTimeMs?: number;
    result?: any;
    error?: string;
    retryAttempts?: number;
}
export interface PipelineExecution {
    id: string;
    userId: string;
    memoryId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'rolled_back';
    steps: PipelineStep[];
    startTime: Date;
    endTime?: Date;
    totalProcessingTime?: number;
    result?: ProcessedMemory;
    error?: string;
    rollbackReason?: string;
}
export interface PipelineMetrics {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    rolledBackExecutions: number;
    averageProcessingTime: number;
    stepMetrics: Record<string, {
        successCount: number;
        failureCount: number;
        averageProcessingTime: number;
        lastFailure?: string;
    }>;
    throughput: {
        memoriesPerHour: number;
        peakThroughput: number;
        currentLoad: number;
    };
}
export interface RollbackInfo {
    stepName: string;
    reason: string;
    rollbackActions: string[];
    completedActions: string[];
    failedActions: string[];
}
/**
 * Complete memory processing pipeline with orchestrated services
 */
export declare class MemoryPipeline {
    private embeddingService;
    private vectorManager;
    private batchManager;
    private graphManager;
    private storageManager;
    private blockchainManager;
    private readonly config;
    private executions;
    private metrics;
    private readonly PIPELINE_STEPS;
    constructor(config?: PipelineConfig);
    /**
     * Process memory through complete pipeline
     */
    processMemory(memory: Memory, userId: string, options?: {
        skipSteps?: string[];
        priority?: 'low' | 'normal' | 'high';
        enableRollback?: boolean;
        customMetadata?: Record<string, string>;
    }): Promise<PipelineExecution>;
    /**
     * Process multiple memories in batch
     */
    processMemoriesBatch(memories: Memory[], userId: string, options?: {
        batchSize?: number;
        skipSteps?: string[];
        priority?: 'low' | 'normal' | 'high';
        onProgress?: (completed: number, total: number, current?: PipelineExecution) => void;
        enableParallel?: boolean;
    }): Promise<PipelineExecution[]>;
    /**
     * Get execution status
     */
    getExecutionStatus(executionId: string): PipelineExecution | null;
    /**
     * Get all executions for user
     */
    getUserExecutions(userId: string): PipelineExecution[];
    /**
     * Get pipeline metrics
     */
    getPipelineMetrics(): PipelineMetrics;
    /**
     * Get active executions
     */
    getActiveExecutions(): PipelineExecution[];
    /**
     * Get failed executions
     */
    getFailedExecutions(limit?: number): PipelineExecution[];
    /**
     * Retry failed execution
     */
    retryExecution(executionId: string): Promise<PipelineExecution | null>;
    /**
     * Cancel active execution
     */
    cancelExecution(executionId: string): Promise<boolean>;
    /**
     * Clear completed executions
     */
    clearCompletedExecutions(): number;
    /**
     * Get pipeline health status
     */
    getPipelineHealth(): {
        status: 'healthy' | 'degraded' | 'critical';
        activeExecutions: number;
        successRate: number;
        averageProcessingTime: number;
        issues: string[];
    };
    private initializeServices;
    private initializeSteps;
    private initializeStepMetrics;
    private shouldExecuteStep;
    private executeEmbeddingStep;
    private executeVectorIndexingStep;
    private executeKnowledgeGraphStep;
    private executeStorageStep;
    private executeBlockchainStep;
    private executeStep;
    private findStep;
    private attemptRollback;
    private rollbackStep;
    private updateThroughputMetrics;
    private updateAverageProcessingTime;
    private generateExecutionId;
    private delay;
}
export default MemoryPipeline;
//# sourceMappingURL=MemoryPipeline.d.ts.map