/**
 * Personal Data Wallet SDK
 *
 * A TypeScript SDK for building memory-aware applications with decentralized storage,
 * SEAL encryption, and Sui blockchain integration.
 */
// Core types - export everything from types
export * from './types';
// Service classes for advanced usage
export { MemoryService } from './memory/MemoryService';
export { ChatService } from './chat/ChatService';
export { StorageService } from './storage/StorageService';
export { EncryptionService } from './encryption/EncryptionService';
// Client factory functions
export { createPDWClient, extendWithPDW, createDevPDWClient, createTestnetPDWClient } from './client/factory';
// Configuration utilities
export { createDefaultConfig, createProductionConfig, createTestnetConfig } from './config/defaults';
export { validateConfig, ConfigurationError } from './config/validation';
// API client for direct backend access
export { PDWApiClient } from './api/client';
// Generated Move types (now available!)
export * as memoryContract from './generated/pdw/memory.js';
export * as sealAccessContract from './generated/pdw/seal_access_control.js';
// Version
export const VERSION = '0.1.0';
//# sourceMappingURL=index.js.map