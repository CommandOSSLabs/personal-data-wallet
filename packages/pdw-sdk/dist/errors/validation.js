"use strict";
/**
 * Validation Utilities for Personal Data Wallet SDK
 *
 * Provides input validation, type checking, and data sanitization
 * with automatic error throwing using the error handling system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isString = isString;
exports.isNumber = isNumber;
exports.isBoolean = isBoolean;
exports.isObject = isObject;
exports.isArray = isArray;
exports.isUint8Array = isUint8Array;
exports.isValidAddress = isValidAddress;
exports.isValidObjectId = isValidObjectId;
exports.isValidPackageId = isValidPackageId;
exports.isValidBlobId = isValidBlobId;
exports.isValidCategory = isValidCategory;
exports.isValidImportance = isValidImportance;
exports.validateRequired = validateRequired;
exports.validateString = validateString;
exports.validateNumber = validateNumber;
exports.validateBoolean = validateBoolean;
exports.validateObject = validateObject;
exports.validateArray = validateArray;
exports.validateSuiAddress = validateSuiAddress;
exports.validateObjectId = validateObjectId;
exports.validateMemoryCategory = validateMemoryCategory;
exports.validateMemoryImportance = validateMemoryImportance;
exports.validateBlobId = validateBlobId;
exports.validateAccessLevel = validateAccessLevel;
exports.validatePDWConfig = validatePDWConfig;
exports.validateEncryptionConfig = validateEncryptionConfig;
exports.validateStorageConfig = validateStorageConfig;
exports.sanitizeString = sanitizeString;
exports.normalizeSuiAddress = normalizeSuiAddress;
exports.withValidation = withValidation;
const index_1 = require("./index");
// ==================== TYPE GUARDS ====================
function isString(value) {
    return typeof value === 'string';
}
function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}
function isBoolean(value) {
    return typeof value === 'boolean';
}
function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isArray(value) {
    return Array.isArray(value);
}
function isUint8Array(value) {
    return value instanceof Uint8Array;
}
function isValidAddress(address) {
    // Sui address validation - should start with 0x and be 64 characters total
    return /^0x[a-fA-F0-9]{64}$/.test(address);
}
function isValidObjectId(objectId) {
    // Sui object ID validation
    return /^0x[a-fA-F0-9]{64}$/.test(objectId);
}
function isValidPackageId(packageId) {
    // Same format as object ID
    return isValidObjectId(packageId);
}
function isValidBlobId(blobId) {
    // Walrus blob ID validation - alphanumeric string
    return /^[a-zA-Z0-9_-]{1,64}$/.test(blobId);
}
function isValidCategory(category) {
    // Memory category validation
    const validCategories = [
        'personal', 'work', 'learning', 'health', 'finance',
        'travel', 'relationships', 'hobbies', 'goals', 'general'
    ];
    return validCategories.includes(category.toLowerCase());
}
function isValidImportance(importance) {
    return isNumber(importance) && importance >= 1 && importance <= 10;
}
// ==================== VALIDATION FUNCTIONS ====================
/**
 * Validate required parameter exists and is not null/undefined
 */
function validateRequired(value, parameterName) {
    if (value === null || value === undefined) {
        throw new index_1.MissingParameterError(parameterName);
    }
    return value;
}
/**
 * Validate parameter is a non-empty string
 */
function validateString(value, parameterName, options) {
    if (options?.required !== false) {
        validateRequired(value, parameterName);
    }
    if (value === null || value === undefined) {
        if (options?.required === false) {
            return '';
        }
        throw new index_1.MissingParameterError(parameterName);
    }
    if (!isString(value)) {
        throw new index_1.InvalidParameterError(parameterName, 'string', value);
    }
    if (options?.minLength && value.length < options.minLength) {
        throw new index_1.ValidationError(`Parameter '${parameterName}' must be at least ${options.minLength} characters long`, parameterName, value);
    }
    if (options?.maxLength && value.length > options.maxLength) {
        throw new index_1.ValidationError(`Parameter '${parameterName}' must be no more than ${options.maxLength} characters long`, parameterName, value);
    }
    if (options?.pattern && !options.pattern.test(value)) {
        throw new index_1.ValidationError(`Parameter '${parameterName}' does not match required pattern`, parameterName, value);
    }
    return value;
}
/**
 * Validate parameter is a valid number
 */
