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
exports.SealTestController = void 0;
const common_1 = require("@nestjs/common");
const seal_simple_service_1 = require("./seal-simple.service");
let SealTestController = class SealTestController {
    sealSimpleService;
    constructor(sealSimpleService) {
        this.sealSimpleService = sealSimpleService;
    }
    async getSessionMessage(address) {
        const message = await this.sealSimpleService.getSessionKeyMessage(address);
        return {
            message: Buffer.from(message).toString('hex'),
            messageUtf8: Buffer.from(message).toString('utf8'),
        };
    }
    async encrypt(body) {
        const result = await this.sealSimpleService.encryptForUser(body.content, body.userAddress);
        return result;
    }
    async decrypt(body) {
        try {
            const decrypted = await this.sealSimpleService.decryptForUser(body.encrypted, body.userAddress, body.signature);
            return {
                success: true,
                decrypted,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async testFlow(body) {
        return await this.sealSimpleService.testCompleteFlow(body.userAddress, body.signature);
    }
};
exports.SealTestController = SealTestController;
__decorate([
    (0, common_1.Get)('session/:address'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SealTestController.prototype, "getSessionMessage", null);
__decorate([
    (0, common_1.Post)('encrypt'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealTestController.prototype, "encrypt", null);
__decorate([
    (0, common_1.Post)('decrypt'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealTestController.prototype, "decrypt", null);
__decorate([
    (0, common_1.Post)('test-flow'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SealTestController.prototype, "testFlow", null);
exports.SealTestController = SealTestController = __decorate([
    (0, common_1.Controller)('seal-test'),
    __metadata("design:paramtypes", [seal_simple_service_1.SealSimpleService])
], SealTestController);
//# sourceMappingURL=seal-test.controller.js.map