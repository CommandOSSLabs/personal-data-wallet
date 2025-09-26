/**
 * Storage Module
 *
 * PRODUCTION: Uses services/StorageService.ts with writeBlobFlow pattern
 * LEGACY: Old storage services remain for compatibility during transition
 */
// PRODUCTION - Use services/StorageService.ts instead
export { StorageService as LegacyStorageService } from './StorageService';
// LEGACY SERVICES - Will be deprecated once transition complete
export { WalrusStorageService } from './WalrusStorageService';
export { StorageManager } from './StorageManager';
// WalrusTestAdapter is disabled due to API incompatibility with new StorageService
// export { WalrusTestAdapter } from './WalrusTestAdapter';
// Export production service from services directory
export { StorageService } from '../services/StorageService';
//# sourceMappingURL=index.js.map