"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = exports.StorageManager = exports.WalrusStorageService = void 0;
// Re-export from infrastructure for backward compatibility
var walrus_1 = require("../infrastructure/walrus");
Object.defineProperty(exports, "WalrusStorageService", { enumerable: true, get: function () { return walrus_1.WalrusStorageService; } });
Object.defineProperty(exports, "StorageManager", { enumerable: true, get: function () { return walrus_1.StorageManager; } });
// Keep StorageService export from services (not moved to infrastructure)
var StorageService_1 = require("../services/StorageService");
Object.defineProperty(exports, "StorageService", { enumerable: true, get: function () { return StorageService_1.StorageService; } });
//# sourceMappingURL=index.js.map