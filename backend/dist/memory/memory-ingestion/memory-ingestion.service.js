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
const memory_index_service_1 = require("../memory-index/memory-index.service");
const seal_service_1 = require("../../infrastructure/seal/seal.service");
const sui_service_1 = require("../../infrastructure/sui/sui.service");
const walrus_service_1 = require("../../infrastructure/walrus/walrus.service");
const gemini_service_1 = require("../../infrastructure/gemini/gemini.service");
let MemoryIngestionService = MemoryIngestionService_1 = class MemoryIngestionService {
    classifierService;
    embeddingService;
    graphService;
    hnswIndexService;
    memoryIndexService;
    sealService;
    suiService;
    walrusService;
    geminiService;
    logger = new common_1.Logger(MemoryIngestionService_1.name);
    entityToVectorMap = {};
    nextVectorId = {};
    constructor(classifierService, embeddingService, graphService, hnswIndexService, memoryIndexService, sealService, suiService, walrusService, geminiService) {
        this.classifierService = classifierService;
        this.embeddingService = embeddingService;
        this.graphService = graphService;
        this.hnswIndexService = hnswIndexService;
        this.memoryIndexService = memoryIndexService;
        this.sealService = sealService;
        this.suiService = suiService;
        this.walrusService = walrusService;
        this.geminiService = geminiService;
    }
    getNextVectorId(userAddress) {
        if (!this.nextVectorId[userAddress]) {
            this.nextVectorId[userAddress] = 1;
        }
        const vectorId = this.nextVectorId[userAddress];
        this.nextVectorId[userAddress]++;
        return vectorId;
    }
    getEntityToVectorMap(userAddress) {
        if (!this.entityToVectorMap[userAddress]) {
            this.entityToVectorMap[userAddress] = {};
        }
        return this.entityToVectorMap[userAddress];
    }
    async processConversation(userMessage, assistantResponse, userAddress) {
        try {
            const conversation = `User: ${userMessage}\nAssistant: ${assistantResponse}`;
            const classificationResult = await this.classifierService.shouldSaveMemory(conversation);
            const shouldRemember = classificationResult.shouldSave;
            if (!shouldRemember) {
                return { memoryStored: false };
            }
            const memoryContent = conversation;
            if (!memoryContent || memoryContent.trim() === '') {
                return { memoryStored: false };
            }
            const result = await this.processNewMemory({
                content: memoryContent,
                category: 'conversation',
                userAddress
            });
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
            const indexData = await this.memoryIndexService.getOrLoadIndex(memoryDto.userAddress);
            let index;
            let graph;
            let indexId;
            let indexBlobId;
            let graphBlobId;
            let currentVersion = 1;
            if (indexData.exists && indexData.indexId && indexData.indexBlobId && indexData.graphBlobId && indexData.version) {
                index = indexData.index;
                graph = indexData.graph;
                indexId = indexData.indexId;
                indexBlobId = indexData.indexBlobId;
                graphBlobId = indexData.graphBlobId;
                currentVersion = indexData.version;
            }
            else {
                this.logger.log(`Preparing memory index data for user ${memoryDto.userAddress}`);
                const prepareResult = await this.memoryIndexService.prepareIndexForCreation(memoryDto.userAddress);
                if (!prepareResult.success) {
                    return {
                        success: false,
                        message: prepareResult.message || 'Failed to prepare index data'
                    };
                }
                return {
                    success: false,
                    message: 'Memory index not found. Please create index on-chain first.',
                    requiresIndexCreation: true,
                    indexBlobId: prepareResult.indexBlobId,
                    graphBlobId: prepareResult.graphBlobId
                };
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
            const contentBlobId = await this.walrusService.uploadContent(encryptedContent, memoryDto.userAddress);
            const newIndexBlobId = await this.hnswIndexService.saveIndex(index, memoryDto.userAddress);
            const newGraphBlobId = await this.graphService.saveGraph(graph, memoryDto.userAddress);
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
    async processMemory(processDto) {
        try {
            const { content, userAddress, category = 'general' } = processDto;
            const indexData = await this.memoryIndexService.getOrLoadIndex(userAddress);
            let index;
            let graph;
            let indexId;
            let indexBlobId;
            let graphBlobId;
            let currentVersion = 1;
            if (indexData.exists && indexData.indexId && indexData.indexBlobId && indexData.graphBlobId && indexData.version) {
                index = indexData.index;
                graph = indexData.graph;
                indexId = indexData.indexId;
                indexBlobId = indexData.indexBlobId;
                graphBlobId = indexData.graphBlobId;
                currentVersion = indexData.version;
            }
            else {
                this.logger.log(`Preparing memory index data for user ${userAddress}`);
                const prepareResult = await this.memoryIndexService.prepareIndexForCreation(userAddress);
                if (!prepareResult.success) {
                    return {
                        success: false,
                        message: prepareResult.message || 'Failed to prepare index data'
                    };
                }
                return {
                    success: false,
                    message: 'Memory index not found. Please create index on-chain first.',
                    requiresIndexCreation: true,
                    indexBlobId: prepareResult.indexBlobId,
                    graphBlobId: prepareResult.graphBlobId
                };
            }
            const { vector } = await this.embeddingService.embedText(content);
            const vectorId = this.getNextVectorId(userAddress);
            this.hnswIndexService.addVectorToIndex(index, vectorId, vector);
            const extraction = await this.graphService.extractEntitiesAndRelationships(content);
            const entityToVectorMap = this.getEntityToVectorMap(userAddress);
            extraction.entities.forEach(entity => {
                entityToVectorMap[entity.id] = vectorId;
            });
            graph = this.graphService.addToGraph(graph, extraction.entities, extraction.relationships);
            const encryptedContent = await this.sealService.encrypt(content, userAddress);
            const contentBlobId = await this.walrusService.uploadContent(encryptedContent, userAddress);
            const newIndexBlobId = await this.hnswIndexService.saveIndex(index, userAddress);
            const newGraphBlobId = await this.graphService.saveGraph(graph, userAddress);
            await this.suiService.updateMemoryIndex(indexId, userAddress, currentVersion, newIndexBlobId, newGraphBlobId);
            return {
                success: true,
                vectorId,
                blobId: contentBlobId,
                message: 'Memory processed successfully'
            };
        }
        catch (error) {
            this.logger.error(`Error processing memory: ${error.message}`);
            return {
                success: false,
                message: `Failed to process memory: ${error.message}`
            };
        }
    }
    async indexMemory(indexDto) {
        try {
            const { memoryId, userAddress, category = 'general', walrusHash } = indexDto;
            try {
                const memoryOnChain = await this.suiService.getMemory(memoryId);
                if (memoryOnChain.owner !== userAddress) {
                    return {
                        success: false,
                        message: 'Memory does not belong to the specified user'
                    };
                }
                this.logger.log(`Memory ${memoryId} verified on-chain for user ${userAddress}`);
            }
            catch (error) {
                return {
                    success: false,
                    message: `Failed to verify memory: ${error.message}`
                };
            }
            return {
                success: true,
                message: `Memory ${memoryId} indexed successfully`
            };
        }
        catch (error) {
            this.logger.error(`Error indexing memory: ${error.message}`);
            return {
                success: false,
                message: `Failed to index memory: ${error.message}`
            };
        }
    }
    async updateMemory(memoryId, content, userAddress) {
        try {
            try {
                const memory = await this.suiService.getMemory(memoryId);
                if (memory.owner !== userAddress) {
                    return {
                        success: false,
                        message: 'Memory does not belong to the specified user'
                    };
                }
            }
            catch (error) {
                return {
                    success: false,
                    message: `Failed to verify memory: ${error.message}`
                };
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
    async processApprovedMemory(saveMemoryDto) {
        try {
            const { content, category, userAddress, suiObjectId } = saveMemoryDto;
            if (suiObjectId) {
                this.logger.log(`Using existing memory object ID: ${suiObjectId}`);
                const processResult = await this.processMemory({
                    content,
                    userAddress,
                    category
                });
                if (!processResult.success) {
                    return {
                        success: false,
                        message: processResult.message || 'Failed to process memory content'
                    };
                }
                return {
                    success: true,
                    memoryId: suiObjectId,
                    blobId: processResult.blobId,
                    vectorId: processResult.vectorId,
                    message: 'Memory processed successfully'
                };
            }
            const processResult = await this.processMemory({
                content,
                userAddress,
                category
            });
            if (!processResult.success) {
                return {
                    success: false,
                    message: processResult.message || 'Failed to process memory content'
                };
            }
            return {
                success: true,
                blobId: processResult.blobId,
                vectorId: processResult.vectorId,
                message: 'Memory processed successfully. Create blockchain record with the provided data.'
            };
        }
        catch (error) {
            this.logger.error(`Error processing approved memory: ${error.message}`);
            return {
                success: false,
                message: `Failed to process memory: ${error.message}`
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
        memory_index_service_1.MemoryIndexService,
        seal_service_1.SealService,
        sui_service_1.SuiService,
        walrus_service_1.WalrusService,
        gemini_service_1.GeminiService])
], MemoryIngestionService);
//# sourceMappingURL=memory-ingestion.service.js.map