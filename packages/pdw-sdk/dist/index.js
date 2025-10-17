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
// Core pipeline - the main entry point
export { MemoryPipeline, PipelineManager } from './pipeline';
// Import for internal use
import { MemoryPipeline } from './pipeline/MemoryPipeline';
import { PipelineManager } from './pipeline/PipelineManager';
// ==================== SERVICES ====================
// Business logic services
export { StorageService } from './services/StorageService';
export { EmbeddingService } from './services/EmbeddingService';
export { GeminiAIService } from './services/GeminiAIService';
export { QueryService } from './services/QueryService';
export { ClassifierService } from './services/ClassifierService';
export { MemoryIndexService } from './services/MemoryIndexService';
export { ViewService } from './services/ViewService';
export { TransactionService } from './services/TransactionService';
export { BatchService } from './services/BatchService';
export { ChatService } from './services/ChatService';
export { CrossContextPermissionService } from './services/CrossContextPermissionService';
export { MemoryService } from './services/MemoryService';
export { VectorService } from './services/VectorService';
// ==================== INFRASTRUCTURE ====================
// External integrations (use these instead of old paths)
export { WalrusStorageService, StorageManager } from './infrastructure/walrus';
export { SuiService, BlockchainManager } from './infrastructure/sui';
export { SealService } from './infrastructure/seal';
export { EncryptionService } from './infrastructure/seal';
// ==================== CORE ====================
// Core interfaces and base classes
export * from './core/interfaces';
// ==================== UTILITIES ====================
// Vector indexing and batch processing
export { VectorManager, HnswIndexService } from './vector';
export { BatchManager, BatchingService, MemoryProcessingCache } from './batch';
export { GraphService, KnowledgeGraphManager } from './graph';
// Memory retrieval, analytics, and decryption
export { MemoryRetrievalService, MemoryDecryptionPipeline } from './retrieval';
// Configuration management
export { ConfigurationHelper, Config } from './config';
// Utility exports - using imported classes above
/**
 * SDK Version Information
 */
export const SDK_VERSION = '1.0.0';
export const SDK_NAME = 'Personal Data Wallet SDK';
/**
 * Quick start configuration presets
 */
export const QuickStartConfigs = {
    /**
     * Basic configuration for simple memory processing
     */
    BASIC: {
        embedding: {
            enableBatching: true,
            batchSize: 10
        },
        storage: {
            enableEncryption: false,
            enableBatching: false
        },
        blockchain: {
            enableOwnershipTracking: false
        }
    },
    /**
     * Full decentralized configuration with all features
     */
    DECENTRALIZED: {
        embedding: {
            enableBatching: true,
            batchSize: 20
        },
        vector: {
            enablePersistence: true,
            maxElements: 10000
        },
        graph: {
            enableExtraction: true,
            confidenceThreshold: 0.7
        },
        storage: {
            enableEncryption: true,
            enableBatching: true,
            network: 'testnet'
        },
        blockchain: {
            enableOwnershipTracking: true,
            enableBatching: true,
            network: 'testnet'
        },
        enableRollback: true,
        enableMonitoring: true
    },
    /**
     * High-performance configuration optimized for throughput
     */
    HIGH_PERFORMANCE: {
        embedding: {
            enableBatching: true,
            batchSize: 50
        },
        batch: {
            enableBatching: true,
            batchSize: 100,
            batchDelayMs: 2000
        },
        vector: {
            maxElements: 50000,
            enablePersistence: true
        },
        graph: {
            enableExtraction: false // Disable for performance
        },
        storage: {
            enableBatching: true,
            enableEncryption: false // Disable for performance
        },
        blockchain: {
            enableBatching: true,
            enableOwnershipTracking: true
        },
        skipFailedSteps: true,
        maxRetryAttempts: 1,
        enableMonitoring: true
    },
    /**
     * Development configuration with enhanced debugging
     */
    DEVELOPMENT: {
        embedding: {
            enableBatching: false // Process individually for debugging
        },
        vector: {
            maxElements: 1000
        },
        graph: {
            enableExtraction: true,
            confidenceThreshold: 0.5 // Lower threshold for testing
        },
        storage: {
            enableEncryption: false,
            enableBatching: false
        },
        blockchain: {
            enableOwnershipTracking: false, // Skip for dev
            enableBatching: false
        },
        enableRollback: true,
        enableMonitoring: true,
        skipFailedSteps: false,
        maxRetryAttempts: 0 // Fail fast for debugging
    }
};
/**
 * Create a pre-configured pipeline with quick start settings
 */
