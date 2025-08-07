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
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const generative_ai_1 = require("@google/generative-ai");
let GeminiService = GeminiService_1 = class GeminiService {
    configService;
    generativeAI;
    logger = new common_1.Logger(GeminiService_1.name);
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GOOGLE_API_KEY');
        if (!apiKey) {
            this.logger.error('GOOGLE_API_KEY not provided');
            throw new Error('GOOGLE_API_KEY not provided');
        }
        this.generativeAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async generateContent(modelName = 'gemini-2.0-flash', history = [], systemPrompt) {
        try {
            const model = this.getModel(modelName);
            const formattedHistory = this.formatChatHistory(history);
            const parts = formattedHistory.slice();
            if (systemPrompt) {
                parts.unshift({
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                });
                parts.unshift({
                    role: 'model',
                    parts: [{ text: 'I understand. I\'ll help you with that.' }]
                });
            }
            const result = await model.generateContent({
                contents: parts,
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 2048,
                },
            });
            return result.response.text();
        }
        catch (error) {
            this.logger.error(`Error generating content: ${error.message}`);
            throw new Error(`Gemini API error: ${error.message}`);
        }
    }
    generateContentStream(modelName = 'gemini-2.0-flash', history = [], systemPrompt) {
        const subject = new rxjs_1.Subject();
        (async () => {
            try {
                const model = this.getModel(modelName);
                const formattedHistory = this.formatChatHistory(history);
                const parts = formattedHistory.slice();
                if (systemPrompt) {
                    parts.unshift({
                        role: 'user',
                        parts: [{ text: systemPrompt }]
                    });
                    parts.unshift({
                        role: 'model',
                        parts: [{ text: 'I understand. I will help you with that.' }]
                    });
                }
                const result = await model.generateContentStream({
                    contents: parts,
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.8,
                        topK: 40,
                        maxOutputTokens: 2048,
                    },
                });
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    subject.next(chunkText);
                }
                subject.complete();
            }
            catch (error) {
                this.logger.error(`Error streaming content: ${error.message}`);
                subject.error(new Error(`Gemini API error: ${error.message}`));
            }
        })();
        return subject.asObservable();
    }
    async embedText(text, modelName = 'embedding-001', outputDimensionality = 768) {
        try {
            const embeddingModel = this.generativeAI.getGenerativeModel({
                model: modelName,
            });
            const result = await embeddingModel.embedContent(text);
            const embedding = result.embedding.values;
            this.logger.debug(`Generated embedding with ${embedding.length} dimensions using model ${modelName}`);
            return { vector: embedding };
        }
        catch (error) {
            this.logger.error(`Error embedding text: ${error.message}`);
            throw new Error(`Embedding error: ${error.message}`);
        }
    }
    getModel(modelName) {
        return this.generativeAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                maxOutputTokens: 2048,
            },
        });
    }
    formatChatHistory(history) {
        return history.map(message => ({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.content }]
        }));
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map