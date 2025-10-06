import { resolve } from 'node:path';
import { FileSystemConsentRepository } from 'personal-data-wallet-sdk';
let cachedRepository;
let cachedPath;
export function getConsentRepository(config) {
    if (!config.pdwConsentStoragePath) {
        return undefined;
    }
    const normalizedPath = resolve(config.pdwConsentStoragePath);
    if (!cachedRepository || cachedPath !== normalizedPath) {
        cachedRepository = new FileSystemConsentRepository({ filePath: normalizedPath });
        cachedPath = normalizedPath;
    }
    return cachedRepository;
}
