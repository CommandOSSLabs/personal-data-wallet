/**
 * Configuration Utilities for Personal Data Wallet SDK
 *
 * Provides helpers for managing API keys, environment variables,
 * and configuration validation across the SDK.
 */
export interface SDKConfig {
    geminiApiKey?: string;
    embeddingModel?: string;
    suiNetwork?: 'testnet' | 'mainnet' | 'devnet' | 'localnet';
    suiPackageId?: string;
    suiAdminPrivateKey?: string;
    walrusNetwork?: 'testnet' | 'mainnet';
    walrusUploadRelay?: string;
    sealKeyServerUrl?: string;
    sealKeyServerObjectId?: string;
    sealSessionTTL?: number;
    sealEnableBatch?: boolean;
    sealBatchSize?: number;
    sealDecryptionTimeout?: number;
    sealVerifyServers?: boolean;
    sealEnableAudit?: boolean;
    enableEncryption?: boolean;
    enableBatching?: boolean;
    enableMonitoring?: boolean;
}
export interface EnvironmentConfig {
    GEMINI_API_KEY?: string;
    GOOGLE_AI_API_KEY?: string;
    SUI_NETWORK?: string;
    SUI_PACKAGE_ID?: string;
    SUI_ADMIN_PRIVATE_KEY?: string;
    WALRUS_NETWORK?: string;
    WALRUS_UPLOAD_RELAY?: string;
    SEAL_KEY_SERVER_URL?: string;
    SEAL_KEY_SERVER_OBJECT_ID?: string;
    SEAL_SESSION_TTL?: string;
    SEAL_ENABLE_BATCH?: string;
    SEAL_BATCH_SIZE?: string;
    SEAL_DECRYPTION_TIMEOUT?: string;
    SEAL_VERIFY_SERVERS?: string;
    SEAL_ENABLE_AUDIT?: string;
    PDW_ENABLE_ENCRYPTION?: string;
    PDW_ENABLE_BATCHING?: string;
    PDW_ENABLE_MONITORING?: string;
}
/**
 * Configuration helper with environment variable support
 */
export declare class ConfigurationHelper {
    /**
     * Get Gemini API key from various sources
     */
    static getGeminiApiKey(providedKey?: string): string;
    /**
     * Get Sui configuration from environment
     */
    static getSuiConfig(): {
        network: 'testnet' | 'mainnet' | 'devnet' | 'localnet';
        packageId?: string;
        adminPrivateKey?: string;
    };
    /**
     * Get Walrus configuration from environment
     */
    static getWalrusConfig(): {
        network: 'testnet' | 'mainnet';
        uploadRelay?: string;
    };
    /**
     * Get SEAL key server configuration from environment
     */
    static getSealConfig(): {
        keyServerUrl?: string;
        keyServerObjectId?: string;
        sessionTTL: number;
        enableBatch: boolean;
        batchSize: number;
        decryptionTimeout: number;
        verifyServers: boolean;
        enableAudit: boolean;
    };
    /**
     * Load configuration from environment variables
     */
    static loadFromEnvironment(): SDKConfig;
    /**
     * Validate that required configuration is present
     */
    static validateConfig(config: Partial<SDKConfig>): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
    /**
     * Create a complete configuration with smart defaults
     */
    static createConfig(overrides?: Partial<SDKConfig>): SDKConfig;
    /**
     * Print current configuration (masking sensitive data)
     */
    static printConfig(config: SDKConfig): void;
    /**
     * Generate example .env file content
     */
    static generateEnvTemplate(): string;
    private static parseBooleanEnv;
    private static maskApiKey;
    private static maskPrivateKey;
}
/**
 * Quick configuration helpers
 */
export declare const Config: {
    /**
     * Create configuration from environment variables
     */
    fromEnv: () => SDKConfig;
    /**
     * Create configuration with validation
     */
    create: (overrides?: Partial<SDKConfig>) => SDKConfig;
    /**
     * Validate existing configuration
     */
    validate: (config: Partial<SDKConfig>) => {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
    /**
     * Get Gemini API key with helpful error messages
     */
    getGeminiKey: (key?: string) => string;
    /**
     * Generate .env template
     */
    generateEnvTemplate: () => string;
};
export default ConfigurationHelper;
//# sourceMappingURL=ConfigurationHelper.d.ts.map