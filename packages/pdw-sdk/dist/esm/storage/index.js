/**
 * Storage Module - DEPRECATED
 *
 * @deprecated Import from '@personal-data-wallet/sdk/infrastructure/walrus' instead
 * This file now re-exports from the infrastructure module for backward compatibility.
 *
 * Migration guide:
 * - Old: import { WalrusStorageService } from '@personal-data-wallet/sdk/storage'
 * - New: import { WalrusStorageService } from '@personal-data-wallet/sdk/infrastructure/walrus'
 */
// Re-export from infrastructure for backward compatibility
export { WalrusStorageService, StorageManager } from '../infrastructure/walrus';
// Keep StorageService export from services (not moved to infrastructure)
export { StorageService } from '../services/StorageService';
//# sourceMappingURL=index.js.map