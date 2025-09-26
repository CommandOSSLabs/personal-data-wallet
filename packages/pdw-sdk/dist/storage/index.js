"use strict";
/**
 * Storage Module
 *
 * PRODUCTION: Uses services/StorageService.ts with writeBlobFlow pattern
 * LEGACY: Old storage services remain for compatibility during transition
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = exports.StorageManager = exports.WalrusStorageService = exports.LegacyStorageService = void 0;
// PRODUCTION - Use services/StorageService.ts instead
var StorageService_1 = require("./StorageService");
Object.defineProperty(exports, "LegacyStorageService", { enumerable: true, get: function () { return StorageService_1.StorageService; } });
// LEGACY SERVICES - Will be deprecated once transition complete
var WalrusStorageService_1 = require("./WalrusStorageService");
Object.defineProperty(exports, "WalrusStorageService", { enumerable: true, get: function () { return WalrusStorageService_1.WalrusStorageService; } });
var StorageManager_1 = require("./StorageManager");
Object.defineProperty(exports, "StorageManager", { enumerable: true, get: function () { return StorageManager_1.StorageManager; } });
// WalrusTestAdapter is disabled due to API incompatibility with new StorageService
// export { WalrusTestAdapter } from './WalrusTestAdapter';
// Export production service from services directory
var StorageService_2 = require("../services/StorageService");
Object.defineProperty(exports, "StorageService", { enumerable: true, get: function () { return StorageService_2.StorageService; } });
//# sourceMappingURL=index.js.map