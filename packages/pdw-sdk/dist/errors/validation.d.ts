/**
 * Validation Utilities for Personal Data Wallet SDK
 *
 * Provides input validation, type checking, and data sanitization
 * with automatic error throwing using the error handling system.
 */
export declare function isString(value: any): value is string;
export declare function isNumber(value: any): value is number;
export declare function isBoolean(value: any): value is boolean;
export declare function isObject(value: any): value is Record<string, any>;
export declare function isArray(value: any): value is any[];
export declare function isUint8Array(value: any): value is Uint8Array;
export declare function isValidAddress(address: string): boolean;
export declare function isValidObjectId(objectId: string): boolean;
export declare function isValidPackageId(packageId: string): boolean;
export declare function isValidBlobId(blobId: string): boolean;
export declare function isValidCategory(category: string): boolean;
export declare function isValidImportance(importance: number): boolean;
/**
 * Validate required parameter exists and is not null/undefined
 */
export declare function validateRequired<T>(value: T | null | undefined, parameterName: string): T;
/**
 * Validate parameter is a non-empty string
 */
export declare function validateString(value: any, parameterName: string, options?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
}): string;
/**
 * Validate parameter is a valid number
 */
export declare function validateNumber(value: any, parameterName: string, options?: {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
}): number;
/**
 * Validate parameter is a boolean
 */
export declare function validateBoolean(value: any, parameterName: string, required?: boolean): boolean;
/**
 * Validate parameter is an object
 */
export declare function validateObject<T extends Record<string, any>>(value: any, parameterName: string, required?: boolean): T;
/**
 * Validate parameter is an array
 */
export declare function validateArray<T>(value: any, parameterName: string, options?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: any, index: number) => T;
}): T[];
/**
 * Validate Sui address format
 */
export declare function validateSuiAddress(address: any, parameterName: string, required?: boolean): string;
/**
 * Validate Sui object ID format
 */
export declare function validateObjectId(objectId: any, parameterName: string, required?: boolean): string;
/**
 * Validate memory category
 */
export declare function validateMemoryCategory(category: any, parameterName?: string, required?: boolean): string;
/**
 * Validate memory importance (1-10)
 */
export declare function validateMemoryImportance(importance: any, parameterName?: string, required?: boolean): number;
/**
 * Validate Walrus blob ID format
 */
export declare function validateBlobId(blobId: any, parameterName: string, required?: boolean): string;
/**
 * Validate access level
 */
export declare function validateAccessLevel(accessLevel: any, parameterName?: string, required?: boolean): 'read' | 'write';
/**
 * Validate PDW SDK configuration
 */
export declare function validatePDWConfig(config: any): void;
/**
 * Validate encryption configuration
 */
export declare function validateEncryptionConfig(config: any): void;
/**
 * Validate storage configuration
 */
export declare function validateStorageConfig(config: any): void;
/**
 * Sanitize user input to prevent common issues
 */
export declare function sanitizeString(input: string): string;
/**
 * Validate and normalize Sui address
 */
export declare function normalizeSuiAddress(address: string): string;
/**
 * Create validation wrapper for functions
 */
export declare function withValidation<T extends any[], R>(fn: (...args: T) => R, validators: Array<(arg: any, index: number) => any>): (...args: T) => R;
//# sourceMappingURL=validation.d.ts.map