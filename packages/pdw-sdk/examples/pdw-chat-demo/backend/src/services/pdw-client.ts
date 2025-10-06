import { SuiClient } from '@mysten/sui/client';
import { PersonalDataWallet } from 'personal-data-wallet-sdk/dist/client/PersonalDataWallet.js';
import type { ConsentRepository } from 'personal-data-wallet-sdk';
import type { AppConfig } from '../config/env.js';

export type PdwClient = InstanceType<typeof PersonalDataWallet>;

let cachedClient: PdwClient | null = null;
let cachedConsentRepository: ConsentRepository | undefined;

export async function createPdwClient(
  config: AppConfig,
  options: { consentRepository?: ConsentRepository } = {}
) {
  // Don't use cache if consent repository changes, since we pass it during initialization
  if (cachedClient && options.consentRepository === cachedConsentRepository) {
    return cachedClient;
  }

  try {
    const client = new SuiClient({ url: config.suiRpcUrl });
    const pdw = (client as any).$extend(
      PersonalDataWallet.asClientExtension({
        packageId: config.pdwPackageId,
        accessRegistryId: config.pdwAccessRegistryId,
        apiUrl: config.pdwApiUrl,
        consentRepository: options.consentRepository,
      })
    );

    // Cache the extended client (which contains the pdw property)
    cachedClient = pdw;
    cachedConsentRepository = options.consentRepository;

    return pdw;
  } catch (error) {
    console.error('Failed to create PDW client:', error);
    throw new Error(`PDW client creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
