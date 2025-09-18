"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryModule = void 0;
const common_1 = require("@nestjs/common");
const memory_controller_1 = require("./memory.controller");
const memory_ingestion_service_1 = require("./memory-ingestion/memory-ingestion.service");
const memory_query_service_1 = require("./memory-query/memory-query.service");
const memory_index_service_1 = require("./memory-index/memory-index.service");
const classifier_service_1 = require("./classifier/classifier.service");
const embedding_service_1 = require("./embedding/embedding.service");
const graph_service_1 = require("./graph/graph.service");
const hnsw_index_service_1 = require("./hnsw-index/hnsw-index.service");
const infrastructure_module_1 = require("../infrastructure/infrastructure.module");
let MemoryModule = class MemoryModule {
};
exports.MemoryModule = MemoryModule;
exports.MemoryModule = MemoryModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => infrastructure_module_1.InfrastructureModule)],
        controllers: [memory_controller_1.MemoryController],
        providers: [
            memory_ingestion_service_1.MemoryIngestionService,
            memory_query_service_1.MemoryQueryService,
            memory_index_service_1.MemoryIndexService,
            classifier_service_1.ClassifierService,
            embedding_service_1.EmbeddingService,
            graph_service_1.GraphService,
            hnsw_index_service_1.HnswIndexService
        ],
        exports: [
            memory_ingestion_service_1.MemoryIngestionService,
            memory_query_service_1.MemoryQueryService,
            classifier_service_1.ClassifierService,
            embedding_service_1.EmbeddingService,
            hnsw_index_service_1.HnswIndexService,
            graph_service_1.GraphService
        ]
    })
], MemoryModule);
//# sourceMappingURL=memory.module.js.map