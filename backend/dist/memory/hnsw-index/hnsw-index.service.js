"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HnswIndexService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HnswIndexService = void 0;
const common_1 = require("@nestjs/common");
const hnswlib = __importStar(require("hnswlib-node"));
const fs = __importStar(require("fs"));
const cached_walrus_service_1 = require("../../infrastructure/walrus/cached-walrus.service");
const demo_storage_service_1 = require("../../infrastructure/demo-storage/demo-storage.service");
const config_1 = require("@nestjs/config");
let HnswIndexService = HnswIndexService_1 = class HnswIndexService {
    walrusService;
    demoStorageService;
    configService;
    logger = new common_1.Logger(HnswIndexService_1.name);
    indexCache = new Map();
    batchJobs = new Map();
    BATCH_DELAY_MS = 5000;
    MAX_BATCH_SIZE = 50;
    CACHE_TTL_MS = 30 * 60 * 1000;
    DEFAULT_VECTOR_DIMENSIONS = 768;
    constructor(walrusService, demoStorageService, configService) {
        this.walrusService = walrusService;
        this.demoStorageService = demoStorageService;
        this.configService = configService;
        this.startBatchProcessor();
        this.startCacheCleanup();
    }
    getStorageService() {
        const isDemoMode = this.configService.get('USE_DEMO_STORAGE', true);
        return isDemoMode ? this.demoStorageService : this.walrusService;
    }
    startBatchProcessor() {
        setInterval(async () => {
            await this.processBatchJobs();
        }, this.BATCH_DELAY_MS);
    }
    startCacheCleanup() {
        setInterval(() => {
            this.cleanupCache();
        }, 5 * 60 * 1000);
    }
    cleanupCache() {
        const now = Date.now();
        for (const [userAddress, entry] of this.indexCache.entries()) {
            if (now - entry.lastModified.getTime() > this.CACHE_TTL_MS) {
                this.logger.debug(`Removing stale cache entry for user ${userAddress}`);
                this.indexCache.delete(userAddress);
            }
        }
    }
    async processBatchJobs() {
        const now = Date.now();
        const jobsToProcess = [];
        for (const [userAddress, job] of this.batchJobs.entries()) {
            const timeSinceScheduled = now - job.scheduledAt.getTime();
            const cacheEntry = this.indexCache.get(userAddress);
            if (timeSinceScheduled >= this.BATCH_DELAY_MS ||
                (cacheEntry && cacheEntry.pendingVectors.size >= this.MAX_BATCH_SIZE)) {
                jobsToProcess.push(userAddress);
            }
        }
        for (const userAddress of jobsToProcess) {
            try {
                await this.flushPendingVectors(userAddress);
            }
            catch (error) {
                this.logger.error(`Error processing batch job for user ${userAddress}: ${error.message}`);
            }
        }
    }
    async flushPendingVectors(userAddress) {
        const cacheEntry = this.indexCache.get(userAddress);
        if (!cacheEntry || cacheEntry.pendingVectors.size === 0) {
            return;
        }
        this.logger.log(`Flushing ${cacheEntry.pendingVectors.size} pending vectors for user ${userAddress}`);
        try {
            if (!cacheEntry.index) {
                const firstVector = cacheEntry.pendingVectors.values().next().value;
                const dimensions = firstVector ? firstVector.length : this.DEFAULT_VECTOR_DIMENSIONS;
                this.logger.log(`Creating new index for user ${userAddress} during flush with ${dimensions} dimensions`);
                const newIndex = new hnswlib.HierarchicalNSW('cosine', dimensions);
                newIndex.initIndex(1000);
                cacheEntry.index = newIndex;
            }
            for (const [vectorId, vector] of cacheEntry.pendingVectors.entries()) {
                try {
                    cacheEntry.index.addPoint(vector, vectorId);
                    this.logger.debug(`Added vector ${vectorId} with ${vector.length} dimensions to index for user ${userAddress}`);
                }
                catch (error) {
                    this.logger.error(`Failed to add vector ${vectorId} to index for user ${userAddress}: ${error.message}`);
                    this.logger.error(`Vector dimensions: ${vector.length}, Index dimensions: ${cacheEntry.index.getNumDimensions?.() || 'unknown'}`);
                    throw error;
                }
            }
            const newBlobId = await this.saveIndexToWalrus(cacheEntry.index, userAddress);
            cacheEntry.pendingVectors.clear();
            cacheEntry.isDirty = false;
            cacheEntry.lastModified = new Date();
            cacheEntry.version++;
            this.batchJobs.delete(userAddress);
            this.logger.log(`Successfully flushed vectors for user ${userAddress}, new blob ID: ${newBlobId}`);
            this.onIndexUpdated?.(userAddress, newBlobId, cacheEntry.version);
        }
        catch (error) {
            this.logger.error(`Error flushing vectors for user ${userAddress}: ${error.message}`);
            throw error;
        }
    }
    onIndexUpdated;
    async saveIndexToWalrus(index, userAddress) {
        const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;
        try {
            index.writeIndexSync(tempFilePath);
            const serialized = fs.readFileSync(tempFilePath);
            const storageService = this.getStorageService();
            const adminAddress = storageService.getAdminAddress();
            const blobId = await storageService.uploadFile(serialized, `index_${userAddress}_${Date.now()}.hnsw`, adminAddress, 12, {
                'user-address': userAddress,
                'content-type': 'application/hnsw-index',
                'version': '1.0'
            });
            return blobId;
        }
        finally {
            try {
                fs.unlinkSync(tempFilePath);
            }
            catch (e) {
            }
        }
    }
    async getOrLoadIndexCached(userAddress, indexBlobId) {
        const cacheEntry = this.indexCache.get(userAddress);
        if (cacheEntry && cacheEntry.index) {
            cacheEntry.lastModified = new Date();
            return cacheEntry.index;
        }
        if (indexBlobId) {
            try {
                const index = await this.loadIndexFromWalrus(indexBlobId, userAddress);
                this.indexCache.set(userAddress, {
                    index,
                    lastModified: new Date(),
                    pendingVectors: new Map(),
                    isDirty: false,
                    version: 1
                });
                return index;
            }
            catch (error) {
                this.logger.error(`Error loading index from Walrus: ${error.message}`);
                return null;
            }
        }
        return null;
    }
    addIndexToCache(userAddress, index, version = 1) {
        this.indexCache.set(userAddress, {
            index,
            lastModified: new Date(),
            pendingVectors: new Map(),
            isDirty: false,
            version
        });
        this.logger.log(`Index added to cache for user ${userAddress}`);
    }
    async loadIndexFromWalrus(blobId, userAddress) {
        const storageService = this.getStorageService();
        const buffer = await storageService.downloadFile(blobId);
        const tempFilePath = `./tmp_hnsw_load_${Date.now()}.bin`;
        try {
            fs.writeFileSync(tempFilePath, buffer);
            const index = new hnswlib.HierarchicalNSW('cosine', this.DEFAULT_VECTOR_DIMENSIONS);
            index.readIndexSync(tempFilePath);
            return index;
        }
        finally {
            try {
                fs.unlinkSync(tempFilePath);
            }
            catch (e) {
            }
        }
    }
    async createIndex(dimensions = 768, maxElements = 10000) {
        try {
            this.logger.log(`Creating new HNSW index with dimensions ${dimensions}, max elements ${maxElements}`);
            const index = new hnswlib.HierarchicalNSW('cosine', dimensions);
            index.initIndex(maxElements);
            const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;
            index.writeIndexSync(tempFilePath);
            const serialized = fs.readFileSync(tempFilePath);
            try {
                fs.unlinkSync(tempFilePath);
            }
            catch (e) { }
            return { index, serialized };
        }
        catch (error) {
            this.logger.error(`Error creating index: ${error.message}`);
            throw new Error(`Index creation error: ${error.message}`);
        }
    }
    addVectorToIndexBatched(userAddress, id, vector) {
        try {
            const vectorDimensions = vector.length;
            let cacheEntry = this.indexCache.get(userAddress);
            if (!cacheEntry) {
                this.logger.warn(`No cached index found for user ${userAddress}, creating new index in memory`);
                const newIndex = new hnswlib.HierarchicalNSW('cosine', vectorDimensions);
                newIndex.initIndex(1000);
                cacheEntry = {
                    index: newIndex,
                    lastModified: new Date(),
                    pendingVectors: new Map(),
                    isDirty: true,
                    version: 1
                };
                this.indexCache.set(userAddress, cacheEntry);
                this.logger.log(`Created new in-memory index for user ${userAddress} with ${vectorDimensions} dimensions`);
            }
            if (cacheEntry.index && cacheEntry.index.getNumDimensions && cacheEntry.index.getNumDimensions() !== vectorDimensions) {
                this.logger.error(`Vector dimension mismatch for user ${userAddress}: expected ${cacheEntry.index.getNumDimensions()}, got ${vectorDimensions}`);
                throw new Error(`Vector dimension mismatch: expected ${cacheEntry.index.getNumDimensions()}, got ${vectorDimensions}`);
            }
            cacheEntry.pendingVectors.set(id, vector);
            cacheEntry.isDirty = true;
            cacheEntry.lastModified = new Date();
            let batchJob = this.batchJobs.get(userAddress);
            if (!batchJob) {
                batchJob = {
                    userAddress,
                    vectors: new Map(),
                    scheduledAt: new Date()
                };
                this.batchJobs.set(userAddress, batchJob);
            }
            batchJob.vectors.set(id, vector);
            this.logger.debug(`Vector ${id} queued for batch processing for user ${userAddress}. Pending: ${cacheEntry.pendingVectors.size}`);
            if (cacheEntry.pendingVectors.size >= this.MAX_BATCH_SIZE) {
                this.logger.log(`Batch size limit reached for user ${userAddress}, processing immediately`);
                setImmediate(() => this.flushPendingVectors(userAddress));
            }
        }
        catch (error) {
            this.logger.error(`Error queuing vector for batch processing: ${error.message}`);
            throw new Error(`Vector batching error: ${error.message}`);
        }
    }
    addVectorToIndex(index, id, vector) {
        try {
            index.addPoint(vector, id);
        }
        catch (error) {
            this.logger.error(`Error adding vector to index: ${error.message}`);
            throw new Error(`Vector addition error: ${error.message}`);
        }
    }
    async forceFlush(userAddress) {
        await this.flushPendingVectors(userAddress);
    }
    async searchVectors(userAddress, queryVector, k = 10) {
        const cacheEntry = this.indexCache.get(userAddress);
        if (!cacheEntry || !cacheEntry.index) {
            throw new Error(`No index found for user ${userAddress}`);
        }
        if (cacheEntry.pendingVectors.size > 0) {
            const tempIndex = this.cloneIndex(cacheEntry.index);
            for (const [vectorId, vector] of cacheEntry.pendingVectors.entries()) {
                tempIndex.addPoint(vector, vectorId);
            }
            const result = tempIndex.searchKnn(queryVector, k);
            return {
                ids: result.neighbors,
                distances: result.distances
            };
        }
        else {
            const result = cacheEntry.index.searchKnn(queryVector, k);
            return {
                ids: result.neighbors,
                distances: result.distances
            };
        }
    }
    cloneIndex(originalIndex) {
        const tempFilePath = `./tmp_hnsw_clone_${Date.now()}.bin`;
        try {
            originalIndex.writeIndexSync(tempFilePath);
            const clonedIndex = new hnswlib.HierarchicalNSW('cosine', this.DEFAULT_VECTOR_DIMENSIONS);
            clonedIndex.readIndexSync(tempFilePath);
            return clonedIndex;
        }
        finally {
            try {
                fs.unlinkSync(tempFilePath);
            }
            catch (e) {
            }
        }
    }
    clearUserIndex(userAddress) {
        this.indexCache.delete(userAddress);
        this.batchJobs.delete(userAddress);
        this.logger.log(`Cleared index cache for user ${userAddress}`);
    }
    getCacheStats() {
        const cacheEntries = [];
        let totalPendingVectors = 0;
        for (const [userAddress, entry] of this.indexCache.entries()) {
            const pendingCount = entry.pendingVectors.size;
            totalPendingVectors += pendingCount;
            cacheEntries.push({
                userAddress,
                pendingVectors: pendingCount,
                lastModified: entry.lastModified,
                isDirty: entry.isDirty,
                indexDimensions: entry.index?.getNumDimensions?.() || 'unknown'
            });
        }
        return {
            totalUsers: this.indexCache.size,
            totalPendingVectors,
            activeBatchJobs: this.batchJobs.size,
            cacheEntries
        };
    }
    searchIndex(index, vector, k) {
        try {
            const results = index.searchKnn(vector, k);
            return {
                ids: results.neighbors,
                distances: results.distances
            };
        }
        catch (error) {
            this.logger.error(`Error searching index: ${error.message}`);
            throw new Error(`Index search error: ${error.message}`);
        }
    }
    async saveIndex(index, userAddress) {
        try {
            if (!userAddress || userAddress === 'undefined') {
                throw new Error('User address is required for saving index');
            }
            this.logger.log(`Saving HNSW index for user ${userAddress}`);
            const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;
            index.writeIndexSync(tempFilePath);
            const serialized = fs.readFileSync(tempFilePath);
            try {
                fs.unlinkSync(tempFilePath);
            }
            catch (e) { }
            const storageService = this.getStorageService();
            const adminAddress = storageService.getAdminAddress();
            const blobId = await storageService.uploadFile(serialized, `index_${userAddress}_${Date.now()}.hnsw`, adminAddress, 12, {
                'user-address': userAddress,
                'content-type': 'application/hnsw-index',
                'version': '1.0'
            });
            this.logger.log(`Index saved to Walrus with blobId ${blobId}`);
            this.logger.log('Waiting for blob propagation...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            return blobId;
        }
        catch (error) {
            this.logger.error(`Error saving index: ${error.message}`);
            throw new Error(`Index save error: ${error.message}`);
        }
    }
    async loadIndex(blobId, userAddress) {
        try {
            this.logger.log(`Loading index from blobId: ${blobId}`);
            const storageService = this.getStorageService();
            if (userAddress) {
                const hasAccess = await storageService.verifyUserAccess(blobId, userAddress);
                if (!hasAccess) {
                    this.logger.warn(`User ${userAddress} attempted to access index without permission: ${blobId}`);
                }
            }
            const serialized = await storageService.downloadFile(blobId);
            const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;
            fs.writeFileSync(tempFilePath, serialized);
            const index = new hnswlib.HierarchicalNSW('cosine', 0);
            index.readIndexSync(tempFilePath);
            try {
                fs.unlinkSync(tempFilePath);
            }
            catch (e) { }
            return { index, serialized };
        }
        catch (error) {
            this.logger.error(`Error loading index: ${error.message}`);
            throw new Error(`Index load error: ${error.message}`);
        }
    }
    getIndexSize(index) {
        try {
            return index.getCurrentCount();
        }
        catch (error) {
            this.logger.error(`Error getting index size: ${error.message}`);
            throw new Error(`Index size error: ${error.message}`);
        }
    }
    removeVectorFromIndex(index, id) {
        try {
            index.markDelete(id);
        }
        catch (error) {
            this.logger.error(`Error removing vector from index: ${error.message}`);
            throw new Error(`Vector removal error: ${error.message}`);
        }
    }
};
exports.HnswIndexService = HnswIndexService;
exports.HnswIndexService = HnswIndexService = HnswIndexService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cached_walrus_service_1.CachedWalrusService,
        demo_storage_service_1.DemoStorageService,
        config_1.ConfigService])
], HnswIndexService);
//# sourceMappingURL=hnsw-index.service.js.map