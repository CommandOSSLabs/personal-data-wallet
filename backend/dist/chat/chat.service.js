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
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_session_entity_1 = require("./entities/chat-session.entity");
const chat_message_entity_1 = require("./entities/chat-message.entity");
const uuid_1 = require("uuid");
let ChatService = ChatService_1 = class ChatService {
    geminiService;
    suiService;
    memoryQueryService;
    memoryIngestionService;
    summarizationService;
    chatSessionRepository;
    chatMessageRepository;
    logger = new common_1.Logger(ChatService_1.name);
    activeRequests = new Map();
    constructor(geminiService, suiService, memoryQueryService, memoryIngestionService, summarizationService, chatSessionRepository, chatMessageRepository) {
        this.geminiService = geminiService;
        this.suiService = suiService;
        this.memoryQueryService = memoryQueryService;
        this.memoryIngestionService = memoryIngestionService;
        this.summarizationService = summarizationService;
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
    }
    async getSessions(userAddress) {
        try {
            const dbSessions = await this.chatSessionRepository.find({
                where: { userAddress },
                order: { updatedAt: 'DESC' }
            });
            if (dbSessions.length > 0) {
                const sessions = dbSessions.map(session => ({
                    id: session.id,
                    owner: session.userAddress,
                    title: session.title,
                    summary: session.summary,
                    created_at: session.createdAt.toISOString(),
                    updated_at: session.updatedAt.toISOString(),
                    message_count: 0,
                }));
                return {
                    success: true,
                    sessions
                };
            }
            const blockchainSessions = await this.suiService.getChatSessions(userAddress);
            if (blockchainSessions.length > 0) {
                await Promise.all(blockchainSessions.map(async (session) => {
                    try {
                        await this.chatSessionRepository.save({
                            id: session.id,
                            title: session.title,
                            summary: session.summary,
                            userAddress,
                            suiObjectId: session.id,
                            isArchived: false,
                            metadata: { source: 'blockchain' }
                        });
                    }
                    catch (err) {
                        this.logger.error(`Error saving blockchain session to DB: ${err.message}`);
                    }
                }));
            }
            return {
                success: true,
                sessions: blockchainSessions
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
            const dbSession = await this.chatSessionRepository.findOne({
                where: { id: sessionId, userAddress },
                relations: ['messages']
            });
            if (dbSession) {
                const session = {
                    id: dbSession.id,
                    owner: dbSession.userAddress,
                    title: dbSession.title,
                    summary: dbSession.summary,
                    messages: dbSession.messages.map(msg => ({
                        id: msg.id,
                        content: msg.content,
                        type: msg.role,
                        timestamp: msg.createdAt.toISOString(),
                    })),
                    created_at: dbSession.createdAt.toISOString(),
                    updated_at: dbSession.updatedAt.toISOString(),
                    message_count: dbSession.messages.length,
                };
                return {
                    success: true,
                    session
                };
            }
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
                    type: msg.type,
                    timestamp: new Date().toISOString()
                })),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                message_count: rawSession.messages.length,
                sui_object_id: sessionId
            };
            try {
                const newDbSession = await this.chatSessionRepository.save({
                    id: sessionId,
                    title: rawSession.modelName,
                    userAddress,
                    suiObjectId: sessionId,
                    isArchived: false,
                    metadata: { source: 'blockchain' }
                });
                await Promise.all(rawSession.messages.map(async (msg, idx) => {
                    await this.chatMessageRepository.save({
                        id: `${sessionId}-${idx}`,
                        role: msg.type,
                        content: msg.content,
                        sessionId: newDbSession.id,
                        session: newDbSession
                    });
                }));
            }
            catch (err) {
                this.logger.error(`Error saving blockchain session to DB: ${err.message}`);
            }
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
            if (!createSessionDto.userAddress) {
                throw new common_1.BadRequestException('User address is required');
            }
            const sessionId = createSessionDto.suiObjectId || (0, uuid_1.v4)();
            const newSession = {
                id: sessionId,
                title: createSessionDto.title || createSessionDto.modelName || 'New Chat',
                userAddress: createSessionDto.userAddress,
                suiObjectId: createSessionDto.suiObjectId || undefined,
                isArchived: false,
                metadata: {
                    modelName: createSessionDto.modelName || 'gemini-2.0-flash',
                    source: createSessionDto.suiObjectId ? 'blockchain' : 'database'
                }
            };
            const dbSession = await this.chatSessionRepository.save(newSession);
            const session = {
                id: sessionId,
                owner: createSessionDto.userAddress,
                title: createSessionDto.title || createSessionDto.modelName || 'New Chat',
                messages: [],
                created_at: dbSession.createdAt.toISOString(),
                updated_at: dbSession.updatedAt.toISOString(),
                message_count: 0,
                sui_object_id: createSessionDto.suiObjectId
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
            this.logger.log(`Message processing request received for session ${sessionId}`);
            let memoryExtracted = null;
            if (messageDto.type === 'user') {
                try {
                    memoryExtracted = await this.checkForMemoryContent(messageDto.content, messageDto.userAddress);
                    this.logger.log('Memory extraction completed', {
                        hasExtraction: !!memoryExtracted,
                        factsCount: memoryExtracted?.extractedFacts?.length || 0,
                        category: memoryExtracted?.category
                    });
                }
                catch (err) {
                    this.logger.error(`Memory extraction error: ${err.message}`);
                    memoryExtracted = null;
                }
            }
            try {
                const dbSession = await this.chatSessionRepository.findOne({
                    where: { id: sessionId }
                });
                if (dbSession) {
                    await this.chatMessageRepository.save({
                        role: messageDto.type,
                        content: messageDto.content,
                        sessionId: dbSession.id,
                        session: dbSession,
                        memoryId: messageDto.memoryId,
                        walrusHash: messageDto.walrusHash,
                        metadata: {
                            memoryExtracted: memoryExtracted ? true : false
                        }
                    });
                    await this.chatSessionRepository.update({ id: sessionId }, { updatedAt: new Date() });
                }
            }
            catch (err) {
                this.logger.error(`Error saving message to DB: ${err.message}`);
            }
            return {
                success: true,
                message: 'Message processed successfully',
                memoryExtracted
            };
        }
        catch (error) {
            this.logger.error(`Error processing message: ${error.message}`);
            return {
                success: false,
                message: `Error: ${error.message}`
            };
        }
    }
    async deleteSession(sessionId, userAddress) {
        try {
            await this.chatSessionRepository.delete({
                id: sessionId,
                userAddress
            });
            this.logger.log(`Delete request received for session ${sessionId}`);
            return {
                success: true,
                message: 'Session deleted from database. Blockchain deletion handled by frontend.'
            };
        }
        catch (error) {
            this.logger.error(`Error processing deletion: ${error.message}`);
            return {
                success: false,
                message: `Error: ${error.message}`
            };
        }
    }
    async updateSessionTitle(sessionId, userAddress, newTitle) {
        try {
            await this.chatSessionRepository.update({ id: sessionId, userAddress }, { title: newTitle });
            this.logger.log(`Title update request received for session ${sessionId}`);
            return {
                success: true,
                message: 'Session title updated in database. Blockchain update handled by frontend.'
            };
        }
        catch (error) {
            this.logger.error(`Error processing title update: ${error.message}`);
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
                const newSession = {
                    id: sessionId,
                    title: title || rawSession.modelName,
                    userAddress,
                    suiObjectId: sessionId,
                    isArchived: false,
                    metadata: { source: 'blockchain' }
                };
                const dbSession = await this.chatSessionRepository.save(newSession);
                if (rawSession.messages && Array.isArray(rawSession.messages)) {
                    await Promise.all(rawSession.messages.map(async (msg, idx) => {
                        await this.chatMessageRepository.save({
                            id: `${sessionId}-${idx}`,
                            role: msg.type,
                            content: msg.content,
                            sessionId: dbSession.id,
                            session: dbSession
                        });
                    }));
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
            await this.chatSessionRepository.update({ id: saveSummaryDto.sessionId }, { summary: saveSummaryDto.summary });
            this.logger.log(`Summary save request received for session ${saveSummaryDto.sessionId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Error processing summary: ${error.message}`);
            return { success: false };
        }
    }
    streamChatResponse(messageDto) {
        const subject = new rxjs_1.Subject();
        let fullResponse = '';
        let memoryStored = false;
        let memoryId = undefined;
        const sessionId = messageDto.sessionId || messageDto.session_id;
        const userId = messageDto.userId || messageDto.user_id || messageDto.userAddress;
        const content = messageDto.text || messageDto.content;
        const modelName = messageDto.model || messageDto.modelName || 'gemini-2.0-flash';
        const requestKey = `${userId}_${sessionId}_${content}_${Date.now()}`;
        (async () => {
            try {
                if (this.activeRequests.has(requestKey)) {
                    this.logger.warn(`Duplicate request detected, ignoring: ${requestKey}`);
                    subject.error(new Error('Duplicate request'));
                    return;
                }
                this.activeRequests.set(requestKey, true);
                this.logger.log(`Starting streaming chat - SessionID: ${sessionId}, UserID: ${userId}, Content: "${content}", RequestKey: ${requestKey}`);
                subject.next({
                    data: JSON.stringify({
                        type: 'start',
                        intent: 'CHAT'
                    })
                });
                if (!sessionId) {
                    throw new Error('Session ID is required for streaming chat');
                }
                if (!userId) {
                    throw new Error('User ID/Address is required for streaming chat');
                }
                if (!content) {
                    throw new Error('Message content is required for streaming chat');
                }
                let chatHistory = [];
                const dbSession = await this.chatSessionRepository.findOne({
                    where: { id: sessionId },
                    relations: ['messages']
                });
                if (dbSession && dbSession.messages) {
                    chatHistory = dbSession.messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }));
                    chatHistory.push({ role: 'user', content });
                }
                else {
                    const chatSession = await this.suiService.getChatSession(sessionId);
                    chatHistory = [...chatSession.messages.map(msg => ({ role: msg.type, content: msg.content })), { role: 'user', content }];
                }
                let relevantMemories = [];
                if (messageDto.memoryContext) {
                    this.logger.log('Using provided memory context');
                }
                else {
                    relevantMemories = await this.memoryQueryService.findRelevantMemories(content, userId);
                }
                const systemPrompt = this.constructPrompt(dbSession?.summary || '', relevantMemories, messageDto.memoryContext || '');
                this.logger.log(`Generating AI response for: "${content}" with model: ${modelName}`);
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
                        this.activeRequests.delete(requestKey);
                        subject.error(err);
                    },
                    complete: async () => {
                        try {
                            const userMessage = messageDto.originalUserMessage || content;
                            if (dbSession) {
                                const existingUserMessage = await this.chatMessageRepository.findOne({
                                    where: {
                                        sessionId: dbSession.id,
                                        role: 'user',
                                        content: userMessage
                                    },
                                    order: { createdAt: 'DESC' }
                                });
                                if (!existingUserMessage) {
                                    this.logger.log(`Saving user message: "${userMessage}"`);
                                    await this.chatMessageRepository.save({
                                        role: 'user',
                                        content: userMessage,
                                        sessionId: dbSession.id,
                                        session: dbSession
                                    });
                                }
                                else {
                                    this.logger.log(`User message already exists, skipping save: "${userMessage}"`);
                                }
                                this.logger.log(`Saving assistant message: "${fullResponse.substring(0, 100)}..."`);
                                await this.chatMessageRepository.save({
                                    role: 'assistant',
                                    content: fullResponse,
                                    sessionId: dbSession.id,
                                    session: dbSession
                                });
                                await this.chatSessionRepository.update({ id: sessionId }, { updatedAt: new Date() });
                            }
                            this.activeRequests.delete(requestKey);
                            let memoryExtraction = null;
                            try {
                                memoryExtraction = await this.checkForMemoryContent(userMessage, userId);
                            }
                            catch (err) {
                                this.logger.error(`Memory extraction error: ${err.message}`);
                            }
                            this.summarizationService.summarizeSessionIfNeeded(sessionId, userId);
                            memoryStored = false;
                            memoryId = undefined;
                            subject.next({
                                data: JSON.stringify({
                                    type: 'end',
                                    content: fullResponse,
                                    intent: 'CHAT',
                                    memoryStored,
                                    memoryId,
                                    memoryExtraction: memoryExtraction
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
                this.activeRequests.delete(requestKey);
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
            let chatHistory = [];
            const dbSession = await this.chatSessionRepository.findOne({
                where: { id: sessionId },
                relations: ['messages']
            });
            if (dbSession && dbSession.messages) {
                chatHistory = dbSession.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));
                chatHistory.push({ role: 'user', content });
            }
            else {
                const chatSession = await this.suiService.getChatSession(sessionId);
                chatHistory = [...chatSession.messages.map(msg => ({ role: msg.type, content: msg.content })), { role: 'user', content }];
            }
            let relevantMemories = [];
            if (messageDto.memoryContext) {
                this.logger.log('Using provided memory context');
            }
            else {
                relevantMemories = await this.memoryQueryService.findRelevantMemories(content, userId);
            }
            const systemPrompt = this.constructPrompt(dbSession?.summary || '', relevantMemories, messageDto.memoryContext || '');
            const response = await this.geminiService.generateContent(modelName, chatHistory, systemPrompt);
            if (dbSession) {
                await this.chatMessageRepository.save({
                    role: 'user',
                    content: content,
                    sessionId: dbSession.id,
                    session: dbSession
                });
                await this.chatMessageRepository.save({
                    role: 'assistant',
                    content: response,
                    sessionId: dbSession.id,
                    session: dbSession
                });
                await this.chatSessionRepository.update({ id: sessionId }, { updatedAt: new Date() });
            }
            const userMessage = messageDto.originalUserMessage || content;
            let memoryExtraction = null;
            try {
                memoryExtraction = await this.checkForMemoryContent(userMessage, userId);
            }
            catch (err) {
                this.logger.error(`Memory extraction error: ${err.message}`);
            }
            this.summarizationService.summarizeSessionIfNeeded(sessionId, userId);
            return {
                response,
                success: true,
                intent: 'CHAT',
                memoryStored: false,
                memoryId: undefined,
                memoryExtraction: memoryExtraction
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
                /i love/i,
                /i like/i,
                /i enjoy/i,
                /i prefer/i,
                /i hate/i,
                /i dislike/i,
                /my favorite/i,
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
    async checkForMemoryContent(message, userAddress) {
        try {
            const classification = await this.memoryIngestionService['classifierService'].shouldSaveMemory(message);
            if (!classification.shouldSave) {
                return null;
            }
            return {
                shouldSave: true,
                category: classification.category,
                content: message,
                extractedFacts: [message],
                confidence: classification.confidence || 0.8
            };
        }
        catch (error) {
            this.logger.error(`Error checking memory content: ${error.message}`);
            return null;
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, typeorm_1.InjectRepository)(chat_session_entity_1.ChatSession)),
    __param(6, (0, typeorm_1.InjectRepository)(chat_message_entity_1.ChatMessage)),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService,
        sui_service_1.SuiService,
        memory_query_service_1.MemoryQueryService,
        memory_ingestion_service_1.MemoryIngestionService,
        summarization_service_1.SummarizationService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map