function validateNumber(value, parameterName, options) {
    if (options?.required !== false) {
        validateRequired(value, parameterName);
    }
    if (value === null || value === undefined) {
        if (options?.required === false) {
            return 0;
        }
        throw new index_1.MissingParameterError(parameterName);
    }
    if (!isNumber(value)) {
        throw new index_1.InvalidParameterError(parameterName, 'number', value);
    }
    if (options?.integer && !Number.isInteger(value)) {
        throw new index_1.ValidationError(`Parameter '${parameterName}' must be an integer`, parameterName, value);
    }
    if (options?.min !== undefined && value < options.min) {
        throw new index_1.ValidationError(`Parameter '${parameterName}' must be at least ${options.min}`, parameterName, value);
    }
    if (options?.max !== undefined && value > options.max) {
        throw new index_1.ValidationError(`Parameter '${parameterName}' must be no more than ${options.max}`, parameterName, value);
    }
    return value;
}
/**
 * Validate parameter is a boolean
 */
function validateBoolean(value, parameterName, required = true) {
    if (required) {
        validateRequired(value, parameterName);
    }
    if (value === null || value === undefined) {
        if (!required) {
            return false;
        }
        throw new index_1.MissingParameterError(parameterName);
    }
    if (!isBoolean(value)) {
        throw new index_1.InvalidParameterError(parameterName, 'boolean', value);
    }
    return value;
}
/**
 * Validate parameter is an object
 */
function validateObject(value, parameterName, required = true) {
    if (required) {
        validateRequired(value, parameterName);
    }
    if (value === null || value === undefined) {
        if (!required) {
            return {};
        }
        throw new index_1.MissingParameterError(parameterName);
    }
    if (!isObject(value)) {
        throw new index_1.InvalidParameterError(parameterName, 'object', value);
    }
    return value;
}
/**
 * Validate parameter is an array
 */
function validateArray(value, parameterName, options) {
    if (options?.required !== false) {
        validateRequired(value, parameterName);
    }
    if (value === null || value === undefined) {
        if (options?.required === false) {
            return [];
        }
        throw new index_1.MissingParameterError(parameterName);
    }
    if (!isArray(value)) {
        throw new index_1.InvalidParameterError(parameterName, 'array', value);
    }
    if (options?.minLength && value.length < options.minLength) {
        throw new index_1.ValidationError(`Parameter '${parameterName}' must have at least ${options.minLength} items`, parameterName, value);
    }
    if (options?.maxLength && value.length > options.maxLength) {
        throw new index_1.ValidationError(`Parameter '${parameterName}' must have no more than ${options.maxLength} items`, parameterName, value);
    }
    if (options?.itemValidator) {
        return value.map((item, index) => {
            try {
                return options.itemValidator(item, index);
            }
            catch (error) {
                throw new index_1.ValidationError(`Invalid item at index ${index} in ${parameterName}: ${error instanceof Error ? error.message : 'unknown error'}`, `${parameterName}[${index}]`, item);
            }
        });
    }
    return value;
}
// ==================== DOMAIN-SPECIFIC VALIDATORS ====================
/**
 * Validate Sui address format
 */
function validateSuiAddress(address, parameterName, required = true) {
    const addressStr = validateString(address, parameterName, { required });
    if (!addressStr && !required) {
        return '';
    }
    if (!isValidAddress(addressStr)) {
        throw new index_1.ValidationError(`Parameter '${parameterName}' must be a valid Sui address (0x followed by 64 hex characters)`, parameterName, address);
    }
    return addressStr;
}
/**
 * Validate Sui object ID format
 */
function validateObjectId(objectId, parameterName, required = true) {
    const idStr = validateString(objectId, parameterName, { required });
    if (!idStr && !required) {
        return '';
    }
    if (!isValidObjectId(idStr)) {
        throw new index_1.ValidationError(`Parameter '${parameterName}' must be a valid Sui object ID (0x followed by 64 hex characters)`, parameterName, objectId);
    }
    return idStr;
}
/**
 * Validate memory category
 */
function validateMemoryCategory(category, parameterName = 'category', required = true) {
    const categoryStr = validateString(category, parameterName, { required });
    if (!categoryStr && !required) {
        return 'general';
    }
    if (!isValidCategory(categoryStr)) {
        throw new index_1.ValidationError(`Parameter '${parameterName}' must be a valid memory category`, parameterName, category);
    }
    return categoryStr.toLowerCase();
}
/**
 * Validate memory importance (1-10)
 */
