/**
 * Personal Data Wallet SDK
 *
 * Comprehensive SDK for decentralized memory processing with AI-powered insights.
 *
 * Features:
 * - 🧠 Local AI embedding generation (Gemini API)
 * - 🔍 HNSW vector indexing with intelligent batching
 * - 📊 Knowledge graph extraction and management
 * - 🗄️ Walrus decentralized storage with encryption
 * - ⛓️ Sui blockchain ownership tracking
 * - 🔄 Unified processing pipeline with monitoring
 *
 * @version 1.0.0
 * @author Personal Data Wallet Team
 */
export { MemoryPipeline, PipelineManager } from './pipeline';
export type { PipelineConfig, PipelineExecution, PipelineMetrics, PipelineManagerConfig, SystemMetrics } from './pipeline';
import { MemoryPipeline } from './pipeline/MemoryPipeline';
import { PipelineManager } from './pipeline/PipelineManager';
import type { PipelineConfig, PipelineManagerConfig } from './pipeline';
export { EmbeddingService } from './embedding';
export { VectorManager, HnswIndexService } from './vector';
export { BatchManager, BatchingService, MemoryProcessingCache } from './batch';
export { GraphService, KnowledgeGraphManager } from './graph';
export { WalrusStorageService, StorageManager } from './storage';
export { SuiService, BlockchainManager } from './blockchain';
export { MemoryRetrievalService, MemoryDecryptionPipeline } from './retrieval';
export type { UnifiedMemoryQuery, UnifiedMemoryResult, RetrievalStats, RetrievalContext, KeyServerConfig, DecryptionConfig, DecryptionRequest, DecryptionResult, BatchDecryptionResult } from './retrieval';
export { ConfigurationHelper, Config } from './config';
export type { SDKConfig, EnvironmentConfig } from './config';
export type { Memory, ProcessedMemory, EmbeddingResult, EmbeddingConfig } from './embedding/types';
export type { VectorSearchResult, HNSWIndexConfig } from './vector';
export type { CacheConfig, CacheMetrics } from './batch';
export type { Entity, Relationship, KnowledgeGraph } from './graph';
export type { WalrusUploadResult, WalrusRetrievalResult, StorageResult, MemoryMetadata } from './storage';
export type { MemoryRecord, TransactionResult, OwnershipVerification, BlockchainStats } from './blockchain';
/**
 * SDK Version Information
 */
export declare const SDK_VERSION = "1.0.0";
export declare const SDK_NAME = "Personal Data Wallet SDK";
/**
 * Quick start configuration presets
 */
export declare const QuickStartConfigs: {
    /**
     * Basic configuration for simple memory processing
     */
    BASIC: PipelineConfig;
    /**
     * Full decentralized configuration with all features
     */
    DECENTRALIZED: PipelineConfig;
    /**
     * High-performance configuration optimized for throughput
     */
    HIGH_PERFORMANCE: PipelineConfig;
    /**
     * Development configuration with enhanced debugging
     */
    DEVELOPMENT: PipelineConfig;
};
/**
 * Create a pre-configured pipeline with quick start settings
 */
export declare function createQuickStartPipeline(preset: keyof typeof QuickStartConfigs, overrides?: Partial<PipelineConfig>): MemoryPipeline;
/**
 * Create a pipeline manager with recommended settings
 */
export declare function createPipelineManager(config?: Partial<PipelineManagerConfig>): PipelineManager;
/**
 * SDK Information and utilities
 */
export declare const SDK: {
    version: string;
    name: string;
    /**
     * Get SDK build information
     */
    getBuildInfo(): {
        version: string;
        name: string;
        buildDate: string;
        features: string[];
    };
    /**
     * Validate configuration
     */
    validateConfig(config: PipelineConfig): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
};
declare const _default: {
    MemoryPipeline: typeof MemoryPipeline;
    PipelineManager: typeof PipelineManager;
    createQuickStartPipeline: typeof createQuickStartPipeline;
    createPipelineManager: typeof createPipelineManager;
    QuickStartConfigs: {
        /**
         * Basic configuration for simple memory processing
         */
        BASIC: PipelineConfig;
        /**
         * Full decentralized configuration with all features
         */
        DECENTRALIZED: PipelineConfig;
        /**
         * High-performance configuration optimized for throughput
         */
        HIGH_PERFORMANCE: PipelineConfig;
        /**
         * Development configuration with enhanced debugging
         */
        DEVELOPMENT: PipelineConfig;
    };
    SDK: {
        version: string;
        name: string;
        /**
         * Get SDK build information
         */
        getBuildInfo(): {
            version: string;
            name: string;
            buildDate: string;
            features: string[];
        };
        /**
         * Validate configuration
         */
        validateConfig(config: PipelineConfig): {
            isValid: boolean;
            errors: string[];
            warnings: string[];
        };
    };
};
export default _default;
export { MainWalletService } from './wallet/MainWalletService';
export { ContextWalletService } from './wallet/ContextWalletService';
export { PermissionService } from './access/PermissionService';
export type { ConsentRepository } from './permissions/ConsentRepository';
export { FileSystemConsentRepository, InMemoryConsentRepository } from './permissions/ConsentRepository';
export { AggregationService } from './aggregation/AggregationService';
export type { MainWallet, ContextWallet, ConsentRequest, ConsentRequestRecord, ConsentStatus, AccessGrant, CreateMainWalletOptions, CreateContextWalletOptions, DeriveContextIdOptions, RotateKeysOptions, RotateKeysResult, PermissionScope, RequestConsentOptions, GrantPermissionsOptions, RevokePermissionsOptions, AggregatedQueryOptions, PermissionScopes } from './core/types/wallet';
export declare const VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map