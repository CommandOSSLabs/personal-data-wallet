/**
 * Configuration Validation
 *
 * Validates PDW configuration and provides helpful error messages
 */
export class ConfigurationError extends Error {
    constructor(message) {
        super(`PDW Configuration Error: ${message}`);
        this.name = 'ConfigurationError';
    }
}
export function validateConfig(config) {
    const errors = [];
    // Validate required fields
    if (!config.apiUrl) {
        errors.push('apiUrl is required');
    }
    if (!config.packageId || config.packageId === '0x0') {
        console.warn('PDW SDK: packageId not configured. Please set a valid deployed package ID.');
    }
    // Validate API URL format
    if (config.apiUrl && !isValidUrl(config.apiUrl)) {
        errors.push('apiUrl must be a valid HTTP or HTTPS URL');
    }
    // Validate encryption config
    if (config.encryptionConfig?.enabled &&
        (!config.encryptionConfig.keyServers || config.encryptionConfig.keyServers.length === 0)) {
        console.warn('PDW SDK: Encryption is enabled but no key servers configured. Some features may not work.');
    }
    // Validate threshold configuration
    if (config.encryptionConfig?.policyConfig?.threshold) {
        const threshold = config.encryptionConfig.policyConfig.threshold;
        if (threshold < 1) {
            errors.push('Encryption threshold must be at least 1');
        }
    }
    // Validate storage config
    if (config.storageConfig?.provider && !['walrus', 'local'].includes(config.storageConfig.provider)) {
        errors.push('Storage provider must be either "walrus" or "local"');
    }
    if (errors.length > 0) {
        throw new ConfigurationError(errors.join('; '));
    }
    return config;
}
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    }
    catch {
        return false;
    }
}
export function mergeConfigs(base, overrides) {
    return {
        ...base,
        ...overrides,
        encryptionConfig: {
            enabled: true,
            ...base.encryptionConfig,
            ...overrides.encryptionConfig,
            policyConfig: {
                ...base.encryptionConfig?.policyConfig,
                ...overrides.encryptionConfig?.policyConfig,
            },
        },
        storageConfig: {
            provider: 'walrus',
            cacheEnabled: true,
            encryptionEnabled: true,
            ...base.storageConfig,
            ...overrides.storageConfig,
        },
    };
}
//# sourceMappingURL=validation.js.map