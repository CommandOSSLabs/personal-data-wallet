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
// Note: VectorService types to be exported once service is finalized
//# sourceMappingURL=index.js.map