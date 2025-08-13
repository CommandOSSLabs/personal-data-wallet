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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const local_storage_service_1 = require("../local-storage/local-storage.service");
const walrus_service_1 = require("../walrus/walrus.service");
let StorageService = StorageService_1 = class StorageService {
    localStorageService;
    walrusService;
    configService;
    logger = new common_1.Logger(StorageService_1.name);
    walrusAvailable = false;
    lastWalrusCheck = 0;
    WALRUS_CHECK_INTERVAL = 5 * 60 * 1000;
    constructor(localStorageService, walrusService, configService) {
        this.localStorageService = localStorageService;
        this.walrusService = walrusService;
        this.configService = configService;
        const useLocalForDemo = this.configService.get('USE_LOCAL_STORAGE_FOR_DEMO', true);
        if (useLocalForDemo) {
            this.logger.log('Demo mode: Using local storage as primary storage');
            this.walrusAvailable = false;
        }
    }
    async isWalrusAvailable() {
        const useLocalForDemo = this.configService.get('USE_LOCAL_STORAGE_FOR_DEMO', true);
        if (useLocalForDemo) {
            return false;
        }
        const now = Date.now();
        if (now - this.lastWalrusCheck < this.WALRUS_CHECK_INTERVAL) {
            return this.walrusAvailable;
        }
        try {
            this.walrusAvailable = false;
            this.logger.debug('Walrus availability check: UNAVAILABLE (demo mode)');
        }
        catch (error) {
            this.walrusAvailable = false;
            this.logger.debug('Walrus availability check: UNAVAILABLE');
        }
        this.lastWalrusCheck = now;
        return this.walrusAvailable;
    }
    async uploadContent(content, ownerAddress, epochs = 12, additionalTags = {}) {
        const result = await this.storeContent(content, `content_${Date.now()}.txt`, { owner: ownerAddress, ...additionalTags });
        if (!result.success) {
            throw new Error(result.message || 'Failed to store content');
        }
        return result.blobId;
    }
    async storeContent(content, filename, tags = {}) {
        const walrusAvailable = await this.isWalrusAvailable();
        if (walrusAvailable) {
            try {
                this.logger.log(`Storing content to Walrus: ${filename}`);
                const blobId = await this.walrusService.uploadContent(content, tags.owner || 'unknown', 12, tags);
                return {
                    blobId,
                    storageType: 'walrus',
                    success: true,
                    message: 'Content stored in Walrus'
                };
            }
            catch (error) {
                this.logger.warn(`Walrus storage failed, falling back to local: ${error.message}`);
            }
        }
        try {
            this.logger.log(`Storing content to local storage: ${filename}`);
            const blobId = await this.localStorageService.storeContent(content, filename, tags);
            return {
                blobId,
                storageType: 'local',
                success: true,
                message: 'Content stored locally'
            };
        }
        catch (error) {
            this.logger.error(`Local storage failed: ${error.message}`);
            return {
                blobId: '',
                storageType: 'local',
                success: false,
                message: `Storage failed: ${error.message}`
            };
        }
    }
    async storeFile(buffer, filename, tags = {}) {
        const walrusAvailable = await this.isWalrusAvailable();
        if (walrusAvailable) {
            try {
                this.logger.log(`Storing file to Walrus: ${filename}`);
                const blobId = await this.walrusService.uploadFile(buffer, filename, tags.owner || 'unknown', 12, tags);
                return {
                    blobId,
                    storageType: 'walrus',
                    success: true,
                    message: 'File stored in Walrus'
                };
            }
            catch (error) {
                this.logger.warn(`Walrus storage failed, falling back to local: ${error.message}`);
            }
        }
        try {
            this.logger.log(`Storing file to local storage: ${filename}`);
            const blobId = await this.localStorageService.storeFile(buffer, filename, tags);
            return {
                blobId,
                storageType: 'local',
                success: true,
                message: 'File stored locally'
            };
        }
        catch (error) {
            this.logger.error(`Local storage failed: ${error.message}`);
            return {
                blobId: '',
                storageType: 'local',
                success: false,
                message: `Storage failed: ${error.message}`
            };
        }
    }
    async retrieveFile(blobId) {
        if (blobId.startsWith('local_')) {
            this.logger.log(`Retrieving file from local storage: ${blobId}`);
            return await this.localStorageService.retrieveFile(blobId);
        }
        else {
            try {
                this.logger.log(`Retrieving file from Walrus: ${blobId}`);
                return await this.walrusService.downloadFile(blobId);
            }
            catch (error) {
                this.logger.warn(`Walrus retrieval failed, trying local storage: ${error.message}`);
                return await this.localStorageService.retrieveFile(blobId);
            }
        }
    }
    async retrieveContent(blobId) {
        if (blobId.startsWith('local_')) {
            return await this.localStorageService.retrieveContent(blobId);
        }
        else {
            const buffer = await this.retrieveFile(blobId);
            return buffer.toString('utf-8');
        }
    }
    async exists(blobId) {
        if (blobId.startsWith('local_')) {
            return await this.localStorageService.exists(blobId);
        }
        else {
            try {
                await this.walrusService.downloadFile(blobId);
                return true;
            }
            catch (error) {
                return false;
            }
        }
    }
    async getStats() {
        const localStats = await this.localStorageService.getStats();
        return {
            local: localStats,
            walrus: {
                available: this.walrusAvailable,
                lastCheck: new Date(this.lastWalrusCheck)
            }
        };
    }
    forceLocalStorage() {
        this.walrusAvailable = false;
        this.logger.log('Forced to use local storage only');
    }
    getAdminAddress() {
        return this.walrusService.getAdminAddress();
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [local_storage_service_1.LocalStorageService,
        walrus_service_1.WalrusService,
        config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map