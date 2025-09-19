/**
 * Personal Data Wallet SDK
 *
 * A TypeScript SDK for building memory-aware applications with decentralized storage,
 * SEAL encryption, and Sui blockchain integration.
 */
export * from './types';
export { MemoryService } from './memory/MemoryService';
export { ChatService } from './chat/ChatService';
export { StorageService } from './storage/StorageService';
export { EncryptionService } from './encryption/EncryptionService';
export { createPDWClient, extendWithPDW, createDevPDWClient, createTestnetPDWClient } from './client/factory';
export { createDefaultConfig, createProductionConfig, createTestnetConfig } from './config/defaults';
export { validateConfig, ConfigurationError } from './config/validation';
export { PDWApiClient } from './api/client';
export * as memoryContract from './generated/pdw/memory.js';
export * as sealAccessContract from './generated/pdw/seal_access_control.js';
export declare const VERSION = "0.1.0";
//# sourceMappingURL=index.d.ts.map