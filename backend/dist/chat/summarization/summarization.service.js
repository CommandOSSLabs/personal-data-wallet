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
var SummarizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummarizationService = void 0;
const common_1 = require("@nestjs/common");
const sui_service_1 = require("../../infrastructure/sui/sui.service");
const gemini_service_1 = require("../../infrastructure/gemini/gemini.service");
let SummarizationService = SummarizationService_1 = class SummarizationService {
    suiService;
    geminiService;
    logger = new common_1.Logger(SummarizationService_1.name);
    constructor(suiService, geminiService) {
        this.suiService = suiService;
        this.geminiService = geminiService;
    }
    async summarizeSessionIfNeeded(sessionId, userAddress) {
        try {
            const session = await this.suiService.getChatSession(sessionId);
            const shouldSummarize = (session.messages.length > 10 && !session.summary) ||
                (session.summary && session.messages.length > 5);
            if (!shouldSummarize) {
                return;
            }
            const summary = await this.generateSummary(session.messages);
            await this.suiService.saveSessionSummary(sessionId, userAddress, summary);
            this.logger.log(`Summarized session ${sessionId}`);
        }
        catch (error) {
            this.logger.error(`Error summarizing session: ${error.message}`);
        }
    }
    async generateSummary(messages) {
        try {
            const conversation = messages
                .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
                .join('\n\n');
            const prompt = `
        Please provide a concise summary (2-3 sentences) of the following conversation.
        Focus on the main topics discussed, key questions asked, and important information shared.
        Your summary should help provide context for continuing the conversation.
        
        Conversation:
        ${conversation}
        
        Summary:
      `;
            const summary = await this.geminiService.generateContent('gemini-1.5-flash', [{ role: 'user', content: prompt }]);
            return summary.trim();
        }
        catch (error) {
            this.logger.error(`Error generating summary: ${error.message}`);
            return 'Error generating summary';
        }
    }
};
exports.SummarizationService = SummarizationService;
exports.SummarizationService = SummarizationService = SummarizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sui_service_1.SuiService,
        gemini_service_1.GeminiService])
], SummarizationService);
//# sourceMappingURL=summarization.service.js.map