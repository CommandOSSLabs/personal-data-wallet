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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const gemini_service_1 = require("../infrastructure/gemini/gemini.service");
const sui_service_1 = require("../infrastructure/sui/sui.service");
const summarization_service_1 = require("./summarization/summarization.service");
const memory_query_service_1 = require("../memory/memory-query/memory-query.service");
const memory_ingestion_service_1 = require("../memory/memory-ingestion/memory-ingestion.service");
let ChatService = ChatService_1 = class ChatService {
    geminiService;
    suiService;
    memoryQueryService;
    memoryIngestionService;
    summarizationService;
    logger = new common_1.Logger(ChatService_1.name);
    constructor(geminiService, suiService, memoryQueryService, memoryIngestionService, summarizationService) {
        this.geminiService = geminiService;
        this.suiService = suiService;
        this.memoryQueryService = memoryQueryService;
        this.memoryIngestionService = memoryIngestionService;
        this.summarizationService = summarizationService;
    }
    async getSessions(userAddress) {
        try {
            const sessions = await this.suiService.getChatSessions(userAddress);
            return {
                success: true,
                sessions
            };
        }
        catch (error) {
            this.logger.error(`Error getting sessions: ${error.message}`);
            return {
                success: false,
                sessions: [],
                message: `Error: ${error.message}`
            };
        }
    }
    async getSession(sessionId, userAddress) {
        try {
            const rawSession = await this.suiService.getChatSession(sessionId);
            if (rawSession.owner !== userAddress) {
                throw new common_1.NotFoundException('Session not found or you do not have access');
            }
            const session = {
                id: sessionId,
                owner: rawSession.owner,
                title: rawSession.modelName,
                messages: rawSession.messages.map((msg, idx) => ({
                    id: `${sessionId}-${idx}`,
                    content: msg.content,
                    type: msg.role,
                    timestamp: new Date().toISOString()
                })),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                message_count: rawSession.messages.length,
                sui_object_id: sessionId
            };
            return {
                success: true,
                session
            };
        }
        catch (error) {
            this.logger.error(`Error getting session: ${error.message}`);
            return {
                success: false,
                message: `Error: ${error.message}`
            };
        }
    }
    async createSession(createSessionDto) {
        try {
            let sessionId;
            if (createSessionDto.suiObjectId) {
                sessionId = createSessionDto.suiObjectId;
                this.logger.log(`Using existing blockchain session ID: ${sessionId}`);
            }
            else {
                sessionId = await this.suiService.createChatSession(createSessionDto.userAddress, createSessionDto.modelName);
            }
            let rawSession;
            try {
                rawSession = await this.suiService.getChatSession(sessionId);
            }
            catch (error) {
                this.logger.error(`Failed to fetch session data: ${error.message}`);
            }
            const session = {
                id: sessionId,
                owner: rawSession?.owner || createSessionDto.userAddress,
                title: createSessionDto.title || rawSession?.modelName || createSessionDto.modelName,
                messages: rawSession?.messages || [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                message_count: rawSession?.messages?.length || 0,
                sui_object_id: sessionId
            };
            return { success: true, session, sessionId };
        }
        catch (error) {
            this.logger.error(`Error creating chat session: ${error.message}`);
            return { success: false, sessionId: undefined };
        }
    }
    async addMessage(sessionId, messageDto) {
        try {
            await this.suiService.addMessageToSession(sessionId, messageDto.userAddress, messageDto.type, messageDto.content);
            if (messageDto.type === 'user') {
                this.memoryIngestionService.processConversation(messageDto.content, '', messageDto.userAddress).catch(err => this.logger.error(`Memory extraction error: ${err.message}`));
            }
            return {
                success: true,
                message: 'Message added successfully'
            };
        }
        catch (error) {
            this.logger.error(`Error adding message: ${error.message}`);
            return {
                success: false,
                message: `Error: ${error.message}`
            };
        }
    }
    async deleteSession(sessionId, userAddress) {
        try {
            await this.suiService.deleteSession(sessionId, userAddress);
            return {
                success: true,
                message: 'Session deleted successfully'
            };
        }
        catch (error) {
            this.logger.error(`Error deleting session: ${error.message}`);
            return {
                success: false,
                message: `Error: ${error.message}`
            };
        }
    }
    async updateSessionTitle(sessionId, userAddress, newTitle) {
        try {
            await this.suiService.updateSessionTitle(sessionId, userAddress, newTitle);
            return {
                success: true,
                message: 'Session title updated successfully'
            };
        }
        catch (error) {
            this.logger.error(`Error updating session title: ${error.message}`);
            return {
                success: false,
                message: `Error: ${error.message}`
            };
        }
    }
    async indexSession(sessionIndexDto) {
        try {
            const { sessionId, userAddress, title } = sessionIndexDto;
            try {
                const rawSession = await this.suiService.getChatSession(sessionId);
                if (rawSession.owner !== userAddress) {
                    return {
                        success: false,
                        message: 'Session does not belong to the specified user'
                    };
                }
            }
            catch (error) {
                this.logger.error(`Error verifying session: ${error.message}`);
                return {
                    success: false,
                    message: `Failed to verify session ownership: ${error.message}`
                };
            }
            return {
                success: true,
                message: `Session ${sessionId} indexed successfully`
            };
        }
        catch (error) {
            this.logger.error(`Error indexing session: ${error.message}`);
            return {
                success: false,
                message: `Failed to index session: ${error.message}`
            };
        }
    }
    async saveSummary(saveSummaryDto) {
        try {
            const success = await this.suiService.saveSessionSummary(saveSummaryDto.sessionId, saveSummaryDto.userAddress, saveSummaryDto.summary);
            return { success };
        }
        catch (error) {
            this.logger.error(`Error saving summary: ${error.message}`);
            return { success: false };
        }
    }
    streamChatResponse(messageDto) {
        const subject = new rxjs_1.Subject();
        let fullResponse = '';
        let memoryStored = false;
        let memoryId = undefined;
        (async () => {
            try {
                subject.next({
                    data: JSON.stringify({
                        type: 'start',
                        intent: 'CHAT'
                    })
                });
                const sessionId = messageDto.sessionId || messageDto.session_id;
                const userId = messageDto.userId || messageDto.user_id || messageDto.userAddress;
                const content = messageDto.text || messageDto.content;
                const modelName = messageDto.model || messageDto.modelName || 'gemini-1.5-pro';
                if (!sessionId) {
                    throw new Error('Session ID is required for streaming chat');
                }
                if (!userId) {
                    throw new Error('User ID/Address is required for streaming chat');
                }
                if (!content) {
                    throw new Error('Message content is required for streaming chat');
                }
                const chatSession = await this.suiService.getChatSession(sessionId);
                const chatHistory = [...chatSession.messages, { role: 'user', content }];
                let relevantMemories = [];
                if (messageDto.memoryContext) {
                    this.logger.log('Using provided memory context');
                }
                else {
                    relevantMemories = await this.memoryQueryService.findRelevantMemories(content, userId);
                }
                const systemPrompt = this.constructPrompt(chatSession.summary, relevantMemories, messageDto.memoryContext || '');
                const responseStream = this.geminiService.generateContentStream(modelName, chatHistory, systemPrompt);
                responseStream.subscribe({
                    next: (chunk) => {
                        fullResponse += chunk;
                        subject.next({
                            data: JSON.stringify({
                                type: 'chunk',
                                content: chunk
                            })
                        });
                    },
                    error: (err) => {
                        this.logger.error(`Stream error: ${err.message}`);
                        subject.error(err);
                    },
                    complete: async () => {
                        try {
                            const userMessage = messageDto.originalUserMessage || content;
                            await this.suiService.addMessageToSession(sessionId, userId, 'user', userMessage);
                            await this.suiService.addMessageToSession(sessionId, userId, 'assistant', fullResponse);
                            const memoryResult = await this.processCompletedMessage(sessionId, userId, userMessage, fullResponse);
                            memoryStored = memoryResult.memoryStored;
                            memoryId = memoryResult.memoryId;
                            subject.next({
                                data: JSON.stringify({
                                    type: 'end',
                                    content: fullResponse,
                                    intent: 'CHAT',
                                    memoryStored,
                                    memoryId
                                })
                            });
                            subject.complete();
                        }
                        catch (error) {
                            this.logger.error(`Error finalizing chat: ${error.message}`);
                            subject.error(new Error(`Failed to finalize chat: ${error.message}`));
                        }
                    }
                });
            }
            catch (error) {
                this.logger.error(`Error in chat stream: ${error.message}`);
                subject.error(new Error(`Chat stream failed: ${error.message}`));
            }
        })();
        return subject.asObservable();
    }
    async sendMessage(messageDto) {
        try {
            const sessionId = messageDto.sessionId || messageDto.session_id;
            const userId = messageDto.userId || messageDto.user_id || messageDto.userAddress;
            const content = messageDto.text || messageDto.content;
            const modelName = messageDto.model || messageDto.modelName || 'gemini-1.5-pro';
            if (!sessionId) {
                throw new Error('Session ID is required for chat');
            }
            if (!userId) {
                throw new Error('User ID/Address is required for chat');
            }
            if (!content) {
                throw new Error('Message content is required for chat');
            }
            const chatSession = await this.suiService.getChatSession(sessionId);
            const chatHistory = [...chatSession.messages, { role: 'user', content }];
            let relevantMemories = [];
            if (messageDto.memoryContext) {
                this.logger.log('Using provided memory context');
            }
            else {
                relevantMemories = await this.memoryQueryService.findRelevantMemories(content, userId);
            }
            const systemPrompt = this.constructPrompt(chatSession.summary, relevantMemories, messageDto.memoryContext || '');
            const response = await this.geminiService.generateContent(modelName, chatHistory, systemPrompt);
            const userMessage = messageDto.originalUserMessage || content;
            await this.suiService.addMessageToSession(sessionId, userId, 'user', userMessage);
            await this.suiService.addMessageToSession(sessionId, userId, 'assistant', response);
            const memoryResult = await this.processCompletedMessage(sessionId, userId, userMessage, response);
            return {
                response,
                success: true,
                intent: 'CHAT',
                memoryStored: memoryResult.memoryStored,
                memoryId: memoryResult.memoryId
            };
        }
        catch (error) {
            this.logger.error(`Error sending message: ${error.message}`);
            return {
                response: 'Sorry, an error occurred while processing your message.',
                success: false
            };
        }
    }
    constructPrompt(sessionSummary, relevantMemories, memoryContext) {
        let prompt = 'You are a helpful AI assistant with access to the user\'s personal memories.\n\n';
        if (sessionSummary) {
            prompt += `Current conversation summary: ${sessionSummary}\n\n`;
        }
        if (memoryContext) {
            prompt += `${memoryContext}\n\n`;
        }
        else if (relevantMemories.length > 0) {
            prompt += 'Relevant memories from the user:\n';
            relevantMemories.forEach((memory, index) => {
                prompt += `[Memory ${index + 1}]: ${memory}\n`;
            });
            prompt += '\n';
        }
        prompt += 'Please respond to the user\'s message in a helpful and informative way, using the provided memories when relevant.';
        return prompt;
    }
    async processCompletedMessage(sessionId, userAddress, userMessage, assistantResponse) {
        try {
            this.summarizationService.summarizeSessionIfNeeded(sessionId, userAddress);
            const result = await this.memoryIngestionService.processConversation(userMessage, assistantResponse, userAddress);
            const isUserMessageFactual = await this.isFactual(userMessage);
            return {
                memoryStored: isUserMessageFactual,
                memoryId: isUserMessageFactual ? `mem-${Date.now()}` : undefined
            };
        }
        catch (error) {
            this.logger.error(`Error in post-processing: ${error.message}`);
            return { memoryStored: false };
        }
    }
    async isFactual(message) {
        try {
            const factPatterns = [
                /my name is/i,
                /i am/i,
                /i live/i,
                /i work/i,
                /i have/i,
                /remember/i
            ];
            for (const pattern of factPatterns) {
                if (pattern.test(message)) {
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Error checking factual content: ${error.message}`);
            return false;
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService,
        sui_service_1.SuiService,
        memory_query_service_1.MemoryQueryService,
        memory_ingestion_service_1.MemoryIngestionService,
        summarization_service_1.SummarizationService])
], ChatService);
//# sourceMappingURL=chat.service.js.map