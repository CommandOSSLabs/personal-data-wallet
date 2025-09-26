/**
 * Personal Data Wallet SDK - Clean Architecture
 *
 * Organized SDK for decentralized memory processing with AI-powered insights.
 *
 * Architecture:
 * - 🏗️ Core: Types, interfaces, domain models
 * - 🔧 Services: Business logic services (Memory, Storage, Vector, etc.)
 * - 🌐 Infrastructure: External integrations (Walrus, Sui, Gemini, HNSW)
 * - 🛠️ Utils: Helper functions and utilities
 * - 📦 Client: PersonalDataWallet extension and public API
 *
 * @version 2.0.0-clean
 * @author Personal Data Wallet Team
 */
export type * from './core';
export { PersonalDataWallet } from './client/PersonalDataWallet';
export { MemoryService } from './services/MemoryService';
export { StorageService } from './services/StorageService';
export { VectorService } from './services/VectorService';
export { EmbeddingService } from './services/EmbeddingService';
export { MemoryPipeline, PipelineManager } from './pipeline';
export type { PipelineConfig, PipelineExecution, PipelineMetrics, PipelineManagerConfig, SystemMetrics } from './pipeline';
export { VectorManager, HnswIndexService } from './vector';
export { BatchManager, BatchingService, MemoryProcessingCache } from './batch';
export { GraphService, KnowledgeGraphManager } from './graph';
export { WalrusStorageService, StorageManager } from './storage';
export { SuiService, BlockchainManager } from './blockchain';
//# sourceMappingURL=index-clean.d.ts.map