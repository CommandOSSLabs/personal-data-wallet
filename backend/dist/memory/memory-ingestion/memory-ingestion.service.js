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
var MemoryIngestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryIngestionService = void 0;
const common_1 = require("@nestjs/common");
const classifier_service_1 = require("../classifier/classifier.service");
const embedding_service_1 = require("../embedding/embedding.service");
const graph_service_1 = require("../graph/graph.service");
const hnsw_index_service_1 = require("../hnsw-index/hnsw-index.service");
const seal_service_1 = require("../../infrastructure/seal/seal.service");
const sui_service_1 = require("../../infrastructure/sui/sui.service");
const walrus_service_1 = require("../../infrastructure/walrus/walrus.service");
const gemini_service_1 = require("../../infrastructure/gemini/gemini.service");
let MemoryIngestionService = MemoryIngestionService_1 = class MemoryIngestionService {
    classifierService;
    embeddingService;
    graphService;
    hnswIndexService;
    sealService;
    suiService;
    walrusService;
    geminiService;
    logger = new common_1.Logger(MemoryIngestionService_1.name);
    entityToVectorMap = {};
    nextVectorId = {};
    constructor(classifierService, embeddingService, graphService, hnswIndexService, sealService, suiService, walrusService, geminiService) {
        this.classifierService = classifierService;
        this.embeddingService = embeddingService;
        this.graphService = graphService;
        this.hnswIndexService = hnswIndexService;
        this.sealService = sealService;
        this.suiService = suiService;
        this.walrusService = walrusService;
        this.geminiService = geminiService;
    }
    getNextVectorId(userAddress) {
        if (!this.nextVectorId[userAddress]) {
            this.nextVectorId[userAddress] = 1;
        }
        return this.nextVectorId[userAddress]++;
    }
    getEntityToVectorMap(userAddress) {
        if (!this.entityToVectorMap[userAddress]) {
            this.entityToVectorMap[userAddress] = {};
        }
        return this.entityToVectorMap[userAddress];
    }
    async processConversation(userMessage, assistantResponse, userAddress) {
        try {
            const classification = await this.classifierService.shouldSaveMemory(userMessage);
            if (!classification.shouldSave) {
                this.logger.log(`Message not classified as a memory: ${userMessage}`);
                return { memoryStored: false };
            }
            const memoryDto = {
                content: userMessage,
                category: classification.category,
                userAddress
            };
            const result = await this.processNewMemory(memoryDto);
            return {
                memoryStored: result.success,
                memoryId: result.memoryId
            };
        }
        catch (error) {
            this.logger.error(`Error processing conversation: ${error.message}`);
            return { memoryStored: false };
        }
    }
    async processNewMemory(memoryDto) {
        try {
            let indexId;
            let indexBlobId;
            let graphBlobId;
            let currentVersion = 0;
            let index;
            let graph;
            try {
                const memoryIndex = await this.suiService.getMemoryIndex(memoryDto.userAddress);
                indexId = memoryDto.userAddress;
                indexBlobId = memoryIndex.indexBlobId;
                graphBlobId = memoryIndex.graphBlobId;
                currentVersion = memoryIndex.version;
                const indexResult = await this.hnswIndexService.loadIndex(indexBlobId);
                index = indexResult.index;
                graph = await this.graphService.loadGraph(graphBlobId);
            }
            catch (error) {
                this.logger.log(`Creating new memory index for user ${memoryDto.userAddress}`);
                const newIndexResult = await this.hnswIndexService.createIndex();
                index = newIndexResult.index;
                indexBlobId = await this.hnswIndexService.saveIndex(index);
                graph = this.graphService.createGraph();
                graphBlobId = await this.graphService.saveGraph(graph);
                indexId = await this.suiService.createMemoryIndex(memoryDto.userAddress, indexBlobId, graphBlobId);
            }
            const { vector } = await this.embeddingService.embedText(memoryDto.content);
            const vectorId = this.getNextVectorId(memoryDto.userAddress);
            this.hnswIndexService.addVectorToIndex(index, vectorId, vector);
            const extraction = await this.graphService.extractEntitiesAndRelationships(memoryDto.content);
            const entityToVectorMap = this.getEntityToVectorMap(memoryDto.userAddress);
            extraction.entities.forEach(entity => {
                entityToVectorMap[entity.id] = vectorId;
            });
            graph = this.graphService.addToGraph(graph, extraction.entities, extraction.relationships);
            const encryptedContent = await this.sealService.encrypt(memoryDto.content, memoryDto.userAddress);
            const contentBlobId = await this.walrusService.uploadContent(encryptedContent);
            const newIndexBlobId = await this.hnswIndexService.saveIndex(index);
            const newGraphBlobId = await this.graphService.saveGraph(graph);
            await this.suiService.updateMemoryIndex(indexId, memoryDto.userAddress, currentVersion, newIndexBlobId, newGraphBlobId);
            const memoryId = await this.suiService.createMemoryRecord(memoryDto.userAddress, memoryDto.category, vectorId, contentBlobId);
            return {
                success: true,
                memoryId,
                message: 'Memory processed successfully'
            };
        }
        catch (error) {
            this.logger.error(`Error processing new memory: ${error.message}`);
            return {
                success: false,
                message: `Failed to process memory: ${error.message}`
            };
        }
    }
    async updateMemory(memoryId, content, userAddress) {
        try {
            const memory = await this.suiService.getMemory(memoryId);
            if (memory.owner !== userAddress) {
                throw new Error('You do not own this memory');
            }
            return {
                success: true,
                message: 'Memory updated successfully'
            };
        }
        catch (error) {
            this.logger.error(`Error updating memory: ${error.message}`);
            return {
                success: false,
                message: `Failed to update memory: ${error.message}`
            };
        }
    }
};
exports.MemoryIngestionService = MemoryIngestionService;
exports.MemoryIngestionService = MemoryIngestionService = MemoryIngestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [classifier_service_1.ClassifierService,
        embedding_service_1.EmbeddingService,
        graph_service_1.GraphService,
        hnsw_index_service_1.HnswIndexService,
        seal_service_1.SealService,
        sui_service_1.SuiService,
        walrus_service_1.WalrusService,
        gemini_service_1.GeminiService])
], MemoryIngestionService);
//# sourceMappingURL=memory-ingestion.service.js.map