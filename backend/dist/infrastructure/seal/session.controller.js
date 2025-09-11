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
var SessionController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = exports.CreateSessionResponse = exports.SessionStatusResponse = exports.SignSessionDto = exports.CreateSessionDto = void 0;
const common_1 = require("@nestjs/common");
const session_key_service_1 = require("./session-key.service");
class CreateSessionDto {
    userAddress;
    packageId;
    ttlMinutes;
}
exports.CreateSessionDto = CreateSessionDto;
class SignSessionDto {
    userAddress;
    signature;
}
exports.SignSessionDto = SignSessionDto;
class SessionStatusResponse {
    exists;
    signed;
    expired;
    userAddress;
    expiresAt;
}
exports.SessionStatusResponse = SessionStatusResponse;
class CreateSessionResponse {
    sessionId;
    personalMessage;
    expiresAt;
}
exports.CreateSessionResponse = CreateSessionResponse;
let SessionController = SessionController_1 = class SessionController {
    sessionKeyService;
    logger = new common_1.Logger(SessionController_1.name);
    constructor(sessionKeyService) {
        this.sessionKeyService = sessionKeyService;
    }
    async createSession(createSessionDto) {
        try {
            this.logger.log(`Creating session for user: ${createSessionDto.userAddress}`);
            const request = {
                userAddress: createSessionDto.userAddress,
                packageId: createSessionDto.packageId,
                ttlMinutes: createSessionDto.ttlMinutes,
            };
            const result = await this.sessionKeyService.createSession(request);
            const ttlMinutes = createSessionDto.ttlMinutes || 10;
            const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
            return {
                sessionId: result.sessionId,
                personalMessage: Buffer.from(result.personalMessage).toString('base64'),
                expiresAt,
            };
        }
        catch (error) {
            this.logger.error('Failed to create session', error);
            throw new common_1.HttpException(`Failed to create session: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async signSession(sessionId, signSessionDto) {
        try {
            this.logger.log(`Signing session ${sessionId} for user: ${signSessionDto.userAddress}`);
            const request = {
                userAddress: signSessionDto.userAddress,
                signature: signSessionDto.signature,
            };
            await this.sessionKeyService.signSession(sessionId, request);
            return {
                success: true,
                message: 'Session signed successfully',
            };
        }
        catch (error) {
            this.logger.error('Failed to sign session', error);
            throw new common_1.HttpException(`Failed to sign session: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getSessionStatus(sessionId) {
        try {
            const status = await this.sessionKeyService.getSessionStatus(sessionId);
            return status;
        }
        catch (error) {
            this.logger.error('Failed to get session status', error);
            throw new common_1.HttpException(`Failed to get session status: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSessionStats() {
        try {
            return this.sessionKeyService.getStats();
        }
        catch (error) {
            this.logger.error('Failed to get session stats', error);
            throw new common_1.HttpException(`Failed to get session stats: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.SessionController = SessionController;
__decorate([
    (0, common_1.Post)('request'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateSessionDto]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)('verify/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SignSessionDto]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "signSession", null);
__decorate([
    (0, common_1.Get)('status/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getSessionStatus", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getSessionStats", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "healthCheck", null);
exports.SessionController = SessionController = SessionController_1 = __decorate([
    (0, common_1.Controller)('api/seal/session'),
    __metadata("design:paramtypes", [session_key_service_1.SessionKeyService])
], SessionController);
//# sourceMappingURL=session.controller.js.map