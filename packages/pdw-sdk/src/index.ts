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
export type { 
  PipelineConfig, 
  PipelineExecution, 
  PipelineMetrics,
  PipelineManagerConfig,
  SystemMetrics 
} from './pipeline';

// Import for internal use
import { MemoryPipeline } from './pipeline/MemoryPipeline';
import { PipelineManager } from './pipeline/PipelineManager';
import type { PipelineConfig, PipelineManagerConfig } from './pipeline';

// Individual service modules
export { EmbeddingService } from './embedding';
export { VectorManager, HnswIndexService } from './vector';
export { BatchManager, BatchingService, MemoryProcessingCache } from './batch';
export { GraphService, KnowledgeGraphManager } from './graph';
export { WalrusStorageService, StorageManager } from './storage';
export { SuiService, BlockchainManager } from './blockchain';

// Memory retrieval, analytics, and decryption
export { MemoryRetrievalService, MemoryDecryptionPipeline } from './retrieval';
export type { 
  UnifiedMemoryQuery, 
  UnifiedMemoryResult, 
  RetrievalStats, 
  RetrievalContext,
  KeyServerConfig,
  DecryptionConfig,
  DecryptionRequest,
  DecryptionResult,
  BatchDecryptionResult
} from './retrieval';

// Configuration management
export { ConfigurationHelper, Config } from './config';
export type { SDKConfig, EnvironmentConfig } from './config';

// Type exports for all modules
export type {
  Memory,
  ProcessedMemory,
  EmbeddingResult,
  EmbeddingConfig
} from './embedding/types';

export type {
  VectorSearchResult,
  HNSWIndexConfig
} from './vector';

export type {
  CacheConfig,
  CacheMetrics
} from './batch';

export type {
  Entity,
  Relationship,
  KnowledgeGraph
} from './graph';

export type {
  WalrusUploadResult,
  WalrusRetrievalResult,
  StorageResult,
  MemoryMetadata
} from './storage';

export type {
  MemoryRecord,
  TransactionResult,
  OwnershipVerification,
  BlockchainStats
} from './blockchain';

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
  } as PipelineConfig,

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
  } as PipelineConfig,

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
  } as PipelineConfig,

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
  } as PipelineConfig
};

/**
 * Create a pre-configured pipeline with quick start settings
 */
export function createQuickStartPipeline(
  preset: keyof typeof QuickStartConfigs,
  overrides: Partial<PipelineConfig> = {}
): MemoryPipeline {
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
    } catch (error) {
      console.warn('⚠️ No Gemini API key found. Please provide one for AI features to work.');
    }
  }
  
  return new MemoryPipeline(mergedConfig);
}

/**
 * Create a pipeline manager with recommended settings
 */
export function createPipelineManager(
  config: Partial<PipelineManagerConfig> = {}
): PipelineManager {
  const defaultConfig: PipelineManagerConfig = {
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
  getBuildInfo(): {
    version: string;
    name: string;
    buildDate: string;
    features: string[];
  } {
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
  validateConfig(config: PipelineConfig): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

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

// Wallet architecture components
export { MainWalletService } from './wallet/MainWalletService';
export { ContextWalletService } from './wallet/ContextWalletService';
export { PermissionService } from './access/PermissionService';
export { AggregationService } from './aggregation/AggregationService';
export type {
  MainWallet,
  ContextWallet,
  ConsentRequest,
  AccessGrant,
  CreateMainWalletOptions,
  CreateContextWalletOptions,
  DeriveContextIdOptions,
  RotateKeysOptions,
  RotateKeysResult,
  PermissionScope,
  RequestConsentOptions,
  GrantPermissionsOptions,
  RevokePermissionsOptions,
  AggregatedQueryOptions,
  PermissionScopes
} from './types/wallet';

// Legacy version for compatibility
export const VERSION = '1.0.0';