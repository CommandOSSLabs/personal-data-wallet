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
// ===== PRIMARY CLIENT API =====
export { PersonalDataWallet } from './client/PersonalDataWallet';
// ===== CORE SERVICES =====
export { MemoryService } from './services/MemoryService';
export { StorageService } from './services/StorageService';
export { VectorService } from './services/VectorService';
export { EmbeddingService } from './services/EmbeddingService';
// ===== SPECIALIZED SERVICES =====
// Note: These will be created as we continue the cleanup
// export { BatchService } from './services/BatchService';
// export { GraphService } from './services/GraphService';
// export { TransactionService } from './services/TransactionService';
// export { ViewService } from './services/ViewService';
// ===== INFRASTRUCTURE CLIENTS =====
// Note: These will be moved to infrastructure/ directory
// export { SuiClient } from './infrastructure/SuiClient';
// export { WalrusClient } from './infrastructure/WalrusClient';
// export { GeminiClient } from './infrastructure/GeminiClient';
// ===== UTILITIES =====
// Note: These will be organized in utils/ directory
// export { ErrorHandler } from './utils/ErrorHandler';
// export { Logger } from './utils/Logger';
// export { Validator } from './utils/Validator';
// ===== LEGACY COMPATIBILITY (Temporary) =====
// Keep these exports for backward compatibility during transition
// Will be removed once cleanup is complete
// Pipeline - the main entry point (keeping for now)
export { MemoryPipeline, PipelineManager } from './pipeline';
// Legacy service exports (will be deprecated)
export { VectorManager, HnswIndexService } from './vector';
export { BatchManager, BatchingService, MemoryProcessingCache } from './batch';
export { GraphService, KnowledgeGraphManager } from './graph';
export { WalrusStorageService, StorageManager } from './storage';
export { SuiService, BlockchainManager } from './blockchain';
// ===== CLEANUP PROGRESS NOTES =====
/*
✅ COMPLETED:
- Created clean directory structure (core/, services/, infrastructure/, utils/)
- Moved core types to core/
- Consolidated VectorService (combining HnswIndexService + VectorManager)
- Moved StorageService to services/
- Moved MemoryService to services/
- Moved EmbeddingService to services/

🚧 IN PROGRESS:
- Fix type import issues in VectorService
- Consolidate BatchService (merge BatchingService + BatchManager)
- Move infrastructure clients to infrastructure/
- Create clean service interfaces

📋 TODO:
- Remove duplicate storage services (WalrusStorageService, StorageManager, etc.)
- Consolidate graph services
- Move transaction services to services/
- Move view services to services/
- Create utils/ organization
- Update all import paths
- Remove old directories once consolidation complete
- Update tests to use new structure
*/ 
//# sourceMappingURL=index-clean.js.map