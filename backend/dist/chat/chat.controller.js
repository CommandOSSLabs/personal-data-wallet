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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const chat_service_1 = require("./chat.service");
const chat_message_dto_1 = require("./dto/chat-message.dto");
const create_session_dto_1 = require("./dto/create-session.dto");
const save_summary_dto_1 = require("./dto/save-summary.dto");
const add_message_dto_1 = require("./dto/add-message.dto");
const update_session_title_dto_1 = require("./dto/update-session-title.dto");
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async getSessions(userAddress) {
        return this.chatService.getSessions(userAddress);
    }
    async getSession(sessionId, userAddress) {
        return this.chatService.getSession(sessionId, userAddress);
    }
    async createSession(createSessionDto) {
        return this.chatService.createSession(createSessionDto);
    }
    async addMessage(sessionId, addMessageDto) {
        return this.chatService.addMessage(sessionId, addMessageDto);
    }
    async deleteSession(sessionId, userAddress) {
        return this.chatService.deleteSession(sessionId, userAddress);
    }
    async updateSessionTitle(sessionId, updateTitleDto) {
        return this.chatService.updateSessionTitle(sessionId, updateTitleDto.userAddress, updateTitleDto.title);
    }
    async saveSummary(saveSummaryDto) {
        return this.chatService.saveSummary(saveSummaryDto);
    }
    streamChat(messageDto) {
        return this.chatService.streamChatResponse(messageDto);
    }
    async sendMessage(messageDto) {
        return this.chatService.sendMessage(messageDto);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('sessions'),
    __param(0, (0, common_1.Query)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getSessions", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Query)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)('sessions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_session_dto_1.CreateSessionDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/messages'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_message_dto_1.AddMessageDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addMessage", null);
__decorate([
    (0, common_1.Delete)('sessions/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteSession", null);
__decorate([
    (0, common_1.Put)('sessions/:sessionId/title'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_session_title_dto_1.UpdateSessionTitleDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "updateSessionTitle", null);
__decorate([
    (0, common_1.Post)('summary'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_summary_dto_1.SaveSummaryDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "saveSummary", null);
__decorate([
    (0, common_1.Sse)('stream'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_message_dto_1.ChatMessageDto]),
    __metadata("design:returntype", rxjs_1.Observable)
], ChatController.prototype, "streamChat", null);
__decorate([
    (0, common_1.Post)(''),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_message_dto_1.ChatMessageDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('api/chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map