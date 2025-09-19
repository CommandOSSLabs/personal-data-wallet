/**
 * Personal Data Wallet Client Factory
 *
 * Provides convenience functions for creating PDW-enabled Sui clients
 * following MystenLabs best practices for client extensions.
 */
import { SuiClient } from '@mysten/sui/client';
import { createDefaultConfig, createTestnetConfig } from '../config/defaults';
import { validateConfig, mergeConfigs } from '../config/validation';
import { PersonalDataWallet } from './PersonalDataWallet';
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
export function createPDWClient(suiClientConfig, pdwConfig) {
    const suiClient = new SuiClient(suiClientConfig);
    const fullConfig = validateConfig(mergeConfigs(createDefaultConfig(), pdwConfig || {}));
    return suiClient.$extend(PersonalDataWallet.asClientExtension(pdwConfig));
}
/**
 * Extend an existing SuiClient with Personal Data Wallet functionality
 *
 * @param client - Existing SuiClient instance
 * @param pdwConfig - PDW-specific configuration
 * @returns Extended client with PDW capabilities
 */
export function extendWithPDW(client, pdwConfig) {
    return client.$extend(PersonalDataWallet.asClientExtension(pdwConfig));
}
/**
 * Create a PDW client with common development settings
 *
 * @param overrides - Any configuration overrides
 * @returns Development-ready PDW client
 */
export function createDevPDWClient(overrides) {
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
export function createTestnetPDWClient(overrides) {
    const testnetConfig = createTestnetConfig(overrides);
    return createPDWClient({ url: 'https://fullnode.testnet.sui.io' }, testnetConfig);
}
//# sourceMappingURL=factory.js.map