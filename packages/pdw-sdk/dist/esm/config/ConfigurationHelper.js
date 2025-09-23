/**
 * Configuration Utilities for Personal Data Wallet SDK
 *
 * Provides helpers for managing API keys, environment variables,
 * and configuration validation across the SDK.
 */
/**
 * Configuration helper with environment variable support
 */
export class ConfigurationHelper {
    /**
     * Get Gemini API key from various sources
     */
    static getGeminiApiKey(providedKey) {
        const apiKey = providedKey ||
            process.env.GEMINI_API_KEY ||
            process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            throw new Error('🔑 Gemini API key is required. Set it via:\n\n' +
                '1. Direct configuration:\n' +
                '   const pipeline = createQuickStartPipeline("BASIC", {\n' +
                '     embedding: { apiKey: "your-api-key" }\n' +
                '   });\n\n' +
                '2. Environment variable:\n' +
                '   export GEMINI_API_KEY="your-api-key"\n' +
                '   # or\n' +
                '   export GOOGLE_AI_API_KEY="your-api-key"\n\n' +
                '3. .env file:\n' +
                '   GEMINI_API_KEY=your-api-key\n\n' +
                '📝 Get your free API key from: https://makersuite.google.com/app/apikey');
        }
        return apiKey;
    }
    /**
     * Get Sui configuration from environment
     */
    static getSuiConfig() {
        const network = process.env.SUI_NETWORK || 'testnet';
        return {
            network,
            packageId: process.env.SUI_PACKAGE_ID,
            adminPrivateKey: process.env.SUI_ADMIN_PRIVATE_KEY
        };
    }
    /**
     * Get Walrus configuration from environment
     */
    static getWalrusConfig() {
        const network = process.env.WALRUS_NETWORK || 'testnet';
        return {
            network,
            uploadRelay: process.env.WALRUS_UPLOAD_RELAY
        };
    }
    /**
     * Get SEAL key server configuration from environment
     */
    static getSealConfig() {
        return {
            keyServerUrl: process.env.SEAL_KEY_SERVER_URL,
            keyServerObjectId: process.env.SEAL_KEY_SERVER_OBJECT_ID,
            sessionTTL: process.env.SEAL_SESSION_TTL ? parseInt(process.env.SEAL_SESSION_TTL) : 60,
            enableBatch: process.env.SEAL_ENABLE_BATCH === 'true',
            batchSize: process.env.SEAL_BATCH_SIZE ? parseInt(process.env.SEAL_BATCH_SIZE) : 10,
            decryptionTimeout: process.env.SEAL_DECRYPTION_TIMEOUT ? parseInt(process.env.SEAL_DECRYPTION_TIMEOUT) : 30000,
            verifyServers: process.env.SEAL_VERIFY_SERVERS !== 'false', // Default true
            enableAudit: process.env.SEAL_ENABLE_AUDIT === 'true'
        };
    }
    /**
     * Load configuration from environment variables
     */
    static loadFromEnvironment() {
        return {
            // AI Configuration
            geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY,
            embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-004',
            // Blockchain Configuration
            suiNetwork: process.env.SUI_NETWORK || 'testnet',
            suiPackageId: process.env.SUI_PACKAGE_ID,
            suiAdminPrivateKey: process.env.SUI_ADMIN_PRIVATE_KEY,
            // Storage Configuration
            walrusNetwork: process.env.WALRUS_NETWORK || 'testnet',
            walrusUploadRelay: process.env.WALRUS_UPLOAD_RELAY,
            // Feature Flags
            enableEncryption: this.parseBooleanEnv('PDW_ENABLE_ENCRYPTION', true),
            enableBatching: this.parseBooleanEnv('PDW_ENABLE_BATCHING', true),
            enableMonitoring: this.parseBooleanEnv('PDW_ENABLE_MONITORING', true)
        };
    }
    /**
     * Validate that required configuration is present
     */
    static validateConfig(config) {
        const errors = [];
        const warnings = [];
        // Check for Gemini API key
        try {
            this.getGeminiApiKey(config.geminiApiKey);
        }
        catch (error) {
            errors.push('Missing Gemini API key for AI embedding generation');
        }
        // Validate Sui configuration
        if (config.suiPackageId && !config.suiPackageId.startsWith('0x')) {
            errors.push('Invalid Sui package ID format (should start with 0x)');
        }
        if (config.suiAdminPrivateKey && config.suiAdminPrivateKey.length < 32) {
            warnings.push('Sui admin private key seems too short');
        }
        // Network consistency check
        if (config.suiNetwork !== config.walrusNetwork) {
            warnings.push('Sui and Walrus networks should typically match');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Create a complete configuration with smart defaults
     */
    static createConfig(overrides = {}) {
        const envConfig = this.loadFromEnvironment();
        const merged = { ...envConfig, ...overrides };
        // Validate the final configuration
        const validation = this.validateConfig(merged);
        if (!validation.isValid) {
            throw new Error(`Configuration validation failed:\n${validation.errors.join('\n')}`);
        }
        if (validation.warnings.length > 0) {
            console.warn('⚠️ Configuration warnings:', validation.warnings);
        }
        return merged;
    }
    /**
     * Print current configuration (masking sensitive data)
     */
    static printConfig(config) {
        const masked = {
            ...config,
            geminiApiKey: config.geminiApiKey ? this.maskApiKey(config.geminiApiKey) : undefined,
            suiAdminPrivateKey: config.suiAdminPrivateKey ? this.maskPrivateKey(config.suiAdminPrivateKey) : undefined
        };
        console.log('📋 PDW SDK Configuration:');
        console.table(masked);
    }
    /**
     * Generate example .env file content
     */
    static generateEnvTemplate() {
        return `# Personal Data Wallet SDK Configuration
# Copy this to your .env file and fill in your values

# 🧠 AI/Embedding Configuration (Required)
GEMINI_API_KEY=your_gemini_api_key_here
# Get your key from: https://makersuite.google.com/app/apikey

# ⛓️ Sui Blockchain Configuration (Optional)
SUI_NETWORK=testnet
SUI_PACKAGE_ID=your_deployed_package_id_here
SUI_ADMIN_PRIVATE_KEY=your_sui_private_key_here

# 🗄️ Walrus Storage Configuration (Optional)
WALRUS_NETWORK=testnet
WALRUS_UPLOAD_RELAY=https://upload-relay.testnet.walrus.space

# 🔐 SEAL Encryption Configuration (Optional)
# Uses official Mysten Labs testnet servers by default
# Configure custom key server if needed:
SEAL_KEY_SERVER_URL=your_custom_key_server_url
SEAL_KEY_SERVER_OBJECT_ID=your_custom_key_server_object_id
SEAL_SESSION_TTL=60
SEAL_ENABLE_BATCH=true
SEAL_BATCH_SIZE=10
SEAL_DECRYPTION_TIMEOUT=30000
SEAL_VERIFY_SERVERS=true
SEAL_ENABLE_AUDIT=false

# 🎛️ Feature Flags (Optional)
PDW_ENABLE_ENCRYPTION=true
PDW_ENABLE_BATCHING=true
PDW_ENABLE_MONITORING=true

# 🔧 Advanced Settings (Optional)
EMBEDDING_MODEL=text-embedding-004
`;
    }
    // Private helper methods
    static parseBooleanEnv(key, defaultValue) {
        const value = process.env[key];
        if (value === undefined)
            return defaultValue;
        return value.toLowerCase() === 'true' || value === '1';
    }
    static maskApiKey(apiKey) {
        if (apiKey.length <= 8)
            return '*'.repeat(apiKey.length);
        return apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
    }
    static maskPrivateKey(privateKey) {
        if (privateKey.length <= 16)
            return '*'.repeat(privateKey.length);
        return privateKey.substring(0, 6) + '*'.repeat(privateKey.length - 12) + privateKey.substring(privateKey.length - 6);
    }
}
/**
 * Quick configuration helpers
 */
export const Config = {
    /**
     * Create configuration from environment variables
     */
    fromEnv: () => ConfigurationHelper.loadFromEnvironment(),
    /**
     * Create configuration with validation
     */
    create: (overrides) => ConfigurationHelper.createConfig(overrides),
    /**
     * Validate existing configuration
     */
    validate: (config) => ConfigurationHelper.validateConfig(config),
    /**
     * Get Gemini API key with helpful error messages
     */
    getGeminiKey: (key) => ConfigurationHelper.getGeminiApiKey(key),
    /**
     * Generate .env template
     */
    generateEnvTemplate: () => ConfigurationHelper.generateEnvTemplate()
};
export default ConfigurationHelper;
//# sourceMappingURL=ConfigurationHelper.js.map