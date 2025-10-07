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
// PRODUCTION SERVICE - Use this instead of legacy services
export { StorageService } from '../services/StorageService';
// DEPRECATED LEGACY SERVICES - Kept for backward compatibility only
/** @deprecated Use services/StorageService instead. Will be removed in Phase 1B. */
export { WalrusStorageService } from './WalrusStorageService';
/** @deprecated Use services/StorageService instead. Will be removed in Phase 1B. */
export { StorageManager } from './StorageManager';
//# sourceMappingURL=index.js.map