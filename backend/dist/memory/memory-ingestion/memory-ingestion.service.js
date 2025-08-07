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
const storage_service_1 = require("../../infrastructure/storage/storage.service");
const gemini_service_1 = require("../../infrastructure/gemini/gemini.service");
const config_1 = require("@nestjs/config");
let MemoryIngestionService = MemoryIngestionService_1 = class MemoryIngestionService {
    classifierService;
    embeddingService;
    graphService;
    hnswIndexService;
    memoryIndexService;
    sealService;
    suiService;
    storageService;
    geminiService;
    configService;
    logger = new common_1.Logger(MemoryIngestionService_1.name);
    entityToVectorMap = {};
    nextVectorId = {};
    constructor(classifierService, embeddingService, graphService, hnswIndexService, memoryIndexService, sealService, suiService, storageService, geminiService, configService) {
        this.classifierService = classifierService;
        this.embeddingService = embeddingService;
        this.graphService = graphService;
        this.hnswIndexService = hnswIndexService;
        this.memoryIndexService = memoryIndexService;
        this.sealService = sealService;
        this.suiService = suiService;
        this.storageService = storageService;
        this.geminiService = geminiService;
        this.configService = configService;
    }
    isDemoMode() {
        return this.configService.get('USE_DEMO_STORAGE', true) ||
            this.configService.get('NODE_ENV') === 'demo';
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
            let graph;
            let indexId;
            let indexBlobId;
            let graphBlobId;
            let currentVersion = 1;
            if (indexData.exists && indexData.indexId && indexData.indexBlobId && indexData.graphBlobId && indexData.version) {
                graph = indexData.graph;
                indexId = indexData.indexId;
                indexBlobId = indexData.indexBlobId;
                graphBlobId = indexData.graphBlobId;
                currentVersion = indexData.version;
                await this.hnswIndexService.getOrLoadIndexCached(memoryDto.userAddress, indexBlobId);
            }
            else {
                this.logger.log(`No existing index found for user ${memoryDto.userAddress}, creating new index in memory`);
                await this.ensureIndexInCache(memoryDto.userAddress);
                graph = this.graphService.createGraph();
            }
            const { vector } = await this.embeddingService.embedText(memoryDto.content);
            const vectorId = this.getNextVectorId(memoryDto.userAddress);
            this.hnswIndexService.addVectorToIndexBatched(memoryDto.userAddress, vectorId, vector);
            const extraction = await this.graphService.extractEntitiesAndRelationships(memoryDto.content);
            const entityToVectorMap = this.getEntityToVectorMap(memoryDto.userAddress);
            extraction.entities.forEach(entity => {
                entityToVectorMap[entity.id] = vectorId;
            });
            graph = this.graphService.addToGraph(graph, extraction.entities, extraction.relationships);
            let contentToStore = memoryDto.content;
            if (!this.isDemoMode()) {
                contentToStore = await this.sealService.encrypt(memoryDto.content, memoryDto.userAddress);
            }
            else {
                this.logger.log('Demo mode: Skipping encryption');
            }
            const contentBlobId = await this.storageService.uploadContent(contentToStore, memoryDto.userAddress);
            if (graph && graphBlobId) {
                const newGraphBlobId = await this.graphService.saveGraph(graph, memoryDto.userAddress);
                this.logger.log(`Updated graph saved to Walrus: ${newGraphBlobId}`);
            }
            else {
                this.logger.log(`New user - graph will be created when first batch is processed`);
            }
            let memoryId;
            if (!this.isDemoMode()) {
                memoryId = await this.suiService.createMemoryRecord(memoryDto.userAddress, memoryDto.category, vectorId, contentBlobId);
            }
            else {
                memoryId = `demo_memory_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
                this.logger.log(`Demo mode: Generated memory ID ${memoryId} (no blockchain record)`);
            }
            this.logger.log(`Memory created successfully with ID: ${memoryId}. Vector queued for batch processing.`);
            return {
                success: true,
                memoryId,
                message: 'Memory saved successfully. Search index will be updated shortly.'
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
            let graph;
            let indexId;
            let indexBlobId;
            let graphBlobId;
            let currentVersion = 1;
            if (indexData.exists && indexData.indexId && indexData.indexBlobId && indexData.graphBlobId && indexData.version) {
                graph = indexData.graph;
                indexId = indexData.indexId;
                indexBlobId = indexData.indexBlobId;
                graphBlobId = indexData.graphBlobId;
                currentVersion = indexData.version;
                await this.hnswIndexService.getOrLoadIndexCached(userAddress, indexBlobId);
            }
            else {
                this.logger.log(`No existing index found for user ${userAddress}, creating new index in memory`);
                await this.ensureIndexInCache(userAddress);
                graph = this.graphService.createGraph();
            }
            const { vector } = await this.embeddingService.embedText(content);
            const vectorId = this.getNextVectorId(userAddress);
            this.hnswIndexService.addVectorToIndexBatched(userAddress, vectorId, vector);
            const extraction = await this.graphService.extractEntitiesAndRelationships(content);
            const entityToVectorMap = this.getEntityToVectorMap(userAddress);
            extraction.entities.forEach(entity => {
                entityToVectorMap[entity.id] = vectorId;
            });
            graph = this.graphService.addToGraph(graph, extraction.entities, extraction.relationships);
            let contentToStore = content;
            if (!this.isDemoMode()) {
                contentToStore = await this.sealService.encrypt(content, userAddress);
            }
            else {
                this.logger.log('Demo mode: Skipping encryption for conversation processing');
            }
            const contentBlobId = await this.storageService.uploadContent(contentToStore, userAddress);
            if (graph && graphBlobId) {
                const newGraphBlobId = await this.graphService.saveGraph(graph, userAddress);
                this.logger.log(`Updated graph saved to Walrus: ${newGraphBlobId}`);
            }
            else {
                this.logger.log(`New user - graph will be created when first batch is processed`);
            }
            this.logger.log(`Memory processed and queued for batch index update for user ${userAddress}`);
            return {
                success: true,
                vectorId,
                blobId: contentBlobId,
                message: 'Memory processed successfully. Search index will be updated shortly.'
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
    async ensureIndexInCache(userAddress) {
        try {
            const cachedIndex = await this.hnswIndexService.getOrLoadIndexCached(userAddress);
            if (!cachedIndex) {
                this.logger.log(`Creating new in-memory index for user ${userAddress}`);
                const { index } = await this.hnswIndexService.createIndex();
                this.hnswIndexService.addIndexToCache(userAddress, index);
                this.logger.log(`New index created and cached for user ${userAddress}`);
            }
            else {
                this.logger.log(`Using existing cached index for user ${userAddress}`);
            }
        }
        catch (error) {
            this.logger.error(`Error ensuring index in cache for user ${userAddress}: ${error.message}`);
            if (error.message.includes('Walrus') ||
                error.message.includes('fetch failed') ||
                error.message.includes('network') ||
                error.message.includes('timeout')) {
                this.logger.warn(`Walrus connectivity issue detected. Memory features will be temporarily unavailable.`);
                throw new Error('Memory storage is temporarily unavailable due to network connectivity issues. ' +
                    'Your chat will continue to work normally, but memories cannot be saved at this time. ' +
                    'Please try again later.');
            }
            throw error;
        }
    }
    getBatchStats() {
        return this.hnswIndexService.getCacheStats();
    }
    async forceFlushUser(userAddress) {
        try {
            await this.hnswIndexService.forceFlush(userAddress);
            return {
                success: true,
                message: `Successfully flushed pending vectors for user ${userAddress}`
            };
        }
        catch (error) {
            this.logger.error(`Error force flushing user ${userAddress}: ${error.message}`);
            return {
                success: false,
                message: `Failed to flush vectors: ${error.message}`
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
        storage_service_1.StorageService,
        gemini_service_1.GeminiService,
        config_1.ConfigService])
], MemoryIngestionService);
//# sourceMappingURL=memory-ingestion.service.js.map