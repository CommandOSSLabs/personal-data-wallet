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
var EmbeddingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingService = void 0;
const common_1 = require("@nestjs/common");
const gemini_service_1 = require("../../infrastructure/gemini/gemini.service");
let EmbeddingService = EmbeddingService_1 = class EmbeddingService {
    geminiService;
    logger = new common_1.Logger(EmbeddingService_1.name);
    constructor(geminiService) {
        this.geminiService = geminiService;
    }
    async embedText(text) {
        try {
            return await this.geminiService.embedText(text);
        }
        catch (error) {
            this.logger.error(`Error embedding text: ${error.message}`);
            throw new Error(`Embedding error: ${error.message}`);
        }
    }
    async embedBatch(texts) {
        try {
            const embeddings = await Promise.all(texts.map(text => this.geminiService.embedText(text)));
            return {
                vectors: embeddings.map(e => e.vector)
            };
        }
        catch (error) {
            this.logger.error(`Error batch embedding texts: ${error.message}`);
            throw new Error(`Batch embedding error: ${error.message}`);
        }
    }
    calculateCosineSimilarity(vectorA, vectorB) {
        try {
            if (vectorA.length !== vectorB.length) {
                throw new Error('Vectors must have the same dimensions');
            }
            let dotProduct = 0;
            let normA = 0;
            let normB = 0;
            for (let i = 0; i < vectorA.length; i++) {
                dotProduct += vectorA[i] * vectorB[i];
                normA += vectorA[i] ** 2;
                normB += vectorB[i] ** 2;
            }
            const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
            return similarity;
        }
        catch (error) {
            this.logger.error(`Error calculating cosine similarity: ${error.message}`);
            throw new Error(`Similarity calculation error: ${error.message}`);
        }
    }
};
exports.EmbeddingService = EmbeddingService;
exports.EmbeddingService = EmbeddingService = EmbeddingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService])
], EmbeddingService);
//# sourceMappingURL=embedding.service.js.map