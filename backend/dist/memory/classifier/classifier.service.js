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
var ClassifierService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassifierService = void 0;
const common_1 = require("@nestjs/common");
const gemini_service_1 = require("../../infrastructure/gemini/gemini.service");
let ClassifierService = ClassifierService_1 = class ClassifierService {
    geminiService;
    logger = new common_1.Logger(ClassifierService_1.name);
    factPatterns = [
        /my name is ([a-zA-Z\s]+)/i,
        /my email is ([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
        /i live in ([a-zA-Z\s,]+)/i,
        /i work at ([a-zA-Z\s,&]+)/i,
        /i am from ([a-zA-Z\s,]+)/i,
        /i was born in ([a-zA-Z0-9\s,]+)/i,
        /my birthday is ([a-zA-Z0-9\s,]+)/i,
        /my phone (?:number|#) is ([0-9+\-\s()]+)/i,
        /my address is ([a-zA-Z0-9\s,]+)/i,
        /remember that ([^.!?]+)/i,
        /don't forget that ([^.!?]+)/i,
        /please remember ([^.!?]+)/i,
    ];
    categoryMap = {
        '/my name is/i': 'personal_info',
        '/my email is/i': 'contact',
        '/i live in/i': 'location',
        '/i work at/i': 'career',
        '/i am from/i': 'background',
        '/i was born/i': 'background',
        '/my birthday/i': 'personal_info',
        '/my phone/i': 'contact',
        '/my address/i': 'contact',
        '/remember that/i': 'custom',
        '/don\'t forget/i': 'custom',
        '/please remember/i': 'custom',
    };
    constructor(geminiService) {
        this.geminiService = geminiService;
    }
    async shouldSaveMemory(message) {
        try {
            for (const pattern of this.factPatterns) {
                const match = message.match(pattern);
                if (match) {
                    const patternString = pattern.toString();
                    const category = this.getCategoryForPattern(patternString);
                    return {
                        shouldSave: true,
                        confidence: 0.95,
                        category,
                        reasoning: `Matched pattern: ${patternString}`
                    };
                }
            }
            return await this.classifyWithGemini(message);
        }
        catch (error) {
            this.logger.error(`Error classifying memory: ${error.message}`);
            return {
                shouldSave: false,
                confidence: 0,
                category: 'unknown',
                reasoning: `Error: ${error.message}`
            };
        }
    }
    async classifyWithGemini(message) {
        try {
            const prompt = `
Analyze the following message to determine if it contains personal information or facts that should be saved to a personal memory database.

Message: "${message}"

Answer as JSON with the following format:
{
  "shouldSave": true/false,
  "confidence": [0.0-1.0],
  "category": "personal_info|location|career|contact|preference|background|health|custom",
  "reasoning": "Brief explanation"
}

Only say "true" if the message CLEARLY contains a personal fact, preference or information that would be useful to remember later.
`;
            const responseText = await this.geminiService.generateContent('gemini-1.5-flash', [{ role: 'user', content: prompt }]);
            try {
                const result = JSON.parse(responseText);
                return {
                    shouldSave: result.shouldSave || false,
                    confidence: result.confidence || 0,
                    category: result.category || 'unknown',
                    reasoning: result.reasoning || 'No reasoning provided'
                };
            }
            catch (parseError) {
                this.logger.error(`Error parsing classification result: ${parseError.message}`);
                return {
                    shouldSave: false,
                    confidence: 0,
                    category: 'unknown',
                    reasoning: `Parse error: ${parseError.message}`
                };
            }
        }
        catch (error) {
            this.logger.error(`Error using Gemini for classification: ${error.message}`);
            return {
                shouldSave: false,
                confidence: 0,
                category: 'unknown',
                reasoning: `Gemini error: ${error.message}`
            };
        }
    }
    getCategoryForPattern(patternString) {
        for (const [key, value] of Object.entries(this.categoryMap)) {
            if (patternString.includes(key.replace(/^\/|\/[a-z]*$/g, ''))) {
                return value;
            }
        }
        return 'custom';
    }
};
exports.ClassifierService = ClassifierService;
exports.ClassifierService = ClassifierService = ClassifierService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService])
], ClassifierService);
//# sourceMappingURL=classifier.service.js.map