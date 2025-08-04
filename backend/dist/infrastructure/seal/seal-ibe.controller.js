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
exports.SealIBEController = void 0;
const common_1 = require("@nestjs/common");
const seal_ibe_service_1 = require("./seal-ibe.service");
const grant_permission_dto_1 = require("./dto/grant-permission.dto");
const identity_types_1 = require("./identity-types");
let SealIBEController = class SealIBEController {
    sealIBEService;
    constructor(sealIBEService) {
        this.sealIBEService = sealIBEService;
    }
    async grantPermission(dto) {
        return this.sealIBEService.grantAppPermission(dto.userAddress, dto.appAddress, dto.dataIds, dto.expiresAt);
    }
    async revokePermission(permissionId, dto) {
        const success = await this.sealIBEService.revokeAppPermission(dto.userAddress, permissionId);
        return { success };
    }
    async listPermissions(userAddress) {
        return this.sealIBEService.listAppPermissions(userAddress);
    }
    async encryptForApp(dto) {
        const result = await this.sealIBEService.encryptForApp(dto.content, dto.userAddress, dto.appAddress);
        return {
            success: true,
            encrypted: result.encrypted,
            backupKey: result.backupKey,
            appAddress: result.appAddress,
            identityString: result.identityString,
            category: dto.category
        };
    }
    async decryptAsApp(dto) {
        try {
            const identityOptions = {
                type: identity_types_1.IdentityType.APP,
                userAddress: dto.userAddress,
                targetAddress: dto.appAddress
            };
            const decrypted = await this.sealIBEService.decryptWithIdentity(dto.encryptedContent, identityOptions, dto.appSignature);
            return {
                success: true,
                content: decrypted
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async encryptWithTimelock(body) {
        const result = await this.sealIBEService.encryptWithTimelock(body.content, body.userAddress, body.expiresAt);
        return {
            success: true,
            encrypted: result.encrypted,
            backupKey: result.backupKey,
            expiresAt: result.expiresAt,
            identityString: result.identityString
        };
    }
    async getAppSessionMessage(dto) {
        const messageBytes = await this.sealIBEService.getSessionKeyMessage(dto.appAddress);
        const message = Buffer.from(messageBytes).toString('hex');
        return { message };
    }
};
exports.SealIBEController = SealIBEController;
__decorate([
    (0, common_1.Post)('permissions/grant'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [grant_permission_dto_1.GrantAppPermissionDto]),
    __metadata("design:returntype", Promise)
], SealIBEController.prototype, "grantPermission", null);
__decorate([
    (0, common_1.Delete)('permissions/:permissionId'),
    __param(0, (0, common_1.Param)('permissionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, grant_permission_dto_1.RevokeAppPermissionDto]),
    __metadata("design:returntype", Promise)
], SealIBEController.prototype, "revokePermission", null);
__decorate([
    (0, common_1.Get)('permissions'),
    __param(0, (0, common_1.Query)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SealIBEController.prototype, "listPermissions", null);
__decorate([
    (0, common_1.Post)('encrypt-for-app'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [grant_permission_dto_1.EncryptForAppDto]),
    __metadata("design:returntype", Promise)
], SealIBEController.prototype, "encryptForApp", null);
__decorate([
    (0, common_1.Post)('decrypt-as-app'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [grant_permission_dto_1.DecryptAsAppDto]),
    __metadata("design:returntype", Promise)
], SealIBEController.prototype, "decryptAsApp", null);
__decorate([
    (0, common_1.Post)('encrypt-timelock'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealIBEController.prototype, "encryptWithTimelock", null);
__decorate([
    (0, common_1.Post)('app-session-message'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealIBEController.prototype, "getAppSessionMessage", null);
exports.SealIBEController = SealIBEController = __decorate([
    (0, common_1.Controller)('seal/ibe'),
    __metadata("design:paramtypes", [seal_ibe_service_1.SealIBEService])
], SealIBEController);
//# sourceMappingURL=seal-ibe.controller.js.map