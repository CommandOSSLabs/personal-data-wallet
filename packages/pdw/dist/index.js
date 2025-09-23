"use strict";
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
exports.VERSION = exports.PDWUtils = exports.QuickStartConfigs = exports.PDW_NAME = exports.PDW_VERSION = exports.WalrusService = exports.VectorService = exports.EmbeddingService = exports.createPDW = exports.PDW = void 0;
exports.createPDWWithPreset = createPDWWithPreset;
exports.validateConfig = validateConfig;
// Main PDW class
var PDW_1 = require("./PDW");
Object.defineProperty(exports, "PDW", { enumerable: true, get: function () { return PDW_1.PDW; } });
Object.defineProperty(exports, "createPDW", { enumerable: true, get: function () { return PDW_1.createPDW; } });
// Core services
var EmbeddingService_1 = require("./services/EmbeddingService");
Object.defineProperty(exports, "EmbeddingService", { enumerable: true, get: function () { return EmbeddingService_1.EmbeddingService; } });
var VectorService_1 = require("./services/VectorService");
Object.defineProperty(exports, "VectorService", { enumerable: true, get: function () { return VectorService_1.VectorService; } });
var WalrusService_1 = require("./services/WalrusService");
Object.defineProperty(exports, "WalrusService", { enumerable: true, get: function () { return WalrusService_1.WalrusService; } });
// Export generated Move contract bindings
__exportStar(require("./generated/memory/index.js"), exports);
__exportStar(require("./generated/utils/index.js"), exports);
const PDW_2 = require("./PDW");
/**
 * SDK Version Information
 */
exports.PDW_VERSION = '1.0.0';
exports.PDW_NAME = 'Personal Data Wallet - Vector Storage';
/**
 * Quick start configuration presets
 */
exports.QuickStartConfigs = {
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
            network: 'testnet',
            enableBatching: false
        }
    },
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
            network: 'testnet',
            enableBatching: true,
            batchSize: 20
        }
    },
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
            network: 'testnet',
            enableBatching: true,
            batchSize: 50
        }
    }
};
/**
 * Create PDW with predefined configuration
 */
function createPDWWithPreset(preset, apiKey, overrides = {}) {
    const baseConfig = exports.QuickStartConfigs[preset];
    const config = {
        ...baseConfig,
        embedding: {
            ...baseConfig.embedding,
            apiKey
        },
        ...overrides
    };
    return new PDW_2.PDW(config);
}
/**
 * Validate configuration
 */
function validateConfig(config) {
    const errors = [];
    const warnings = [];
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
exports.PDWUtils = {
    /**
     * Get SDK information
     */
    getInfo() {
        return {
            name: exports.PDW_NAME,
            version: exports.PDW_VERSION,
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
    validateApiKey(apiKey) {
        return typeof apiKey === 'string' && apiKey.length > 0;
    },
    /**
     * Calculate storage requirements
     */
    estimateStorage(textCount, avgTextLength = 1000) {
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
exports.default = {
    PDW: PDW_2.PDW,
    createPDW: PDW_2.createPDW,
    createPDWWithPreset,
    QuickStartConfigs: exports.QuickStartConfigs,
    validateConfig,
    PDWUtils: exports.PDWUtils,
    version: exports.PDW_VERSION
};
// Legacy compatibility
exports.VERSION = exports.PDW_VERSION;
//# sourceMappingURL=index.js.map