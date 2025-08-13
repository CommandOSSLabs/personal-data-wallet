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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CachedWalrusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedWalrusService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const walrus_service_1 = require("./walrus.service");
const node_cache_1 = __importDefault(require("node-cache"));
let CachedWalrusService = CachedWalrusService_1 = class CachedWalrusService {
    walrusService;
    configService;
    logger = new common_1.Logger(CachedWalrusService_1.name);
    contentCache;
    constructor(walrusService, configService) {
        this.walrusService = walrusService;
        this.configService = configService;
        const ttl = configService.get('WALRUS_CACHE_TTL', 30 * 60);
        const checkperiod = configService.get('WALRUS_CACHE_CHECK_PERIOD', 60);
        this.contentCache = new node_cache_1.default({
            stdTTL: ttl,
            checkperiod,
            useClones: false,
            maxKeys: 10000
        });
        this.logger.log(`Initialized Walrus cache with TTL: ${ttl}s, check period: ${checkperiod}s`);
    }
    getAdminAddress() {
        return this.walrusService.getAdminAddress();
    }
    async uploadContent(content, ownerAddress, epochs, additionalTags) {
        const blobId = await this.walrusService.uploadContent(content, ownerAddress, epochs, additionalTags);
        this.contentCache.set(blobId, content);
        this.logger.debug(`Cached content for blob ID: ${blobId}`);
        return blobId;
    }
    async retrieveContent(blobId) {
        const cachedContent = this.contentCache.get(blobId);
        if (cachedContent) {
            this.logger.debug(`Cache hit for blob ID: ${blobId}`);
            return cachedContent;
        }
        this.logger.debug(`Cache miss for blob ID: ${blobId}, fetching from Walrus`);
        try {
            const content = await this.walrusService.retrieveContent(blobId);
            this.contentCache.set(blobId, content);
            return content;
        }
        catch (error) {
            this.logger.error(`Error retrieving content from Walrus: ${error.message}`);
            throw error;
        }
    }
    async getFileTags(blobId) {
        return this.walrusService.getFileTags(blobId);
    }
    async verifyUserAccess(blobId, userAddress) {
        return this.walrusService.verifyUserAccess(blobId, userAddress);
    }
    async uploadFile(buffer, filename, ownerAddress, epochs, additionalTags) {
        const blobId = await this.walrusService.uploadFile(buffer, filename, ownerAddress, epochs, additionalTags);
        return blobId;
    }
    async downloadFile(blobId) {
        return this.walrusService.downloadFile(blobId);
    }
    async deleteContent(blobId, userAddress) {
        this.contentCache.del(blobId);
        return this.walrusService.deleteContent(blobId, userAddress);
    }
    getCacheStats() {
        return this.contentCache.getStats();
    }
    clearCache() {
        this.contentCache.flushAll();
        this.logger.log('Walrus content cache cleared');
    }
};
exports.CachedWalrusService = CachedWalrusService;
exports.CachedWalrusService = CachedWalrusService = CachedWalrusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [walrus_service_1.WalrusService,
        config_1.ConfigService])
], CachedWalrusService);
//# sourceMappingURL=cached-walrus.service.js.map