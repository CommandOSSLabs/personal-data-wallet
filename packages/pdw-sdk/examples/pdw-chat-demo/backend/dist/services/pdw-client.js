import { SuiClient } from '@mysten/sui/client';
import { PersonalDataWallet } from '@personal-data-wallet/sdk/dist/client/PersonalDataWallet.js';
let cachedClient = null;
let cachedConsentRepository;
export async function createPdwClient(config, options = {}) {
    if (cachedClient) {
        if (options.consentRepository && options.consentRepository !== cachedConsentRepository) {
            // Check if setConsentRepository method exists before calling
            if (typeof cachedClient.setConsentRepository === 'function') {
                cachedClient.setConsentRepository(options.consentRepository);
                cachedConsentRepository = options.consentRepository;
            }
        }
        return cachedClient;
    }
    const client = new SuiClient({ url: config.suiRpcUrl });
    const pdw = client.$extend(PersonalDataWallet.asClientExtension({
        packageId: config.pdwPackageId,
        accessRegistryId: config.pdwAccessRegistryId,
        apiUrl: config.pdwApiUrl,
        consentRepository: options.consentRepository,
    }));
    if (options.consentRepository) {
        pdw.setConsentRepository(options.consentRepository);
        cachedConsentRepository = options.consentRepository;
    }
    cachedClient = pdw;
    return pdw;
}
