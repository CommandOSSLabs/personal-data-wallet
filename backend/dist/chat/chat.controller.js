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
const chat_service_1 = require("./chat.service");
const chat_message_dto_1 = require("./dto/chat-message.dto");
const create_session_dto_1 = require("./dto/create-session.dto");
const save_summary_dto_1 = require("./dto/save-summary.dto");
const add_message_dto_1 = require("./dto/add-message.dto");
const update_session_title_dto_1 = require("./dto/update-session-title.dto");
const swagger_1 = require("@nestjs/swagger");
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
    async renameSession(sessionId, title, userAddress) {
        return this.chatService.updateSessionTitle(sessionId, userAddress, title);
    }
    async streamChat(messageDto, response) {
        response.setHeader('Content-Type', 'text/event-stream');
        response.setHeader('Cache-Control', 'no-cache');
        response.setHeader('Connection', 'keep-alive');
        response.setHeader('Access-Control-Allow-Origin', '*');
        const observable = this.chatService.streamChatResponse(messageDto);
        observable.subscribe({
            next: (event) => {
                response.write(`data: ${event.data}\n\n`);
            },
            error: (error) => {
                console.error('Streaming error:', error);
                response.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
                response.end();
            },
            complete: () => {
                response.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
                response.end();
            }
        });
    }
    async sendMessage(messageDto) {
        return this.chatService.sendMessage(messageDto);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all chat sessions for a user' }),
    (0, swagger_1.ApiQuery)({ name: 'userAddress', required: true, description: 'The wallet address of the user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns all chat sessions for the user' }),
    __param(0, (0, common_1.Query)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getSessions", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific chat session' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', required: true, description: 'The ID of the chat session' }),
    (0, swagger_1.ApiQuery)({ name: 'userAddress', required: true, description: 'The wallet address of the user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the chat session with messages' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Query)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)('sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new chat session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The session has been successfully created' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_session_dto_1.CreateSessionDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a message to a chat session' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', required: true, description: 'The ID of the chat session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The message has been successfully added' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_message_dto_1.AddMessageDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addMessage", null);
__decorate([
    (0, common_1.Delete)('sessions/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a chat session' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', required: true, description: 'The ID of the chat session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The session has been successfully deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteSession", null);
__decorate([
    (0, common_1.Put)('sessions/:sessionId/title'),
    (0, swagger_1.ApiOperation)({ summary: 'Update the title of a chat session' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', required: true, description: 'The ID of the chat session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The session title has been successfully updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_session_title_dto_1.UpdateSessionTitleDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "updateSessionTitle", null);
__decorate([
    (0, common_1.Post)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Save a summary for a chat session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The summary has been successfully saved' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_summary_dto_1.SaveSummaryDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "saveSummary", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/rename'),
    (0, swagger_1.ApiOperation)({ summary: 'Rename a chat session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session renamed successfully' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)('title')),
    __param(2, (0, common_1.Body)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "renameSession", null);
__decorate([
    (0, common_1.Post)('stream'),
    (0, swagger_1.ApiOperation)({ summary: 'Stream chat responses using Server-Sent Events' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Streaming chat response' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_message_dto_1.ChatMessageDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "streamChat", null);
__decorate([
    (0, common_1.Post)(''),
    (0, swagger_1.ApiOperation)({ summary: 'Send a non-streaming chat message' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chat response generated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_message_dto_1.ChatMessageDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('chat'),
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map