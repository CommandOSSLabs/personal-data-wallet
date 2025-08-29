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
exports.SealController = void 0;
const common_1 = require("@nestjs/common");
const seal_service_1 = require("./seal.service");
let SealController = class SealController {
    sealService;
    constructor(sealService) {
        this.sealService = sealService;
    }
    async getSessionMessage(dto) {
        try {
            const messageBytes = await this.sealService.getSessionKeyMessage(dto.userAddress);
            const message = Buffer.from(messageBytes).toString('hex');
            return { message };
        }
        catch (error) {
            throw new Error(`Failed to generate session message: ${error.message}`);
        }
    }
    async encryptContent(dto) {
        try {
            const result = await this.sealService.encrypt(dto.content, dto.userAddress);
            return result;
        }
        catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }
    async decryptContent(dto) {
        try {
            const content = await this.sealService.decrypt(dto.encryptedContent, dto.userAddress, dto.signature);
            return { content };
        }
        catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
    async createAllowlist(dto) {
        try {
            return {
                message: `To create allowlist "${dto.name}", call the transaction: ${this.sealService.packageId}::seal_access_control::create_allowlist_entry with argument: "${dto.name}"`
            };
        }
        catch (error) {
            throw new Error(`Failed to create allowlist instructions: ${error.message}`);
        }
    }
    async encryptForAllowlist(dto) {
        try {
            const result = await this.sealService.encryptForAllowlist(dto.content, dto.allowlistId, dto.userAddress);
            return result;
        }
        catch (error) {
            throw new Error(`Allowlist encryption failed: ${error.message}`);
        }
    }
    async decryptFromAllowlist(dto) {
        try {
            const content = await this.sealService.decryptFromAllowlist(dto.encryptedContent, dto.allowlistId, dto.userAddress, dto.signature);
            return { content };
        }
        catch (error) {
            throw new Error(`Allowlist decryption failed: ${error.message}`);
        }
    }
    getConfig() {
        return {
            packageId: this.sealService.packageId,
            moduleName: this.sealService.moduleName,
            network: this.sealService.network,
            threshold: this.sealService.threshold,
            mode: 'standard'
        };
    }
};
exports.SealController = SealController;
__decorate([
    (0, common_1.Post)('session-message'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealController.prototype, "getSessionMessage", null);
__decorate([
    (0, common_1.Post)('encrypt'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealController.prototype, "encryptContent", null);
__decorate([
    (0, common_1.Post)('decrypt'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealController.prototype, "decryptContent", null);
__decorate([
    (0, common_1.Post)('allowlist/create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealController.prototype, "createAllowlist", null);
__decorate([
    (0, common_1.Post)('allowlist/encrypt'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealController.prototype, "encryptForAllowlist", null);
__decorate([
    (0, common_1.Post)('allowlist/decrypt'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealController.prototype, "decryptFromAllowlist", null);
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], SealController.prototype, "getConfig", null);
exports.SealController = SealController = __decorate([
    (0, common_1.Controller)('seal'),
    __metadata("design:paramtypes", [seal_service_1.SealService])
], SealController);
//# sourceMappingURL=seal.controller.js.map