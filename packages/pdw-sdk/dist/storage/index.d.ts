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
export { WalrusStorageService, StorageManager } from '../infrastructure/walrus';
export { StorageService } from '../services/StorageService';
export type { WalrusConfig, MemoryMetadata, WalrusUploadResult, WalrusRetrievalResult, BlobInfo, WalrusStats } from '../infrastructure/walrus/WalrusStorageService';
export type { StorageManagerConfig, StorageResult, RetrievalOptions, StorageBatchOperation, StorageBatchResult, StorageStats } from '../infrastructure/walrus/StorageManager';
export type { StorageServiceConfig, BlobUploadOptions, FileUploadOptions } from '../services/StorageService';
//# sourceMappingURL=index.d.ts.map