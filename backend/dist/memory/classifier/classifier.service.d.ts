import { GeminiService } from '../../infrastructure/gemini/gemini.service';
export interface ClassificationResult {
    shouldSave: boolean;
    confidence: number;
    category: string;
    reasoning: string;
}
export declare class ClassifierService {
    private geminiService;
    private readonly logger;
    private readonly factPatterns;
    private readonly categoryMap;
    constructor(geminiService: GeminiService);
    shouldSaveMemory(message: string): Promise<ClassificationResult>;
    private classifyWithGemini;
    private getCategoryForPattern;
}
