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
var MemoryQueryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryQueryService = void 0;
const common_1 = require("@nestjs/common");
const embedding_service_1 = require("../embedding/embedding.service");
const graph_service_1 = require("../graph/graph.service");
const hnsw_index_service_1 = require("../hnsw-index/hnsw-index.service");
const seal_service_1 = require("../../infrastructure/seal/seal.service");
const sui_service_1 = require("../../infrastructure/sui/sui.service");
const walrus_service_1 = require("../../infrastructure/walrus/walrus.service");
const memory_ingestion_service_1 = require("../memory-ingestion/memory-ingestion.service");
const gemini_service_1 = require("../../infrastructure/gemini/gemini.service");
let MemoryQueryService = MemoryQueryService_1 = class MemoryQueryService {
    embeddingService;
    graphService;
    hnswIndexService;
    sealService;
    suiService;
    walrusService;
    memoryIngestionService;
    geminiService;
    logger = new common_1.Logger(MemoryQueryService_1.name);
    constructor(embeddingService, graphService, hnswIndexService, sealService, suiService, walrusService, memoryIngestionService, geminiService) {
        this.embeddingService = embeddingService;
        this.graphService = graphService;
        this.hnswIndexService = hnswIndexService;
        this.sealService = sealService;
        this.suiService = suiService;
        this.walrusService = walrusService;
        this.memoryIngestionService = memoryIngestionService;
        this.geminiService = geminiService;
    }
    async getUserMemories(userAddress) {
        try {
            const memoryRecords = await this.suiService.getUserMemories(userAddress);
            const memories = [];
            for (const record of memoryRecords) {
                try {
                    const encryptedContent = await this.walrusService.retrieveContent(record.blobId);
                    memories.push({
                        id: record.id,
                        content: encryptedContent,
                        category: record.category,
                        timestamp: new Date().toISOString(),
                        isEncrypted: true,
                        owner: userAddress,
                        walrusHash: record.blobId
                    });
                }
                catch (error) {
                    this.logger.error(`Error retrieving memory ${record.id}: ${error.message}`);
                }
            }
            return {
                memories,
                success: true
            };
        }
        catch (error) {
            this.logger.error(`Error getting user memories: ${error.message}`);
            return { memories: [], success: false };
        }
    }
    async findRelevantMemories(query, userAddress, limit = 5) {
        try {
            let indexBlobId;
            let graphBlobId;
            try {
                const memoryIndex = await this.suiService.getMemoryIndex(userAddress);
                indexBlobId = memoryIndex.indexBlobId;
                graphBlobId = memoryIndex.graphBlobId;
            }
            catch (error) {
                this.logger.log(`No memory index found for user ${userAddress}`);
                return [];
            }
            const { vector } = await this.embeddingService.embedText(query);
            const { index } = await this.hnswIndexService.loadIndex(indexBlobId, userAddress);
            const searchResults = this.hnswIndexService.searchIndex(index, vector, limit * 2);
            const graph = await this.graphService.loadGraph(graphBlobId, userAddress);
            const entityToVectorMap = this.memoryIngestionService.getEntityToVectorMap(userAddress);
            const expandedVectorIds = this.graphService.findRelatedEntities(graph, searchResults.ids, entityToVectorMap, 1).map(entityId => entityToVectorMap[entityId])
                .filter(Boolean);
            const allVectorIds = [...new Set([...searchResults.ids, ...expandedVectorIds])];
            const memories = [];
            const seenBlobIds = new Set();
            for (const vectorId of allVectorIds.slice(0, limit)) {
                try {
                    const memoryObjects = await this.suiService.getMemoriesWithVectorId(userAddress, vectorId);
                    for (const memory of memoryObjects) {
                        if (seenBlobIds.has(memory.blobId))
                            continue;
                        seenBlobIds.add(memory.blobId);
                        const encryptedContent = await this.walrusService.retrieveContent(memory.blobId);
                        const decryptedContent = await this.sealService.decrypt(encryptedContent, userAddress);
                        memories.push(decryptedContent);
                        if (memories.length >= limit)
                            break;
                    }
                }
                catch (error) {
                    this.logger.error(`Error retrieving memory for vector ID ${vectorId}: ${error.message}`);
                    continue;
                }
            }
            return memories;
        }
        catch (error) {
            this.logger.error(`Error finding relevant memories: ${error.message}`);
            return [];
        }
    }
    async searchMemories(query, userAddress, category, k = 5) {
        try {
            const { vector } = await this.embeddingService.embedText(query);
            let indexBlobId;
            try {
                const memoryIndex = await this.suiService.getMemoryIndex(userAddress);
                indexBlobId = memoryIndex.indexBlobId;
            }
            catch (error) {
                this.logger.log(`No memory index found for user ${userAddress}`);
                return { results: [] };
            }
            const { index } = await this.hnswIndexService.loadIndex(indexBlobId, userAddress);
            const searchResults = this.hnswIndexService.searchIndex(index, vector, k * 2);
            const results = [];
            for (const vectorId of searchResults.ids) {
                try {
                    const memoryObjects = await this.suiService.getMemoriesWithVectorId(userAddress, vectorId);
                    for (const memoryObj of memoryObjects) {
                        if (category && memoryObj.category !== category)
                            continue;
                        const encryptedContent = await this.walrusService.retrieveContent(memoryObj.blobId);
                        results.push({
                            id: memoryObj.id,
                            content: encryptedContent,
                            category: memoryObj.category,
                            timestamp: new Date().toISOString(),
                            isEncrypted: true,
                            owner: userAddress,
                            similarity_score: searchResults.distances[searchResults.ids.indexOf(vectorId)],
                            walrusHash: memoryObj.blobId
                        });
                        if (results.length >= k)
                            break;
                    }
                    if (results.length >= k)
                        break;
                }
                catch (error) {
                    this.logger.error(`Error retrieving memory for vector ID ${vectorId}: ${error.message}`);
                }
            }
            return { results };
        }
        catch (error) {
            this.logger.error(`Error searching memories: ${error.message}`);
            return { results: [] };
        }
    }
    async deleteMemory(memoryId, userAddress) {
        try {
            const memory = await this.suiService.getMemory(memoryId);
            if (memory.owner !== userAddress) {
                throw new common_1.NotFoundException('Memory not found or you are not the owner');
            }
            await this.suiService.deleteMemory(memoryId, userAddress);
            try {
                await this.walrusService.deleteContent(memory.blobId, userAddress);
            }
            catch (walrusError) {
                this.logger.warn(`Failed to delete from Walrus: ${walrusError.message}`);
            }
            return {
                message: 'Memory deleted successfully',
                success: true
            };
        }
        catch (error) {
            this.logger.error(`Error deleting memory: ${error.message}`);
            return {
                message: `Failed to delete memory: ${error.message}`,
                success: false
            };
        }
    }
    async getMemoryContext(queryText, userAddress, userSignature, k = 5) {
        try {
            const startTime = Date.now();
            const relevantMemoriesContent = await this.findRelevantMemories(queryText, userAddress, k);
            const relevantMemories = relevantMemoriesContent.map((content, index) => ({
                id: `mem-${index}`,
                content,
                category: 'auto',
                timestamp: new Date().toISOString(),
                isEncrypted: false,
                owner: userAddress
            }));
            let context = '';
            if (relevantMemories.length > 0) {
                const memoryTexts = relevantMemories.map(m => m.content).join('\n\n');
                const prompt = `
          Summarize the following user memories to provide context for answering a question.
          Be concise but informative, focusing only on details relevant to the query: "${queryText}"
          
          MEMORIES:
          ${memoryTexts}
          
          SUMMARY:
        `;
                context = await this.geminiService.generateContent('gemini-1.5-flash', [{ role: 'user', content: prompt }]);
            }
            const endTime = Date.now();
            return {
                context,
                relevant_memories: relevantMemories,
                query_metadata: {
                    query_time_ms: endTime - startTime,
                    memories_found: relevantMemories.length,
                    context_length: context.length
                }
            };
        }
        catch (error) {
            this.logger.error(`Error getting memory context: ${error.message}`);
            return {
                context: '',
                relevant_memories: [],
                query_metadata: {
                    query_time_ms: 0,
                    memories_found: 0,
                    context_length: 0
                }
            };
        }
    }
    async getMemoryContentByHash(hash) {
        try {
            const encryptedContent = await this.walrusService.retrieveContent(hash);
            return {
                content: encryptedContent,
                success: true
            };
        }
        catch (error) {
            this.logger.error(`Error getting memory content by hash ${hash}: ${error.message}`);
            return {
                content: '',
                success: false
            };
        }
    }
    async getMemoryStats(userAddress) {
        try {
            const { memories } = await this.getUserMemories(userAddress);
            const categories = {};
            let totalSize = 0;
            for (const memory of memories) {
                if (categories[memory.category]) {
                    categories[memory.category] += 1;
                }
                else {
                    categories[memory.category] = 1;
                }
                totalSize += memory.content.length;
            }
            return {
                total_memories: memories.length,
                categories,
                storage_used_bytes: totalSize,
                last_updated: new Date().toISOString(),
                success: true
            };
        }
        catch (error) {
            this.logger.error(`Error getting memory stats: ${error.message}`);
            return {
                total_memories: 0,
                categories: {},
                storage_used_bytes: 0,
                last_updated: new Date().toISOString(),
                success: false
            };
        }
    }
};
exports.MemoryQueryService = MemoryQueryService;
exports.MemoryQueryService = MemoryQueryService = MemoryQueryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [embedding_service_1.EmbeddingService,
        graph_service_1.GraphService,
        hnsw_index_service_1.HnswIndexService,
        seal_service_1.SealService,
        sui_service_1.SuiService,
        walrus_service_1.WalrusService,
        memory_ingestion_service_1.MemoryIngestionService,
        gemini_service_1.GeminiService])
], MemoryQueryService);
//# sourceMappingURL=memory-query.service.js.map