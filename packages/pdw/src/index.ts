/**
 * PDW - Personal Data Wallet for Vector Embedding Storage
 * 
 * A streamlined SDK for storing AI-generated vector embeddings on Walrus decentralized storage
 * 
 * Features:
 * - 🧠 AI embedding generation using Google Gemini
 * - 🔍 HNSW vector similarity search
 * - 🌊 Walrus decentralized storage
 * - ⚡ Batch processing for efficiency
 * - 📊 Comprehensive analytics
 * 
 * @version 1.0.0
 * @author Personal Data Wallet Team
 */

// Main PDW class
export { PDW, createPDW } from './PDW';

// Core services
export { EmbeddingService } from './services/EmbeddingService';
export { VectorService } from './services/VectorService';
export { WalrusService } from './services/WalrusService';

// Type exports
export type * from './types';

// Export generated Move contract bindings
export * from './generated/memory/index.js';
export * from './generated/utils/index.js';

// Import types for internal use
import type { PDWConfig, VectorStorageConfig } from './types';
import { PDW, createPDW } from './PDW';

/**
 * SDK Version Information
 */
export const PDW_VERSION = '1.0.0';
export const PDW_NAME = 'Personal Data Wallet - Vector Storage';

/**
 * Quick start configuration presets
 */
export const QuickStartConfigs = {
  /**
   * Basic configuration for development and testing
   */
  BASIC: {
    embedding: {
      apiKey: '', // Must be provided by user
      model: 'text-embedding-004',
      batchSize: 10
    },
    vector: {
      dimensions: 768,
      maxElements: 1000,
      efConstruction: 200,
      m: 16
    },
    walrus: {
      network: 'testnet' as const,
      enableBatching: false
    }
  } as VectorStorageConfig,

  /**
   * Production configuration optimized for performance
   */
  PRODUCTION: {
    embedding: {
      apiKey: '', // Must be provided by user
      model: 'text-embedding-004',
      batchSize: 50
    },
    vector: {
      dimensions: 768,
      maxElements: 50000,
      efConstruction: 400,
      m: 32
    },
    walrus: {
      network: 'testnet' as const,
      enableBatching: true,
      batchSize: 20
    }
  } as VectorStorageConfig,

  /**
   * High-capacity configuration for large datasets
   */
  HIGH_CAPACITY: {
    embedding: {
      apiKey: '', // Must be provided by user
      model: 'text-embedding-004',
      batchSize: 100
    },
    vector: {
      dimensions: 768,
      maxElements: 100000,
      efConstruction: 600,
      m: 48
    },
    walrus: {
      network: 'testnet' as const,
      enableBatching: true,
      batchSize: 50
    }
  } as VectorStorageConfig
};

/**
 * Create PDW with predefined configuration
 */
export function createPDWWithPreset(
  preset: keyof typeof QuickStartConfigs,
  apiKey: string,
  overrides: Partial<VectorStorageConfig> = {}
): PDW {
  const baseConfig = QuickStartConfigs[preset];
  const config: VectorStorageConfig = {
    ...baseConfig,
    embedding: {
      ...baseConfig.embedding,
      apiKey
    },
    ...overrides
  };
  
  return new PDW(config);
}

/**
 * Validate configuration
 */
export function validateConfig(config: VectorStorageConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required API key
  if (!config.embedding.apiKey) {
    errors.push('Embedding API key is required');
  }

  // Check vector dimensions
  if (config.vector?.dimensions && config.vector.dimensions !== 768) {
    warnings.push('Non-standard vector dimensions may affect compatibility');
  }

  // Check max elements
  if (config.vector?.maxElements && config.vector.maxElements > 100000) {
    warnings.push('Large max elements may impact memory usage');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * SDK utilities
 */
export const PDWUtils = {
  /**
   * Get SDK information
   */
  getInfo() {
    return {
      name: PDW_NAME,
      version: PDW_VERSION,
      features: [
        'AI Embedding Generation (Gemini)',
        'HNSW Vector Similarity Search',
        'Walrus Decentralized Storage',
        'Batch Processing',
        'Local Fallback Storage'
      ]
    };
  },

  /**
   * Validate API key format
   */
  validateApiKey(apiKey: string): boolean {
    return typeof apiKey === 'string' && apiKey.length > 0;
  },

  /**
   * Calculate storage requirements
   */
  estimateStorage(textCount: number, avgTextLength: number = 1000) {
    const embeddingSize = 768 * 4; // 768 dimensions * 4 bytes per float
    const metadataSize = avgTextLength + 200; // Text + metadata overhead
    const indexOverhead = embeddingSize * 0.3; // HNSW index overhead
    
    const totalPerText = embeddingSize + metadataSize + indexOverhead;
    const totalBytes = totalPerText * textCount;
    
    return {
      totalBytes,
      totalMB: Math.round(totalBytes / (1024 * 1024) * 100) / 100,
      perTextBytes: Math.round(totalPerText),
      breakdown: {
        embeddings: embeddingSize * textCount,
        metadata: metadataSize * textCount,
        indexOverhead: indexOverhead * textCount
      }
    };
  }
};

// Default export for convenience
export default {
  PDW,
  createPDW,
  createPDWWithPreset,
  QuickStartConfigs,
  validateConfig,
  PDWUtils,
  version: PDW_VERSION
};

// Legacy compatibility
export const VERSION = PDW_VERSION;