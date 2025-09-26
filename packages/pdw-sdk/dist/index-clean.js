"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainManager = exports.SuiService = exports.StorageManager = exports.WalrusStorageService = exports.KnowledgeGraphManager = exports.GraphService = exports.MemoryProcessingCache = exports.BatchingService = exports.BatchManager = exports.HnswIndexService = exports.VectorManager = exports.PipelineManager = exports.MemoryPipeline = exports.EmbeddingService = exports.VectorService = exports.StorageService = exports.MemoryService = exports.PersonalDataWallet = void 0;
// ===== PRIMARY CLIENT API =====
var PersonalDataWallet_1 = require("./client/PersonalDataWallet");
Object.defineProperty(exports, "PersonalDataWallet", { enumerable: true, get: function () { return PersonalDataWallet_1.PersonalDataWallet; } });
// ===== CORE SERVICES =====
var MemoryService_1 = require("./services/MemoryService");
Object.defineProperty(exports, "MemoryService", { enumerable: true, get: function () { return MemoryService_1.MemoryService; } });
var StorageService_1 = require("./services/StorageService");
Object.defineProperty(exports, "StorageService", { enumerable: true, get: function () { return StorageService_1.StorageService; } });
var VectorService_1 = require("./services/VectorService");
Object.defineProperty(exports, "VectorService", { enumerable: true, get: function () { return VectorService_1.VectorService; } });
var EmbeddingService_1 = require("./services/EmbeddingService");
Object.defineProperty(exports, "EmbeddingService", { enumerable: true, get: function () { return EmbeddingService_1.EmbeddingService; } });
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
var pipeline_1 = require("./pipeline");
Object.defineProperty(exports, "MemoryPipeline", { enumerable: true, get: function () { return pipeline_1.MemoryPipeline; } });
Object.defineProperty(exports, "PipelineManager", { enumerable: true, get: function () { return pipeline_1.PipelineManager; } });
// Legacy service exports (will be deprecated)
var vector_1 = require("./vector");
Object.defineProperty(exports, "VectorManager", { enumerable: true, get: function () { return vector_1.VectorManager; } });
Object.defineProperty(exports, "HnswIndexService", { enumerable: true, get: function () { return vector_1.HnswIndexService; } });
var batch_1 = require("./batch");
Object.defineProperty(exports, "BatchManager", { enumerable: true, get: function () { return batch_1.BatchManager; } });
Object.defineProperty(exports, "BatchingService", { enumerable: true, get: function () { return batch_1.BatchingService; } });
Object.defineProperty(exports, "MemoryProcessingCache", { enumerable: true, get: function () { return batch_1.MemoryProcessingCache; } });
var graph_1 = require("./graph");
Object.defineProperty(exports, "GraphService", { enumerable: true, get: function () { return graph_1.GraphService; } });
Object.defineProperty(exports, "KnowledgeGraphManager", { enumerable: true, get: function () { return graph_1.KnowledgeGraphManager; } });
var storage_1 = require("./storage");
Object.defineProperty(exports, "WalrusStorageService", { enumerable: true, get: function () { return storage_1.WalrusStorageService; } });
Object.defineProperty(exports, "StorageManager", { enumerable: true, get: function () { return storage_1.StorageManager; } });
var blockchain_1 = require("./blockchain");
Object.defineProperty(exports, "SuiService", { enumerable: true, get: function () { return blockchain_1.SuiService; } });
Object.defineProperty(exports, "BlockchainManager", { enumerable: true, get: function () { return blockchain_1.BlockchainManager; } });
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