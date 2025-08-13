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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const storage_service_1 = require("../infrastructure/storage/storage.service");
const local_storage_service_1 = require("../infrastructure/local-storage/local-storage.service");
const walrus_service_1 = require("../infrastructure/walrus/walrus.service");
let StorageController = class StorageController {
    storageService;
    localStorageService;
    walrusService;
    constructor(storageService, localStorageService, walrusService) {
        this.storageService = storageService;
        this.localStorageService = localStorageService;
        this.walrusService = walrusService;
    }
    async retrieveContent(blobId) {
        try {
            console.log(`Retrieving content for blob: ${blobId}`);
            if (blobId.startsWith('local_') || blobId.startsWith('demo_')) {
                console.log(`Fetching from local storage: ${blobId}`);
                const content = await this.localStorageService.retrieveContent(blobId);
                return { content, success: true };
            }
            else {
                console.log(`Fetching from Walrus: ${blobId}`);
                const buffer = await this.walrusService.downloadFile(blobId);
                return { content: buffer.toString('utf-8'), success: true };
            }
        }
        catch (error) {
            console.error(`Error retrieving content for blob ${blobId}:`, error);
            return { content: '', success: false };
        }
    }
    async checkExists(blobId) {
        try {
            let exists = false;
            if (blobId.startsWith('local_') || blobId.startsWith('demo_')) {
                exists = await this.localStorageService.exists(blobId);
            }
            else {
                try {
                    await this.walrusService.downloadFile(blobId);
                    exists = true;
                }
                catch (error) {
                    exists = false;
                }
            }
            return { exists };
        }
        catch (error) {
            console.error(`Error checking existence for blob ${blobId}:`, error);
            return { exists: false };
        }
    }
    async getStorageStats() {
        try {
            const stats = await this.storageService.getStats();
            return stats;
        }
        catch (error) {
            console.error('Error getting storage stats:', error);
            throw new common_1.HttpException('Failed to get storage statistics', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Get)('retrieve/:blobId'),
    __param(0, (0, common_1.Param)('blobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "retrieveContent", null);
__decorate([
    (0, common_1.Get)('exists/:blobId'),
    __param(0, (0, common_1.Param)('blobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "checkExists", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getStorageStats", null);
exports.StorageController = StorageController = __decorate([
    (0, common_1.Controller)('storage'),
    __metadata("design:paramtypes", [storage_service_1.StorageService,
        local_storage_service_1.LocalStorageService,
        walrus_service_1.WalrusService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map