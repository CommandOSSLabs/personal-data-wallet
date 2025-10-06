import { resolve } from 'node:path';
import type { ConsentRepository } from 'personal-data-wallet-sdk';
import { FileSystemConsentRepository } from 'personal-data-wallet-sdk';

import type { AppConfig } from '../config/env.js';

let cachedRepository: ConsentRepository | undefined;
let cachedPath: string | undefined;

export function getConsentRepository(config: AppConfig): ConsentRepository | undefined {
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
