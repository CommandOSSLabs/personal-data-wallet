"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryController = void 0;
const common_1 = require("@nestjs/common");
const memory_ingestion_service_1 = require("./memory-ingestion/memory-ingestion.service");
const memory_query_service_1 = require("./memory-query/memory-query.service");
const memory_index_service_1 = require("./memory-index/memory-index.service");
const create_memory_dto_1 = require("./dto/create-memory.dto");
const search_memory_dto_1 = require("./dto/search-memory.dto");
const update_memory_dto_1 = require("./dto/update-memory.dto");
const memory_context_dto_1 = require("./dto/memory-context.dto");
const memory_index_dto_1 = require("./dto/memory-index.dto");
const process_memory_dto_1 = require("./dto/process-memory.dto");
const save_memory_dto_1 = require("./dto/save-memory.dto");
const prepare_index_dto_1 = require("./dto/prepare-index.dto");
const register_index_dto_1 = require("./dto/register-index.dto");
let MemoryController = class MemoryController {
    memoryIngestionService;
    memoryQueryService;
    memoryIndexService;
    constructor(memoryIngestionService, memoryQueryService, memoryIndexService) {
        this.memoryIngestionService = memoryIngestionService;
        this.memoryQueryService = memoryQueryService;
        this.memoryIndexService = memoryIndexService;
    }
    async getMemories(userAddress) {
        return this.memoryQueryService.getUserMemories(userAddress);
    }
    async createMemory(createMemoryDto) {
        return this.memoryIngestionService.processNewMemory(createMemoryDto);
    }
    async saveApprovedMemory(saveMemoryDto) {
        return this.memoryIngestionService.processApprovedMemory(saveMemoryDto);
    }
    async searchMemories(searchMemoryDto) {
        return this.memoryQueryService.searchMemories(searchMemoryDto.query, searchMemoryDto.userAddress, searchMemoryDto.category, searchMemoryDto.k);
    }
    async deleteMemory(memoryId, userAddress) {
        return this.memoryQueryService.deleteMemory(memoryId, userAddress);
    }
    async updateMemory(memoryId, updateMemoryDto) {
        return this.memoryIngestionService.updateMemory(memoryId, updateMemoryDto.content, updateMemoryDto.userAddress);
    }
    async getMemoryContext(memoryContextDto) {
        return this.memoryQueryService.getMemoryContext(memoryContextDto.query_text, memoryContextDto.user_address, memoryContextDto.user_signature, memoryContextDto.k);
    }
    async getMemoryStats(userAddress) {
        return this.memoryQueryService.getMemoryStats(userAddress);
    }
    async getMemoryContent(hash) {
        return this.memoryQueryService.getMemoryContentByHash(hash);
    }
    async indexMemory(memoryIndexDto) {
        return this.memoryIngestionService.indexMemory(memoryIndexDto);
    }
    async processMemory(processDto) {
        return this.memoryIngestionService.processMemory(processDto);
    }
    async prepareIndex(prepareIndexDto) {
        return this.memoryIndexService.prepareIndexForCreation(prepareIndexDto.userAddress);
    }
    async registerIndex(registerIndexDto) {
        return this.memoryIndexService.registerMemoryIndex(registerIndexDto.userAddress, registerIndexDto.indexId);
    }
    async getBatchStats() {
        return this.memoryIngestionService.getBatchStats();
    }
    async forceFlush(userAddress) {
        return this.memoryIngestionService.forceFlushUser(userAddress);
    }
};
exports.MemoryController = MemoryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getMemories", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_memory_dto_1.CreateMemoryDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "createMemory", null);
__decorate([
    (0, common_1.Post)('save-approved'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_memory_dto_1.SaveMemoryDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "saveApprovedMemory", null);
__decorate([
    (0, common_1.Post)('search'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_memory_dto_1.SearchMemoryDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "searchMemories", null);
__decorate([
    (0, common_1.Delete)(':memoryId'),
    __param(0, (0, common_1.Param)('memoryId')),
    __param(1, (0, common_1.Body)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "deleteMemory", null);
__decorate([
    (0, common_1.Put)(':memoryId'),
    __param(0, (0, common_1.Param)('memoryId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_memory_dto_1.UpdateMemoryDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "updateMemory", null);
__decorate([
    (0, common_1.Post)('context'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [memory_context_dto_1.MemoryContextDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getMemoryContext", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getMemoryStats", null);
__decorate([
    (0, common_1.Get)('content/:hash'),
    __param(0, (0, common_1.Param)('hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getMemoryContent", null);
__decorate([
    (0, common_1.Post)('index'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [memory_index_dto_1.MemoryIndexDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "indexMemory", null);
__decorate([
    (0, common_1.Post)('process'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [process_memory_dto_1.ProcessMemoryDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "processMemory", null);
__decorate([
    (0, common_1.Post)('prepare-index'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [prepare_index_dto_1.PrepareIndexDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "prepareIndex", null);
__decorate([
    (0, common_1.Post)('register-index'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_index_dto_1.RegisterIndexDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "registerIndex", null);
__decorate([
    (0, common_1.Get)('batch-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getBatchStats", null);
__decorate([
    (0, common_1.Post)('force-flush/:userAddress'),
    __param(0, (0, common_1.Param)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "forceFlush", null);
exports.MemoryController = MemoryController = __decorate([
    (0, common_1.Controller)('memories'),
    __metadata("design:paramtypes", [memory_ingestion_service_1.MemoryIngestionService,
        memory_query_service_1.MemoryQueryService,
        memory_index_service_1.MemoryIndexService])
], MemoryController);
//# sourceMappingURL=memory.controller.js.map