export function createQuickStartPipeline(preset, overrides = {}) {
    const baseConfig = QuickStartConfigs[preset];
    const mergedConfig = { ...baseConfig, ...overrides };
    // Auto-configure API key if not provided
    if (!mergedConfig.embedding?.apiKey) {
        try {
            const { Config } = require('./config');
            const apiKey = Config.getGeminiKey();
            mergedConfig.embedding = {
                ...mergedConfig.embedding,
                apiKey
            };
            console.log('✅ Auto-configured Gemini API key from environment');
        }
        catch (error) {
            console.warn('⚠️ No Gemini API key found. Please provide one for AI features to work.');
        }
    }
    return new MemoryPipeline(mergedConfig);
}
/**
 * Create a pipeline manager with recommended settings
 */
export function createPipelineManager(config = {}) {
    const defaultConfig = {
        maxConcurrentPipelines: 5,
        enableScheduling: true,
        enableHealthChecks: true,
        enableMetricsCollection: true,
        defaultPipelineConfig: QuickStartConfigs.BASIC
    };
    const mergedConfig = { ...defaultConfig, ...config };
    return new PipelineManager(mergedConfig);
}
/**
 * SDK Information and utilities
 */
export const SDK = {
    version: SDK_VERSION,
    name: SDK_NAME,
    /**
     * Get SDK build information
     */
    getBuildInfo() {
        return {
            version: SDK_VERSION,
            name: SDK_NAME,
            buildDate: new Date().toISOString(),
            features: [
                'AI Embedding Generation',
                'HNSW Vector Indexing',
                'Knowledge Graph Extraction',
                'Walrus Decentralized Storage',
                'Sui Blockchain Integration',
                'Unified Processing Pipeline',
                'Batch Processing & Caching',
                'Comprehensive Monitoring'
            ]
        };
    },
    /**
     * Validate configuration
     */
    validateConfig(config) {
        const errors = [];
        const warnings = [];
        // Validate embedding config
        if (config.embedding?.batchSize && config.embedding.batchSize > 100) {
            warnings.push('Large embedding batch size may cause memory issues');
        }
        // Validate vector config  
        if (config.vector?.maxElements && config.vector.maxElements > 100000) {
            warnings.push('Large vector index may impact performance');
        }
        // Validate network consistency
        if (config.storage?.network !== config.blockchain?.network) {
            warnings.push('Storage and blockchain networks should match');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
};
// Default export for convenience
export default {
    MemoryPipeline,
    PipelineManager,
    createQuickStartPipeline,
    createPipelineManager,
    QuickStartConfigs,
    SDK
};
// Client-side memory management for React dApps
export { ClientMemoryManager } from './client/ClientMemoryManager';
// React Hooks - High-level hooks for React dApps
export { useMemoryManager, useCreateMemory, useSearchMemories, useWalletMemories, useMemoryChat } from './hooks';
// Wallet architecture components
export { MainWalletService } from './wallet/MainWalletService';
export { ContextWalletService } from './wallet/ContextWalletService';
export { PermissionService } from './access/PermissionService';
export { FileSystemConsentRepository, InMemoryConsentRepository } from './permissions/ConsentRepository';
export { AggregationService } from './aggregation/AggregationService';
// Legacy version for compatibility
export const VERSION = '1.0.0';
//# sourceMappingURL=index.js.map