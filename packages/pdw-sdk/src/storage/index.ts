/**
 * Storage Module
 * 
 * Comprehensive decentralized storage operations with Walrus integration,
 * intelligent batching, encryption support, and fallback mechanisms.
 */

export { WalrusService } from './WalrusService';
export { StorageManager } from './StorageManager';

export type {
  WalrusConfig,
  MemoryMetadata,
  WalrusUploadResult,
  WalrusRetrievalResult,
  BlobInfo,
  WalrusStats
} from './WalrusService';

export type {
  StorageManagerConfig,
  StorageResult,
  RetrievalOptions,
  StorageBatchOperation,
  StorageBatchResult,
  StorageStats
} from './StorageManager';