"use strict";
/**
 * Utilities Module - Barrel Export
 *
 * Central location for utility functions and helpers.
 * Currently empty - ready for future utility additions.
 *
 * Recommended structure:
 * - utils/crypto/ - Cryptographic helpers
 * - utils/encoding/ - Encoding/decoding utilities
 * - utils/validation/ - Input validation (see errors/validation.ts)
 * - utils/formatting/ - Data formatting utilities
 * - utils/network/ - Network/HTTP helpers
 *
 * Note: Configuration utilities are in src/config/
 * Note: Validation utilities are in src/errors/validation.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationHelper = exports.validateObjectId = exports.validateSuiAddress = exports.validateArray = exports.validateObject = exports.validateBoolean = exports.validateNumber = exports.validateString = exports.validateRequired = exports.isValidObjectId = exports.isValidAddress = exports.isUint8Array = exports.isArray = exports.isObject = exports.isBoolean = exports.isNumber = exports.isString = void 0;
// Re-export commonly used validation utilities for convenience
var validation_1 = require("../errors/validation");
Object.defineProperty(exports, "isString", { enumerable: true, get: function () { return validation_1.isString; } });
Object.defineProperty(exports, "isNumber", { enumerable: true, get: function () { return validation_1.isNumber; } });
Object.defineProperty(exports, "isBoolean", { enumerable: true, get: function () { return validation_1.isBoolean; } });
Object.defineProperty(exports, "isObject", { enumerable: true, get: function () { return validation_1.isObject; } });
Object.defineProperty(exports, "isArray", { enumerable: true, get: function () { return validation_1.isArray; } });
Object.defineProperty(exports, "isUint8Array", { enumerable: true, get: function () { return validation_1.isUint8Array; } });
Object.defineProperty(exports, "isValidAddress", { enumerable: true, get: function () { return validation_1.isValidAddress; } });
Object.defineProperty(exports, "isValidObjectId", { enumerable: true, get: function () { return validation_1.isValidObjectId; } });
Object.defineProperty(exports, "validateRequired", { enumerable: true, get: function () { return validation_1.validateRequired; } });
Object.defineProperty(exports, "validateString", { enumerable: true, get: function () { return validation_1.validateString; } });
Object.defineProperty(exports, "validateNumber", { enumerable: true, get: function () { return validation_1.validateNumber; } });
Object.defineProperty(exports, "validateBoolean", { enumerable: true, get: function () { return validation_1.validateBoolean; } });
Object.defineProperty(exports, "validateObject", { enumerable: true, get: function () { return validation_1.validateObject; } });
Object.defineProperty(exports, "validateArray", { enumerable: true, get: function () { return validation_1.validateArray; } });
Object.defineProperty(exports, "validateSuiAddress", { enumerable: true, get: function () { return validation_1.validateSuiAddress; } });
Object.defineProperty(exports, "validateObjectId", { enumerable: true, get: function () { return validation_1.validateObjectId; } });
// Re-export configuration helpers for convenience
var ConfigurationHelper_1 = require("../config/ConfigurationHelper");
Object.defineProperty(exports, "ConfigurationHelper", { enumerable: true, get: function () { return ConfigurationHelper_1.ConfigurationHelper; } });
// Future utility exports will go here
// export * from './crypto';
// export * from './encoding';
// export * from './formatting';
// export * from './network';
//# sourceMappingURL=index.js.map