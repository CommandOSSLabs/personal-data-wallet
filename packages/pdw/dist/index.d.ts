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
export { PDW, createPDW } from './PDW';
export { EmbeddingService } from './services/EmbeddingService';
export { VectorService } from './services/VectorService';
export { WalrusService } from './services/WalrusService';
export type * from './types';
export * from './generated/memory/index.js';
export * from './generated/utils/index.js';
import type { VectorStorageConfig } from './types';
import { PDW, createPDW } from './PDW';
/**
 * SDK Version Information
 */
export declare const PDW_VERSION = "1.0.0";
export declare const PDW_NAME = "Personal Data Wallet - Vector Storage";
/**
 * Quick start configuration presets
 */
export declare const QuickStartConfigs: {
    /**
     * Basic configuration for development and testing
     */
    BASIC: VectorStorageConfig;
    /**
     * Production configuration optimized for performance
     */
    PRODUCTION: VectorStorageConfig;
    /**
     * High-capacity configuration for large datasets
     */
    HIGH_CAPACITY: VectorStorageConfig;
};
/**
 * Create PDW with predefined configuration
 */
export declare function createPDWWithPreset(preset: keyof typeof QuickStartConfigs, apiKey: string, overrides?: Partial<VectorStorageConfig>): PDW;
/**
 * Validate configuration
 */
export declare function validateConfig(config: VectorStorageConfig): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * SDK utilities
 */
export declare const PDWUtils: {
    /**
     * Get SDK information
     */
    getInfo(): {
        name: string;
        version: string;
        features: string[];
    };
    /**
     * Validate API key format
     */
    validateApiKey(apiKey: string): boolean;
    /**
     * Calculate storage requirements
     */
    estimateStorage(textCount: number, avgTextLength?: number): {
        totalBytes: number;
        totalMB: number;
        perTextBytes: number;
        breakdown: {
            embeddings: number;
            metadata: number;
            indexOverhead: number;
        };
    };
};
declare const _default: {
    PDW: typeof PDW;
    createPDW: typeof createPDW;
    createPDWWithPreset: typeof createPDWWithPreset;
    QuickStartConfigs: {
        /**
         * Basic configuration for development and testing
         */
        BASIC: VectorStorageConfig;
        /**
         * Production configuration optimized for performance
         */
        PRODUCTION: VectorStorageConfig;
        /**
         * High-capacity configuration for large datasets
         */
        HIGH_CAPACITY: VectorStorageConfig;
    };
    validateConfig: typeof validateConfig;
    PDWUtils: {
        /**
         * Get SDK information
         */
        getInfo(): {
            name: string;
            version: string;
            features: string[];
        };
        /**
         * Validate API key format
         */
        validateApiKey(apiKey: string): boolean;
        /**
         * Calculate storage requirements
         */
        estimateStorage(textCount: number, avgTextLength?: number): {
            totalBytes: number;
            totalMB: number;
            perTextBytes: number;
            breakdown: {
                embeddings: number;
                metadata: number;
                indexOverhead: number;
            };
        };
    };
    version: string;
};
export default _default;
export declare const VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map