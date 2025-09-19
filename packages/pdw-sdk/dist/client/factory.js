"use strict";
/**
 * Personal Data Wallet Client Factory
 *
 * Provides convenience functions for creating PDW-enabled Sui clients
 * following MystenLabs best practices for client extensions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPDWClient = createPDWClient;
exports.extendWithPDW = extendWithPDW;
exports.createDevPDWClient = createDevPDWClient;
exports.createTestnetPDWClient = createTestnetPDWClient;
const client_1 = require("@mysten/sui/client");
const defaults_1 = require("../config/defaults");
const validation_1 = require("../config/validation");
const PersonalDataWallet_1 = require("./PersonalDataWallet");
/**
 * Create a new SuiClient extended with Personal Data Wallet functionality
 *
 * @param suiClientConfig - Standard SuiClient configuration
 * @param pdwConfig - PDW-specific configuration
 * @returns Extended SuiClient with PDW capabilities
 *
 * @example
 * ```typescript
 * const client = createPDWClient(
 *   { url: 'https://fullnode.devnet.sui.io' },
 *   {
 *     apiUrl: 'https://api.pdw.example.com',
 *     packageId: '0x123...'
 *   }
 * );
 *
 * // Now use PDW functionality
 * const memory = await client.pdw.createMemory({
 *   content: 'My first memory',
 *   category: 'personal',
 *   userAddress: '0x789...'
 * });
 * ```
 */
function createPDWClient(suiClientConfig, pdwConfig) {
    const suiClient = new client_1.SuiClient(suiClientConfig);
    const fullConfig = (0, validation_1.validateConfig)((0, validation_1.mergeConfigs)((0, defaults_1.createDefaultConfig)(), pdwConfig || {}));
    return suiClient.$extend(PersonalDataWallet_1.PersonalDataWallet.asClientExtension(pdwConfig));
}
/**
 * Extend an existing SuiClient with Personal Data Wallet functionality
 *
 * @param client - Existing SuiClient instance
 * @param pdwConfig - PDW-specific configuration
 * @returns Extended client with PDW capabilities
 */
function extendWithPDW(client, pdwConfig) {
    return client.$extend(PersonalDataWallet_1.PersonalDataWallet.asClientExtension(pdwConfig));
}
/**
 * Create a PDW client with common development settings
 *
 * @param overrides - Any configuration overrides
 * @returns Development-ready PDW client
 */
function createDevPDWClient(overrides) {
    return createPDWClient({
        url: overrides?.suiUrl || 'https://fullnode.devnet.sui.io',
    }, {
        apiUrl: overrides?.apiUrl || 'http://localhost:3000/api',
        packageId: overrides?.packageId || '0x0',
        encryptionConfig: {
            enabled: true,
            keyServers: ['0x0'], // Placeholder for development
            policyConfig: {
                threshold: 2,
            },
        },
        storageConfig: {
            provider: 'walrus',
            cacheEnabled: true,
            encryptionEnabled: true,
        },
    });
}
/**
 * Create a PDW client configured for testnet
 *
 * @param overrides - Any configuration overrides
 * @returns Testnet-ready PDW client
 */
function createTestnetPDWClient(overrides) {
    const testnetConfig = (0, defaults_1.createTestnetConfig)(overrides);
    return createPDWClient({ url: 'https://fullnode.testnet.sui.io' }, testnetConfig);
}
//# sourceMappingURL=factory.js.map