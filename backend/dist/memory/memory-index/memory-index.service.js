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
var MemoryIndexService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryIndexService = void 0;
const common_1 = require("@nestjs/common");
const hnsw_index_service_1 = require("../hnsw-index/hnsw-index.service");
const graph_service_1 = require("../graph/graph.service");
const sui_service_1 = require("../../infrastructure/sui/sui.service");
let MemoryIndexService = MemoryIndexService_1 = class MemoryIndexService {
    hnswIndexService;
    graphService;
    suiService;
    logger = new common_1.Logger(MemoryIndexService_1.name);
    userIndexMap = new Map();
    constructor(hnswIndexService, graphService, suiService) {
        this.hnswIndexService = hnswIndexService;
        this.graphService = graphService;
        this.suiService = suiService;
    }
    async prepareIndexForCreation(userAddress) {
        try {
            if (!userAddress || userAddress === 'undefined') {
                return {
                    success: false,
                    message: 'User address is required'
                };
            }
            this.logger.log(`Preparing memory index data for user ${userAddress}`);
            const { index } = await this.hnswIndexService.createIndex();
            const indexBlobId = await this.hnswIndexService.saveIndex(index, userAddress);
            const graph = this.graphService.createGraph();
            const graphBlobId = await this.graphService.saveGraph(graph, userAddress);
            this.logger.log(`Prepared index data - indexBlobId: ${indexBlobId}, graphBlobId: ${graphBlobId}`);
            return {
                success: true,
                indexBlobId,
                graphBlobId,
                message: 'Index data prepared for on-chain creation'
            };
        }
        catch (error) {
            this.logger.error(`Error preparing index: ${error.message}`);
            return {
                success: false,
                message: `Failed to prepare index: ${error.message}`
            };
        }
    }
    async registerMemoryIndex(userAddress, indexId) {
        try {
            const memoryIndex = await this.suiService.getMemoryIndex(indexId);
            if (memoryIndex.owner !== userAddress) {
                return {
                    success: false,
                    message: 'Index does not belong to the specified user'
                };
            }
            this.userIndexMap.set(userAddress, indexId);
            this.logger.log(`Registered memory index ${indexId} for user ${userAddress}`);
            return {
                success: true,
                message: 'Memory index registered successfully'
            };
        }
        catch (error) {
            this.logger.error(`Error registering index: ${error.message}`);
            return {
                success: false,
                message: `Failed to register index: ${error.message}`
            };
        }
    }
    getIndexId(userAddress) {
        return this.userIndexMap.get(userAddress);
    }
    setIndexId(userAddress, indexId) {
        this.userIndexMap.set(userAddress, indexId);
    }
    clearIndexId(userAddress) {
        this.userIndexMap.delete(userAddress);
    }
    async getOrLoadIndex(userAddress) {
        try {
            let indexId = this.userIndexMap.get(userAddress);
            if (indexId) {
                try {
                    const memoryIndex = await this.suiService.getMemoryIndex(indexId);
                    if (memoryIndex.owner !== userAddress) {
                        this.logger.warn(`Index ${indexId} does not belong to user ${userAddress}`);
                        this.userIndexMap.delete(userAddress);
                        indexId = undefined;
                    }
                    else {
                        const indexResult = await this.hnswIndexService.loadIndex(memoryIndex.indexBlobId, userAddress);
                        const graph = await this.graphService.loadGraph(memoryIndex.graphBlobId, userAddress);
                        return {
                            index: indexResult.index,
                            graph,
                            indexId,
                            indexBlobId: memoryIndex.indexBlobId,
                            graphBlobId: memoryIndex.graphBlobId,
                            version: memoryIndex.version,
                            exists: true
                        };
                    }
                }
                catch (error) {
                    this.logger.warn(`Failed to load index ${indexId}: ${error.message}`);
                    this.userIndexMap.delete(userAddress);
                    indexId = undefined;
                }
            }
            try {
                const memoryIndex = await this.suiService.getMemoryIndex(userAddress);
                indexId = userAddress;
                this.userIndexMap.set(userAddress, indexId);
                const shouldAttemptWalrusLoad = true;
                if (shouldAttemptWalrusLoad) {
                    try {
                        this.logger.log(`Attempting to load existing index for user ${userAddress} from Walrus`);
                        const indexResult = await this.hnswIndexService.loadIndex(memoryIndex.indexBlobId, userAddress);
                        const graph = await this.graphService.loadGraph(memoryIndex.graphBlobId, userAddress);
                        this.logger.log(`Successfully loaded existing index for user ${userAddress}`);
                        return {
                            index: indexResult.index,
                            graph,
                            indexId,
                            indexBlobId: memoryIndex.indexBlobId,
                            graphBlobId: memoryIndex.graphBlobId,
                            version: memoryIndex.version,
                            exists: true
                        };
                    }
                    catch (loadError) {
                        this.logger.warn(`Failed to load index data for user ${userAddress}: ${loadError.message}`);
                        if (loadError.message.includes('Walrus') ||
                            loadError.message.includes('fetch failed') ||
                            loadError.message.includes('network') ||
                            loadError.message.includes('timeout') ||
                            loadError.message.includes('404') ||
                            loadError.message.includes('unavailable') ||
                            loadError.message.includes('permission')) {
                            this.logger.warn(`Walrus connectivity/permission issue for user ${userAddress}. Will create new local index instead.`);
                        }
                        this.userIndexMap.delete(userAddress);
                    }
                }
                else {
                    this.logger.log(`Skipping Walrus load due to recent failures, creating new local index for user ${userAddress}`);
                    this.userIndexMap.delete(userAddress);
                }
            }
            catch (error) {
                this.logger.debug(`No index found for user ${userAddress}: ${error.message}`);
            }
            try {
                const userIndexes = await this.suiService.getUserMemoryIndexes(userAddress);
                if (userIndexes && userIndexes.length > 0) {
                    const latestIndex = userIndexes[0];
                    indexId = latestIndex.id;
                    this.userIndexMap.set(userAddress, indexId);
                    const indexResult = await this.hnswIndexService.loadIndex(latestIndex.indexBlobId, userAddress);
                    const graph = await this.graphService.loadGraph(latestIndex.graphBlobId, userAddress);
                    this.logger.log(`Found existing index ${indexId} for user ${userAddress}`);
                    return {
                        index: indexResult.index,
                        graph,
                        indexId,
                        indexBlobId: latestIndex.indexBlobId,
                        graphBlobId: latestIndex.graphBlobId,
                        version: latestIndex.version,
                        exists: true
                    };
                }
            }
            catch (error) {
                this.logger.debug(`Failed to find user indexes: ${error.message}`);
            }
            return {
                exists: false
            };
        }
        catch (error) {
            this.logger.error(`Error getting or loading index: ${error.message}`);
            return {
                exists: false
            };
        }
    }
};
exports.MemoryIndexService = MemoryIndexService;
exports.MemoryIndexService = MemoryIndexService = MemoryIndexService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hnsw_index_service_1.HnswIndexService,
        graph_service_1.GraphService,
        sui_service_1.SuiService])
], MemoryIndexService);
//# sourceMappingURL=memory-index.service.js.map