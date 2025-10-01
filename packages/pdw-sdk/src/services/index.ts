/**
 * Services Index - Clean Architecture Layer
 * 
 * All business logic services consolidated into unified implementations
 * following clean architecture principles and consistent naming.
 */

// Core Services (Consolidated - No Duplicates)
export { MemoryService } from './MemoryService';
export { BatchService } from './BatchService';
export { VectorService } from './VectorService';

// NEW: Memory-focused Services (following backend architecture)
export { MemoryIndexService } from './MemoryIndexService';
export { QueryService } from './QueryService';
export { ClassifierService } from './ClassifierService';

// Cross-Context Permission Services (OAuth-style app permissions)
export { CrossContextPermissionService } from './CrossContextPermissionService';
export { WalletManagementService } from './WalletManagementService';

// Graph Services (Knowledge Graph and Entity Management)
export { GraphService, KnowledgeGraphManager } from '../graph';

// AI Services
export { GeminiAIService } from './GeminiAIService';

// Infrastructure-Dependent Services  
export { StorageService } from './StorageService';
export { EncryptionService } from './EncryptionService';
export { ViewService } from './ViewService';
export { TransactionService } from './TransactionService';

// Legacy Services (To Be Consolidated)
// These will be removed once consolidation is complete:
// - WalrusStorageService -> merged into StorageService
// - StorageManager -> merged into StorageService  
// - BatchingService -> consolidated into BatchService ✅
// - BatchManager -> consolidated into BatchService ✅
// - HnswIndexService -> consolidated into VectorService ✅
// - VectorManager -> consolidated into VectorService ✅

/**
 * Service Consolidation Status:
 * 
 * ✅ COMPLETED:
 * - BatchService: Unified batch processing + caching (was BatchingService + BatchManager)
 * - VectorService: Unified vector operations + indexing (was HnswIndexService + VectorManager)
 * 
 * 🚧 IN PROGRESS:
 * - StorageService: Production-ready main storage service (already exists, needs consolidation with duplicates)
 * 
 * 📋 PENDING:
 * - Consolidate 6 duplicate storage services into single StorageService
 * - Move infrastructure clients to infrastructure/ directory
 * - Remove old fragmented directories
 * - Update all import paths across SDK
 * 
 * CLEAN ARCHITECTURE PRINCIPLES:
 * - Services contain business logic only
 * - Infrastructure dependencies injected via constructor
 * - Consistent Service suffix naming
 * - No duplicate implementations
 * - Clear separation of concerns
 */

// Type exports for service interfaces
export type {
  BatchItem,
  BatchProcessor,
  CacheConfig,
  BatchServiceConfig
} from './BatchService';

// Graph Service Types
export type {
  Entity,
  Relationship,
  KnowledgeGraph,
  GraphExtractionResult,
  GraphQueryResult,
  GraphConfig,
  GraphMemoryMapping,
  GraphUpdateResult,
  GraphSearchQuery,
  GraphSearchResult,
  KnowledgeGraphStats
} from '../graph';

// AI Service Types
export type {
  GeminiConfig,
  EntityExtractionRequest,
  EntityExtractionResponse
} from './GeminiAIService';

// Note: VectorService types to be exported once service is finalized