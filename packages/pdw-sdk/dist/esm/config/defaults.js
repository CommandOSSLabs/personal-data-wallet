/**
 * Default PDW Configuration
 *
 * Provides sensible defaults for different environments
 */
export function createDefaultConfig() {
    return {
        packageId: '0x0', // Will be updated with actual deployed package ID
        apiUrl: 'http://localhost:3000/api',
        encryptionConfig: {
            enabled: true,
            keyServers: [], // To be configured based on environment
            policyConfig: {
                threshold: 2, // 2-of-3 threshold by default
            },
        },
        storageConfig: {
            cacheEnabled: true,
            encryptionEnabled: true,
        },
        // Walrus Storage Configuration
        walrusPublisherUrl: 'https://publisher.walrus-testnet.walrus.space',
        walrusAggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
        walrusMaxFileSize: 1024 * 1024 * 1024, // 1GB
        walrusTimeout: 30000, // 30 seconds
    };
}
export function createProductionConfig(overrides = {}) {
    return {
        ...createDefaultConfig(),
        apiUrl: 'https://api.personaldatawallet.com',
        encryptionConfig: {
            enabled: true,
            keyServers: [
                // Production SEAL key servers - to be configured
                '0x0' // Placeholder
            ],
            policyConfig: {
                threshold: 2,
            },
        },
        // Production Walrus endpoints
        walrusPublisherUrl: 'https://publisher.walrus.space',
        walrusAggregatorUrl: 'https://aggregator.walrus.space',
        ...overrides,
    };
}
export function createTestnetConfig(overrides = {}) {
    return {
        ...createDefaultConfig(),
        apiUrl: 'https://testnet-api.personaldatawallet.com',
        encryptionConfig: {
            enabled: true,
            keyServers: [
                // Testnet SEAL key servers
                '0x0' // Placeholder - will be updated with actual testnet servers
            ],
            policyConfig: {
                threshold: 2,
            },
        },
        // Testnet Walrus endpoints (same as default for now)
        walrusPublisherUrl: 'https://publisher.walrus-testnet.walrus.space',
        walrusAggregatorUrl: 'https://aggregator.walrus-testnet.walrus.space',
        ...overrides,
    };
}
//# sourceMappingURL=defaults.js.map