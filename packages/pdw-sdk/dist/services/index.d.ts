/**
 * Services Index - Clean Architecture Layer
 *
 * All business logic services consolidated into unified implementations
 * following clean architecture principles and consistent naming.
 */
export { MemoryService } from './MemoryService';
export { BatchService } from './BatchService';
export { VectorService } from './VectorService';
export { MemoryIndexService } from './MemoryIndexService';
export { QueryService } from './QueryService';
export { ClassifierService } from './ClassifierService';
export { CrossContextPermissionService } from './CrossContextPermissionService';
export { WalletManagementService } from './WalletManagementService';
export { GraphService, KnowledgeGraphManager } from '../graph';
export { GeminiAIService } from './GeminiAIService';
export { StorageService } from './StorageService';
export { EncryptionService } from './EncryptionService';
export { ViewService } from './ViewService';
export { TransactionService } from './TransactionService';
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
export type { BatchItem, BatchProcessor, CacheConfig, BatchServiceConfig } from './BatchService';
export type { Entity, Relationship, KnowledgeGraph, GraphExtractionResult, GraphQueryResult, GraphConfig, GraphMemoryMapping, GraphUpdateResult, GraphSearchQuery, GraphSearchResult, KnowledgeGraphStats } from '../graph';
export type { GeminiConfig, EntityExtractionRequest, EntityExtractionResponse } from './GeminiAIService';
//# sourceMappingURL=index.d.ts.map