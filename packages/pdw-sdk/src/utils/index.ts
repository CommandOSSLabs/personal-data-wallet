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

// Re-export commonly used validation utilities for convenience
export {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isUint8Array,
  isValidAddress,
  isValidObjectId,
  validateRequired,
  validateString,
  validateNumber,
  validateBoolean,
  validateObject,
  validateArray,
  validateAddress,
  validateObjectId,
} from '../errors/validation';

// Re-export configuration helpers for convenience
export {
  ConfigurationHelper,
  type SDKConfig,
  type EnvironmentConfig,
} from '../config/ConfigurationHelper';

// Future utility exports will go here
// export * from './crypto';
// export * from './encoding';
// export * from './formatting';
// export * from './network';

