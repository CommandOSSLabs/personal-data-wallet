"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageManager = exports.WalrusStorageService = exports.StorageService = void 0;
// PRODUCTION SERVICE - Use this instead of legacy services
var StorageService_1 = require("../services/StorageService");
Object.defineProperty(exports, "StorageService", { enumerable: true, get: function () { return StorageService_1.StorageService; } });
// DEPRECATED LEGACY SERVICES - Kept for backward compatibility only
/** @deprecated Use services/StorageService instead. Will be removed in Phase 1B. */
var WalrusStorageService_1 = require("./WalrusStorageService");
Object.defineProperty(exports, "WalrusStorageService", { enumerable: true, get: function () { return WalrusStorageService_1.WalrusStorageService; } });
/** @deprecated Use services/StorageService instead. Will be removed in Phase 1B. */
var StorageManager_1 = require("./StorageManager");
Object.defineProperty(exports, "StorageManager", { enumerable: true, get: function () { return StorageManager_1.StorageManager; } });
//# sourceMappingURL=index.js.map