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
        const messageBytes = await this.sealService.getSessionKeyMessage(dto.userAddress);
        const message = Buffer.from(messageBytes).toString('hex');
        return { message };
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
exports.SealController = SealController = __decorate([
    (0, common_1.Controller)('seal'),
    __metadata("design:paramtypes", [seal_service_1.SealService])
], SealController);
//# sourceMappingURL=seal.controller.js.map