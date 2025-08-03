import { GeminiService } from '../../infrastructure/gemini/gemini.service';
export declare class EmbeddingService {
    private geminiService;
    private logger;
    constructor(geminiService: GeminiService);
    embedText(text: string): Promise<{
        vector: number[];
    }>;
    embedBatch(texts: string[]): Promise<{
        vectors: number[][];
    }>;
    calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number;
}
