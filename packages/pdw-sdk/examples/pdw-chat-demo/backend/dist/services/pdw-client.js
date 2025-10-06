import { SuiClient } from '@mysten/sui/client';
import { PersonalDataWallet } from 'personal-data-wallet-sdk/dist/client/PersonalDataWallet.js';
let cachedClient = null;
let cachedConsentRepository;
export async function createPdwClient(config, options = {}) {
    // Don't use cache if consent repository changes, since we pass it during initialization
    if (cachedClient && options.consentRepository === cachedConsentRepository) {
        return cachedClient;
    }
    try {
        const client = new SuiClient({ url: config.suiRpcUrl });
        const pdw = client.$extend(PersonalDataWallet.asClientExtension({
            packageId: config.pdwPackageId,
            accessRegistryId: config.pdwAccessRegistryId,
            apiUrl: config.pdwApiUrl,
            consentRepository: options.consentRepository,
        }));
        // Cache the extended client (which contains the pdw property)
        cachedClient = pdw;
        cachedConsentRepository = options.consentRepository;
        return pdw;
    }
    catch (error) {
        console.error('Failed to create PDW client:', error);
        throw new Error(`PDW client creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