function validateMemoryImportance(importance, parameterName = 'importance', required = false) {
    if (!required && (importance === null || importance === undefined)) {
        return 5; // Default importance
    }
    const importanceNum = validateNumber(importance, parameterName, {
        required,
        min: 1,
        max: 10,
        integer: true,
    });
    return importanceNum;
}
/**
 * Validate Walrus blob ID format
 */
function validateBlobId(blobId, parameterName, required = true) {
    const blobIdStr = validateString(blobId, parameterName, { required });
    if (!blobIdStr && !required) {
        return '';
    }
    if (!isValidBlobId(blobIdStr)) {
        throw new index_1.ValidationError(`Parameter '${parameterName}' must be a valid Walrus blob ID`, parameterName, blobId);
    }
    return blobIdStr;
}
/**
 * Validate access level
 */
function validateAccessLevel(accessLevel, parameterName = 'accessLevel', required = true) {
    const levelStr = validateString(accessLevel, parameterName, { required });
    if (!levelStr && !required) {
        return 'read';
    }
    if (levelStr !== 'read' && levelStr !== 'write') {
        throw new index_1.ValidationError(`Parameter '${parameterName}' must be either 'read' or 'write'`, parameterName, accessLevel);
    }
    return levelStr;
}
// ==================== CONFIGURATION VALIDATORS ====================
/**
 * Validate PDW SDK configuration
 */
function validatePDWConfig(config) {
    if (!isObject(config)) {
        throw new index_1.ConfigurationError('Configuration must be an object');
    }
    // Validate package ID if provided
    if (config.packageId !== undefined) {
        validateObjectId(config.packageId, 'packageId');
    }
    // Validate API URL if provided
    if (config.apiUrl !== undefined) {
        validateString(config.apiUrl, 'apiUrl', {
            pattern: /^https?:\/\/.+/,
        });
    }
    // Validate encryption config if provided
    if (config.encryptionConfig !== undefined) {
        validateEncryptionConfig(config.encryptionConfig);
    }
    // Validate storage config if provided
    if (config.storageConfig !== undefined) {
        validateStorageConfig(config.storageConfig);
    }
}
/**
 * Validate encryption configuration
 */
function validateEncryptionConfig(config) {
    validateObject(config, 'encryptionConfig');
    if (config.enabled !== undefined) {
        validateBoolean(config.enabled, 'encryptionConfig.enabled');
    }
    if (config.keyServers !== undefined) {
        validateArray(config.keyServers, 'encryptionConfig.keyServers', {
            itemValidator: (server) => validateString(server, 'keyServer'),
        });
    }
}
/**
 * Validate storage configuration
 */
function validateStorageConfig(config) {
    validateObject(config, 'storageConfig');
    if (config.provider !== undefined) {
        const provider = validateString(config.provider, 'storageConfig.provider');
        if (provider !== 'walrus' && provider !== 'local') {
            throw new index_1.ValidationError('storageConfig.provider must be either "walrus" or "local"', 'storageConfig.provider', provider);
        }
    }
    if (config.cacheEnabled !== undefined) {
        validateBoolean(config.cacheEnabled, 'storageConfig.cacheEnabled');
    }
    if (config.encryptionEnabled !== undefined) {
        validateBoolean(config.encryptionEnabled, 'storageConfig.encryptionEnabled');
    }
}
// ==================== UTILITY FUNCTIONS ====================
/**
 * Sanitize user input to prevent common issues
 */
function sanitizeString(input) {
    return input
        .trim()
        .replace(/\0/g, '') // Remove null bytes
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
}
/**
 * Validate and normalize Sui address
 */
function normalizeSuiAddress(address) {
    const validated = validateSuiAddress(address, 'address');
    return validated.toLowerCase();
}
/**
 * Create validation wrapper for functions
 */
function withValidation(fn, validators) {
    return (...args) => {
        // Apply validators to arguments
        const validatedArgs = args.map((arg, index) => {
            if (validators[index]) {
                return validators[index](arg, index);
            }
            return arg;
        });
        return fn(...validatedArgs);
    };
}
//# sourceMappingURL=validation.js.map