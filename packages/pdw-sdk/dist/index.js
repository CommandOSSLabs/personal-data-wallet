"use strict";
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
exports.VERSION = exports.AggregationService = exports.InMemoryConsentRepository = exports.FileSystemConsentRepository = exports.PermissionService = exports.ContextWalletService = exports.MainWalletService = exports.SDK = exports.QuickStartConfigs = exports.SDK_NAME = exports.SDK_VERSION = exports.Config = exports.ConfigurationHelper = exports.MemoryDecryptionPipeline = exports.MemoryRetrievalService = exports.KnowledgeGraphManager = exports.GraphService = exports.MemoryProcessingCache = exports.BatchingService = exports.BatchManager = exports.HnswIndexService = exports.VectorManager = exports.EncryptionService = exports.SealService = exports.BlockchainManager = exports.SuiService = exports.StorageManager = exports.WalrusStorageService = exports.VectorService = exports.MemoryService = exports.CrossContextPermissionService = exports.ChatService = exports.BatchService = exports.TransactionService = exports.ViewService = exports.MemoryIndexService = exports.ClassifierService = exports.QueryService = exports.GeminiAIService = exports.EmbeddingService = exports.StorageService = exports.PipelineManager = exports.MemoryPipeline = void 0;
exports.createQuickStartPipeline = createQuickStartPipeline;
exports.createPipelineManager = createPipelineManager;
// Core pipeline - the main entry point
var pipeline_1 = require("./pipeline");
Object.defineProperty(exports, "MemoryPipeline", { enumerable: true, get: function () { return pipeline_1.MemoryPipeline; } });
Object.defineProperty(exports, "PipelineManager", { enumerable: true, get: function () { return pipeline_1.PipelineManager; } });
// Import for internal use
const MemoryPipeline_1 = require("./pipeline/MemoryPipeline");
const PipelineManager_1 = require("./pipeline/PipelineManager");
// ==================== SERVICES ====================
// Business logic services
var StorageService_1 = require("./services/StorageService");
Object.defineProperty(exports, "StorageService", { enumerable: true, get: function () { return StorageService_1.StorageService; } });
var EmbeddingService_1 = require("./services/EmbeddingService");
Object.defineProperty(exports, "EmbeddingService", { enumerable: true, get: function () { return EmbeddingService_1.EmbeddingService; } });
var GeminiAIService_1 = require("./services/GeminiAIService");
Object.defineProperty(exports, "GeminiAIService", { enumerable: true, get: function () { return GeminiAIService_1.GeminiAIService; } });
var QueryService_1 = require("./services/QueryService");
Object.defineProperty(exports, "QueryService", { enumerable: true, get: function () { return QueryService_1.QueryService; } });
var ClassifierService_1 = require("./services/ClassifierService");
Object.defineProperty(exports, "ClassifierService", { enumerable: true, get: function () { return ClassifierService_1.ClassifierService; } });
var MemoryIndexService_1 = require("./services/MemoryIndexService");
Object.defineProperty(exports, "MemoryIndexService", { enumerable: true, get: function () { return MemoryIndexService_1.MemoryIndexService; } });
var ViewService_1 = require("./services/ViewService");
Object.defineProperty(exports, "ViewService", { enumerable: true, get: function () { return ViewService_1.ViewService; } });
var TransactionService_1 = require("./services/TransactionService");
Object.defineProperty(exports, "TransactionService", { enumerable: true, get: function () { return TransactionService_1.TransactionService; } });
var BatchService_1 = require("./services/BatchService");
Object.defineProperty(exports, "BatchService", { enumerable: true, get: function () { return BatchService_1.BatchService; } });
var ChatService_1 = require("./services/ChatService");
Object.defineProperty(exports, "ChatService", { enumerable: true, get: function () { return ChatService_1.ChatService; } });
var CrossContextPermissionService_1 = require("./services/CrossContextPermissionService");
Object.defineProperty(exports, "CrossContextPermissionService", { enumerable: true, get: function () { return CrossContextPermissionService_1.CrossContextPermissionService; } });
var MemoryService_1 = require("./services/MemoryService");
Object.defineProperty(exports, "MemoryService", { enumerable: true, get: function () { return MemoryService_1.MemoryService; } });
var VectorService_1 = require("./services/VectorService");
Object.defineProperty(exports, "VectorService", { enumerable: true, get: function () { return VectorService_1.VectorService; } });
// ==================== INFRASTRUCTURE ====================
// External integrations (use these instead of old paths)
var walrus_1 = require("./infrastructure/walrus");
Object.defineProperty(exports, "WalrusStorageService", { enumerable: true, get: function () { return walrus_1.WalrusStorageService; } });
Object.defineProperty(exports, "StorageManager", { enumerable: true, get: function () { return walrus_1.StorageManager; } });
var sui_1 = require("./infrastructure/sui");
Object.defineProperty(exports, "SuiService", { enumerable: true, get: function () { return sui_1.SuiService; } });
Object.defineProperty(exports, "BlockchainManager", { enumerable: true, get: function () { return sui_1.BlockchainManager; } });
var seal_1 = require("./infrastructure/seal");
Object.defineProperty(exports, "SealService", { enumerable: true, get: function () { return seal_1.SealService; } });
var seal_2 = require("./infrastructure/seal");
Object.defineProperty(exports, "EncryptionService", { enumerable: true, get: function () { return seal_2.EncryptionService; } });
// ==================== CORE ====================
// Core interfaces and base classes
__exportStar(require("./core/interfaces"), exports);
// ==================== UTILITIES ====================
// Vector indexing and batch processing
var vector_1 = require("./vector");
Object.defineProperty(exports, "VectorManager", { enumerable: true, get: function () { return vector_1.VectorManager; } });
Object.defineProperty(exports, "HnswIndexService", { enumerable: true, get: function () { return vector_1.HnswIndexService; } });
var batch_1 = require("./batch");
Object.defineProperty(exports, "BatchManager", { enumerable: true, get: function () { return batch_1.BatchManager; } });
Object.defineProperty(exports, "BatchingService", { enumerable: true, get: function () { return batch_1.BatchingService; } });
Object.defineProperty(exports, "MemoryProcessingCache", { enumerable: true, get: function () { return batch_1.MemoryProcessingCache; } });
var graph_1 = require("./graph");
Object.defineProperty(exports, "GraphService", { enumerable: true, get: function () { return graph_1.GraphService; } });
Object.defineProperty(exports, "KnowledgeGraphManager", { enumerable: true, get: function () { return graph_1.KnowledgeGraphManager; } });
// Memory retrieval, analytics, and decryption
var retrieval_1 = require("./retrieval");
Object.defineProperty(exports, "MemoryRetrievalService", { enumerable: true, get: function () { return retrieval_1.MemoryRetrievalService; } });
Object.defineProperty(exports, "MemoryDecryptionPipeline", { enumerable: true, get: function () { return retrieval_1.MemoryDecryptionPipeline; } });
// Configuration management
var config_1 = require("./config");
Object.defineProperty(exports, "ConfigurationHelper", { enumerable: true, get: function () { return config_1.ConfigurationHelper; } });
Object.defineProperty(exports, "Config", { enumerable: true, get: function () { return config_1.Config; } });
// Utility exports - using imported classes above
/**
 * SDK Version Information
 */
