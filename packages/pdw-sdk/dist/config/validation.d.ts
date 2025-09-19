/**
 * Configuration Validation
 *
 * Validates PDW configuration and provides helpful error messages
 */
import type { PDWConfig } from '../types';
export declare class ConfigurationError extends Error {
    constructor(message: string);
}
export declare function validateConfig(config: Partial<PDWConfig>): PDWConfig;
export declare function mergeConfigs(base: PDWConfig, overrides: Partial<PDWConfig>): PDWConfig;
//# sourceMappingURL=validation.d.ts.map