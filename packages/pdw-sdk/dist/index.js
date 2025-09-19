"use strict";
/**
 * Personal Data Wallet SDK
 *
 * A TypeScript SDK for building memory-aware applications with decentralized storage,
 * SEAL encryption, and Sui blockchain integration.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.sealAccessContract = exports.memoryContract = exports.PDWApiClient = exports.ConfigurationError = exports.validateConfig = exports.createTestnetConfig = exports.createProductionConfig = exports.createDefaultConfig = exports.createTestnetPDWClient = exports.createDevPDWClient = exports.extendWithPDW = exports.createPDWClient = exports.EncryptionService = exports.StorageService = exports.ChatService = exports.MemoryService = void 0;
// Core types - export everything from types
__exportStar(require("./types"), exports);
// Service classes for advanced usage
var MemoryService_1 = require("./memory/MemoryService");
Object.defineProperty(exports, "MemoryService", { enumerable: true, get: function () { return MemoryService_1.MemoryService; } });
var ChatService_1 = require("./chat/ChatService");
Object.defineProperty(exports, "ChatService", { enumerable: true, get: function () { return ChatService_1.ChatService; } });
var StorageService_1 = require("./storage/StorageService");
Object.defineProperty(exports, "StorageService", { enumerable: true, get: function () { return StorageService_1.StorageService; } });
var EncryptionService_1 = require("./encryption/EncryptionService");
Object.defineProperty(exports, "EncryptionService", { enumerable: true, get: function () { return EncryptionService_1.EncryptionService; } });
// Client factory functions
var factory_1 = require("./client/factory");
Object.defineProperty(exports, "createPDWClient", { enumerable: true, get: function () { return factory_1.createPDWClient; } });
Object.defineProperty(exports, "extendWithPDW", { enumerable: true, get: function () { return factory_1.extendWithPDW; } });
Object.defineProperty(exports, "createDevPDWClient", { enumerable: true, get: function () { return factory_1.createDevPDWClient; } });
Object.defineProperty(exports, "createTestnetPDWClient", { enumerable: true, get: function () { return factory_1.createTestnetPDWClient; } });
// Configuration utilities
var defaults_1 = require("./config/defaults");
Object.defineProperty(exports, "createDefaultConfig", { enumerable: true, get: function () { return defaults_1.createDefaultConfig; } });
Object.defineProperty(exports, "createProductionConfig", { enumerable: true, get: function () { return defaults_1.createProductionConfig; } });
Object.defineProperty(exports, "createTestnetConfig", { enumerable: true, get: function () { return defaults_1.createTestnetConfig; } });
var validation_1 = require("./config/validation");
Object.defineProperty(exports, "validateConfig", { enumerable: true, get: function () { return validation_1.validateConfig; } });
Object.defineProperty(exports, "ConfigurationError", { enumerable: true, get: function () { return validation_1.ConfigurationError; } });
// API client for direct backend access
var client_1 = require("./api/client");
Object.defineProperty(exports, "PDWApiClient", { enumerable: true, get: function () { return client_1.PDWApiClient; } });
// Generated Move types (now available!)
exports.memoryContract = __importStar(require("./generated/pdw/memory.js"));
exports.sealAccessContract = __importStar(require("./generated/pdw/seal_access_control.js"));
// Version
exports.VERSION = '0.1.0';
//# sourceMappingURL=index.js.map