exports.SDK_VERSION = '1.0.0';
exports.SDK_NAME = 'Personal Data Wallet SDK';
/**
 * Quick start configuration presets
 */
exports.QuickStartConfigs = {
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
function createQuickStartPipeline(preset, overrides = {}) {
    const baseConfig = exports.QuickStartConfigs[preset];
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
    return new MemoryPipeline_1.MemoryPipeline(mergedConfig);
}
/**
 * Create a pipeline manager with recommended settings
 */
function createPipelineManager(config = {}) {
    const defaultConfig = {
        maxConcurrentPipelines: 5,
        enableScheduling: true,
        enableHealthChecks: true,
        enableMetricsCollection: true,
        defaultPipelineConfig: exports.QuickStartConfigs.BASIC
    };
    const mergedConfig = { ...defaultConfig, ...config };
    return new PipelineManager_1.PipelineManager(mergedConfig);
}
/**
 * SDK Information and utilities
 */
exports.SDK = {
    version: exports.SDK_VERSION,
    name: exports.SDK_NAME,
    /**
     * Get SDK build information
     */
    getBuildInfo() {
        return {
            version: exports.SDK_VERSION,
            name: exports.SDK_NAME,
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
exports.default = {
    MemoryPipeline: MemoryPipeline_1.MemoryPipeline,
    PipelineManager: PipelineManager_1.PipelineManager,
    createQuickStartPipeline,
    createPipelineManager,
    QuickStartConfigs: exports.QuickStartConfigs,
    SDK: exports.SDK
};
// Wallet architecture components
var MainWalletService_1 = require("./wallet/MainWalletService");
Object.defineProperty(exports, "MainWalletService", { enumerable: true, get: function () { return MainWalletService_1.MainWalletService; } });
var ContextWalletService_1 = require("./wallet/ContextWalletService");
Object.defineProperty(exports, "ContextWalletService", { enumerable: true, get: function () { return ContextWalletService_1.ContextWalletService; } });
var PermissionService_1 = require("./access/PermissionService");
Object.defineProperty(exports, "PermissionService", { enumerable: true, get: function () { return PermissionService_1.PermissionService; } });
var ConsentRepository_1 = require("./permissions/ConsentRepository");
Object.defineProperty(exports, "FileSystemConsentRepository", { enumerable: true, get: function () { return ConsentRepository_1.FileSystemConsentRepository; } });
Object.defineProperty(exports, "InMemoryConsentRepository", { enumerable: true, get: function () { return ConsentRepository_1.InMemoryConsentRepository; } });
var AggregationService_1 = require("./aggregation/AggregationService");
Object.defineProperty(exports, "AggregationService", { enumerable: true, get: function () { return AggregationService_1.AggregationService; } });
// Legacy version for compatibility
exports.VERSION = '1.0.0';
//# sourceMappingURL=index.js.map