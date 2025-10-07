/**
 * Storage Module - DEPRECATED
 *
 * ⚠️ DEPRECATION NOTICE:
 * This directory is being phased out. Use services/StorageService instead.
 *
 * Migration Guide:
 * - WalrusStorageService → services/StorageService
 * - StorageManager → services/StorageService
 * - StorageService (legacy) → services/StorageService
 *
 * These exports are maintained for backward compatibility during Phase 1A refactoring.
 */
export { StorageService } from '../services/StorageService';
/** @deprecated Use services/StorageService instead. Will be removed in Phase 1B. */
export { WalrusStorageService } from './WalrusStorageService';
/** @deprecated Use services/StorageService instead. Will be removed in Phase 1B. */
export { StorageManager } from './StorageManager';
export type { WalrusConfig, MemoryMetadata, WalrusUploadResult, WalrusRetrievalResult, BlobInfo, WalrusStats } from './WalrusStorageService';
export type { StorageManagerConfig, StorageResult, RetrievalOptions, StorageBatchOperation, StorageBatchResult, StorageStats } from './StorageManager';
export type { StorageServiceConfig, BlobUploadOptions, FileUploadOptions } from '../services/StorageService';
//# sourceMappingURL=index.d.ts.map