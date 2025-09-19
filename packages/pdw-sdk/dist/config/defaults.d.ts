/**
 * Default PDW Configuration
 *
 * Provides sensible defaults for different environments
 */
import type { PDWConfig } from '../types';
export declare function createDefaultConfig(): PDWConfig;
export declare function createProductionConfig(overrides?: Partial<PDWConfig>): PDWConfig;
export declare function createTestnetConfig(overrides?: Partial<PDWConfig>): PDWConfig;
//# sourceMappingURL=defaults.d.ts.map