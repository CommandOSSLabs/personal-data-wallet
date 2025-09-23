/**
 * PipelineManager - High-Level Pipeline Orchestration
 *
 * Manages multiple pipeline instances, provides scheduling, monitoring,
 * and administration capabilities for memory processing workflows.
 */
import { MemoryPipeline, PipelineConfig, PipelineExecution } from './MemoryPipeline';
import { Memory } from '../embedding/types';
export interface PipelineManagerConfig {
    maxConcurrentPipelines?: number;
    defaultPipelineConfig?: PipelineConfig;
    enableScheduling?: boolean;
    enableHealthChecks?: boolean;
    healthCheckIntervalMs?: number;
    enableMetricsCollection?: boolean;
    metricsRetentionDays?: number;
}
export interface ManagedPipeline {
    id: string;
    name: string;
    pipeline: MemoryPipeline;
    config: PipelineConfig;
    status: 'active' | 'paused' | 'stopped';
    createdAt: Date;
    lastUsed: Date;
    executionCount: number;
}
export interface PipelineSchedule {
    id: string;
    pipelineId: string;
    userId: string;
    memories: Memory[];
    scheduledAt: Date;
    priority: 'low' | 'normal' | 'high';
    status: 'scheduled' | 'running' | 'completed' | 'failed';
    result?: PipelineExecution[];
}
export interface SystemMetrics {
    totalPipelines: number;
    activePipelines: number;
    totalExecutions: number;
    activeExecutions: number;
    systemLoad: number;
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
    performance: {
        averageExecutionTime: number;
        throughput: number;
        successRate: number;
    };
    health: {
        status: 'healthy' | 'degraded' | 'critical';
        issues: string[];
        lastCheck: Date;
    };
}
export interface PipelineTemplate {
    name: string;
    description: string;
    config: PipelineConfig;
    category: 'basic' | 'advanced' | 'custom';
    tags: string[];
}
/**
 * High-level pipeline management and orchestration
 */
export declare class PipelineManager {
    private pipelines;
    private schedules;
    private healthCheckTimer?;
    private readonly config;
    private systemMetrics;
    private readonly PIPELINE_TEMPLATES;
    constructor(config?: PipelineManagerConfig);
    /**
     * Create a new managed pipeline
     */
    createPipeline(name: string, config?: PipelineConfig, options?: {
        autoStart?: boolean;
        description?: string;
    }): string;
    /**
     * Create pipeline from template
     */
    createPipelineFromTemplate(templateName: string, customName: string, configOverrides?: Partial<PipelineConfig>): string;
    /**
     * Get pipeline templates
     */
    getPipelineTemplates(): PipelineTemplate[];
    /**
     * Get managed pipeline
     */
    getPipeline(pipelineId: string): ManagedPipeline | null;
    /**
     * List all pipelines
     */
    listPipelines(): ManagedPipeline[];
    /**
     * Start pipeline
     */
    startPipeline(pipelineId: string): boolean;
    /**
     * Pause pipeline
     */
    pausePipeline(pipelineId: string): boolean;
    /**
     * Stop and remove pipeline
     */
    removePipeline(pipelineId: string): boolean;
    /**
     * Process memory using specified pipeline
     */
    processMemory(pipelineId: string, memory: Memory, userId: string, options?: any): Promise<PipelineExecution>;
    /**
     * Process memories in batch using specified pipeline
     */
    processMemoriesBatch(pipelineId: string, memories: Memory[], userId: string, options?: any): Promise<PipelineExecution[]>;
    /**
     * Schedule memory processing
     */
    scheduleMemoryProcessing(pipelineId: string, userId: string, memories: Memory[], scheduledAt: Date, priority?: 'low' | 'normal' | 'high'): string;
    /**
     * Get scheduled processing jobs
     */
    getScheduledJobs(): PipelineSchedule[];
    /**
     * Cancel scheduled job
     */
    cancelScheduledJob(scheduleId: string): boolean;
    /**
     * Get system metrics
     */
    getSystemMetrics(): SystemMetrics;
    /**
     * Get pipeline health status
     */
    getPipelineHealth(pipelineId: string): any;
    /**
     * Get all pipeline executions
     */
    getAllExecutions(): {
        pipelineId: string;
        executions: PipelineExecution[];
    }[];
    /**
     * Cleanup completed executions across all pipelines
     */
    cleanupCompletedExecutions(): number;
    /**
     * Get system health summary
     */
    getSystemHealth(): {
        overallStatus: 'healthy' | 'degraded' | 'critical';
        pipelineHealth: Array<{
            pipelineId: string;
            status: string;
            issues: string[];
        }>;
        systemLoad: number;
        recommendations: string[];
    };
    /**
     * Shutdown pipeline manager
     */
    shutdown(): void;
    private executeScheduledProcessing;
    private startHealthChecks;
    private performHealthCheck;
    private updateSystemMetrics;
    private updatePerformanceMetrics;
    private generatePipelineId;
    private generateScheduleId;
}
export default PipelineManager;
//# sourceMappingURL=PipelineManager.d.ts.map