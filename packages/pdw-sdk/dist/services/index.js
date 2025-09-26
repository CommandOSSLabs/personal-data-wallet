"use strict";
/**
 * Services Index - Clean Architecture Layer
 *
 * All business logic services consolidated into unified implementations
 * following clean architecture principles and consistent naming.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = exports.ViewService = exports.EncryptionService = exports.StorageService = exports.GeminiAIService = exports.KnowledgeGraphManager = exports.GraphService = exports.ClassifierService = exports.QueryService = exports.MemoryIndexService = exports.VectorService = exports.BatchService = exports.MemoryService = void 0;
// Core Services (Consolidated - No Duplicates)
var MemoryService_1 = require("./MemoryService");
Object.defineProperty(exports, "MemoryService", { enumerable: true, get: function () { return MemoryService_1.MemoryService; } });
var BatchService_1 = require("./BatchService");
Object.defineProperty(exports, "BatchService", { enumerable: true, get: function () { return BatchService_1.BatchService; } });
var VectorService_1 = require("./VectorService");
Object.defineProperty(exports, "VectorService", { enumerable: true, get: function () { return VectorService_1.VectorService; } });
// NEW: Memory-focused Services (following backend architecture)
var MemoryIndexService_1 = require("./MemoryIndexService");
Object.defineProperty(exports, "MemoryIndexService", { enumerable: true, get: function () { return MemoryIndexService_1.MemoryIndexService; } });
var QueryService_1 = require("./QueryService");
Object.defineProperty(exports, "QueryService", { enumerable: true, get: function () { return QueryService_1.QueryService; } });
var ClassifierService_1 = require("./ClassifierService");
Object.defineProperty(exports, "ClassifierService", { enumerable: true, get: function () { return ClassifierService_1.ClassifierService; } });
// Graph Services (Knowledge Graph and Entity Management)
var graph_1 = require("../graph");
Object.defineProperty(exports, "GraphService", { enumerable: true, get: function () { return graph_1.GraphService; } });
Object.defineProperty(exports, "KnowledgeGraphManager", { enumerable: true, get: function () { return graph_1.KnowledgeGraphManager; } });
// AI Services
var GeminiAIService_1 = require("./GeminiAIService");
Object.defineProperty(exports, "GeminiAIService", { enumerable: true, get: function () { return GeminiAIService_1.GeminiAIService; } });
// Infrastructure-Dependent Services  
var StorageService_1 = require("./StorageService");
Object.defineProperty(exports, "StorageService", { enumerable: true, get: function () { return StorageService_1.StorageService; } });
var EncryptionService_1 = require("./EncryptionService");
Object.defineProperty(exports, "EncryptionService", { enumerable: true, get: function () { return EncryptionService_1.EncryptionService; } });
var ViewService_1 = require("./ViewService");
Object.defineProperty(exports, "ViewService", { enumerable: true, get: function () { return ViewService_1.ViewService; } });
var TransactionService_1 = require("./TransactionService");
Object.defineProperty(exports, "TransactionService", { enumerable: true, get: function () { return TransactionService_1.TransactionService; } });
// Note: VectorService types to be exported once service is finalized
//# sourceMappingURL=index.js.map