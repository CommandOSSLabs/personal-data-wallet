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
exports.SealOpenModeController = void 0;
const common_1 = require("@nestjs/common");
const seal_open_mode_service_1 = require("./seal-open-mode.service");
let SealOpenModeController = class SealOpenModeController {
    sealOpenModeService;
    constructor(sealOpenModeService) {
        this.sealOpenModeService = sealOpenModeService;
    }
    async getSessionMessage(dto) {
        const messageBytes = await this.sealOpenModeService.getSessionKeyMessage(dto.packageId, dto.userAddress);
        const message = Buffer.from(messageBytes).toString('hex');
        return { message };
    }
    async encrypt(dto) {
        return await this.sealOpenModeService.encrypt(dto.content, dto.packageId, dto.identity);
    }
    async decrypt(dto) {
        const decrypted = await this.sealOpenModeService.decrypt(dto.encryptedContent, dto.packageId, dto.moduleName, dto.identity, dto.userAddress, dto.signature);
        return { decrypted };
    }
    async batchEncrypt(dto) {
        const resultsMap = await this.sealOpenModeService.batchEncrypt(dto.items);
        const results = Array.from(resultsMap.entries()).map(([id, result]) => ({
            id,
            ...result
        }));
        return { results };
    }
    async testOpenMode(dto) {
        return await this.sealOpenModeService.testOpenMode(dto.packageId, dto.moduleName, dto.userAddress, dto.signature);
    }
    getStatus() {
        return {
            mode: 'open',
            network: process.env.SEAL_NETWORK || 'testnet',
            features: [
                'Any package encryption/decryption',
                'No package restrictions',
                'Single master key operation',
                'Batch operations supported',
            ],
        };
    }
};
exports.SealOpenModeController = SealOpenModeController;
__decorate([
    (0, common_1.Post)('session-message'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealOpenModeController.prototype, "getSessionMessage", null);
__decorate([
    (0, common_1.Post)('encrypt'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealOpenModeController.prototype, "encrypt", null);
__decorate([
    (0, common_1.Post)('decrypt'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealOpenModeController.prototype, "decrypt", null);
__decorate([
    (0, common_1.Post)('batch-encrypt'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealOpenModeController.prototype, "batchEncrypt", null);
__decorate([
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealOpenModeController.prototype, "testOpenMode", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], SealOpenModeController.prototype, "getStatus", null);
exports.SealOpenModeController = SealOpenModeController = __decorate([
    (0, common_1.Controller)('seal/open-mode'),
    __metadata("design:paramtypes", [seal_open_mode_service_1.SealOpenModeService])
], SealOpenModeController);
//# sourceMappingURL=seal-open-mode.controller.js.map