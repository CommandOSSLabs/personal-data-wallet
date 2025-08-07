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
        /i love ([^.!?]+)/i,
        /i like ([^.!?]+)/i,
        /i enjoy ([^.!?]+)/i,
        /i prefer ([^.!?]+)/i,
        /i hate ([^.!?]+)/i,
        /i dislike ([^.!?]+)/i,
        /i don't like ([^.!?]+)/i,
        /my favorite ([^.!?]+) is ([^.!?]+)/i,
        /my favourite ([^.!?]+) is ([^.!?]+)/i,
        /remember that ([^.!?]+)/i,
        /don't forget that ([^.!?]+)/i,
        /please remember ([^.!?]+)/i,
        /i am ([^.!?]+)/i,
        /i have ([^.!?]+)/i,
        /i own ([^.!?]+)/i,
        /i studied ([^.!?]+)/i,
        /i graduated from ([^.!?]+)/i,
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
        '/i love/i': 'preference',
        '/i like/i': 'preference',
        '/i enjoy/i': 'preference',
        '/i prefer/i': 'preference',
        '/i hate/i': 'preference',
        '/i dislike/i': 'preference',
        '/i don\'t like/i': 'preference',
        '/my favorite/i': 'preference',
        '/my favourite/i': 'preference',
        '/remember that/i': 'custom',
        '/don\'t forget/i': 'custom',
        '/please remember/i': 'custom',
        '/i am/i': 'personal_info',
        '/i have/i': 'personal_info',
        '/i own/i': 'personal_info',
        '/i studied/i': 'education',
        '/i graduated/i': 'education',
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
  "category": "personal_info|location|career|contact|preference|background|health|education|custom",
  "reasoning": "Brief explanation"
}

Save as "true" if the message contains:
- Personal preferences (likes, dislikes, favorites)
- Personal information (name, location, job, etc.)
- Facts about the person
- Things they want to remember

Examples that should be saved:
- "I love pizza" → preference
- "I like cocacola" → preference
- "My name is John" → personal_info
- "I work at Google" → career
- "I hate broccoli" → preference
- "I enjoy hiking" → preference

Be generous with preferences - even simple statements like "I love X" should be saved.
`;
            const responseText = await this.geminiService.generateContent('gemini-1.5-flash', [{ role: 'user', content: prompt }]);
            try {
                let cleanedResponse = responseText;
                if (cleanedResponse.includes('```json')) {
                    cleanedResponse = cleanedResponse.replace(/```json\n|\n```/g, '');
                }
                else if (cleanedResponse.includes('```')) {
                    cleanedResponse = cleanedResponse.replace(/```\n|\n```/g, '');
                }
                const jsonMatch = cleanedResponse.match(/{[\s\S]*}/);
                if (jsonMatch) {
                    cleanedResponse = jsonMatch[0];
                }
                this.logger.log(`Cleaned response for parsing: ${cleanedResponse}`);
                const result = JSON.parse(cleanedResponse);
                return {
                    shouldSave: result.shouldSave || false,
                    confidence: result.confidence || 0,
                    category: result.category || 'unknown',
                    reasoning: result.reasoning || 'No reasoning provided'
                };
            }
            catch (parseError) {
                this.logger.error(`Error parsing classification result: ${parseError.message}`);
                this.logger.error(`Raw response: ${responseText}`);
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