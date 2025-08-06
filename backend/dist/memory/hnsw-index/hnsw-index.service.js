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
const walrus_service_1 = require("../../infrastructure/walrus/walrus.service");
let HnswIndexService = HnswIndexService_1 = class HnswIndexService {
    walrusService;
    logger = new common_1.Logger(HnswIndexService_1.name);
    constructor(walrusService) {
        this.walrusService = walrusService;
    }
    async createIndex(dimensions = 512, maxElements = 10000) {
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
    addVectorToIndex(index, id, vector) {
        try {
            index.addPoint(vector, id);
        }
        catch (error) {
            this.logger.error(`Error adding vector to index: ${error.message}`);
            throw new Error(`Vector addition error: ${error.message}`);
        }
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
            const adminAddress = this.walrusService.getAdminAddress();
            const blobId = await this.walrusService.uploadFile(serialized, `index_${userAddress}_${Date.now()}.hnsw`, adminAddress, 12, {
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
            if (userAddress) {
                const hasAccess = await this.walrusService.verifyUserAccess(blobId, userAddress);
                if (!hasAccess) {
                    this.logger.warn(`User ${userAddress} attempted to access index without permission: ${blobId}`);
                }
            }
            const serialized = await this.walrusService.downloadFile(blobId);
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
    __metadata("design:paramtypes", [walrus_service_1.WalrusService])
], HnswIndexService);
//# sourceMappingURL=hnsw-index.service.js.map