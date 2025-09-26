/**
 * Storage Module
 *
 * PRODUCTION: Uses services/StorageService.ts with writeBlobFlow pattern
 * LEGACY: Old storage services remain for compatibility during transition
 */
export { StorageService as LegacyStorageService } from './StorageService';
export { WalrusStorageService } from './WalrusStorageService';
export { StorageManager } from './StorageManager';
export { StorageService } from '../services/StorageService';
export type { WalrusConfig, MemoryMetadata, WalrusUploadResult, WalrusRetrievalResult, BlobInfo, WalrusStats } from './WalrusStorageService';
export type { StorageManagerConfig, StorageResult, RetrievalOptions, StorageBatchOperation, StorageBatchResult, StorageStats } from './StorageManager';
export type { StorageServiceConfig, BlobUploadOptions, FileUploadOptions } from '../services/StorageService';
//# sourceMappingURL=index.d.ts.map