/**
 * Personal Data Wallet Client Factory
 *
 * Provides convenience functions for creating PDW-enabled Sui clients
 * following MystenLabs best practices for client extensions.
 */
import { SuiClient } from '@mysten/sui/client';
import type { PDWConfig } from '../types';
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
export declare function createPDWClient(suiClientConfig: ConstructorParameters<typeof SuiClient>[0], pdwConfig?: Partial<PDWConfig>): import("@mysten/sui/experimental").ClientWithExtensions<{
    pdw: PersonalDataWallet;
}, SuiClient>;
/**
 * Extend an existing SuiClient with Personal Data Wallet functionality
 *
 * @param client - Existing SuiClient instance
 * @param pdwConfig - PDW-specific configuration
 * @returns Extended client with PDW capabilities
 */
export declare function extendWithPDW(client: SuiClient, pdwConfig?: Partial<PDWConfig>): import("@mysten/sui/experimental").ClientWithExtensions<{
    pdw: PersonalDataWallet;
}, SuiClient>;
/**
 * Create a PDW client with common development settings
 *
 * @param overrides - Any configuration overrides
 * @returns Development-ready PDW client
 */
export declare function createDevPDWClient(overrides?: {
    suiUrl?: string;
    apiUrl?: string;
    packageId?: string;
}): import("@mysten/sui/experimental").ClientWithExtensions<{
    pdw: PersonalDataWallet;
}, SuiClient>;
/**
 * Create a PDW client configured for testnet
 *
 * @param overrides - Any configuration overrides
 * @returns Testnet-ready PDW client
 */
export declare function createTestnetPDWClient(overrides?: Partial<PDWConfig>): import("@mysten/sui/experimental").ClientWithExtensions<{
    pdw: PersonalDataWallet;
}, SuiClient>;
//# sourceMappingURL=factory.d.ts.map