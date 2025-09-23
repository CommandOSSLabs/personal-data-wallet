/**
 * EmbeddingService - AI embedding generation using Google Gemini API
 */
import { EmbeddingConfig, EmbeddingResult, BatchEmbeddingResult } from '../types';
export declare class EmbeddingService {
    private genAI;
    private model;
    private dimensions;
    private requestCount;
    private lastReset;
    private readonly maxRequestsPerMinute;
    constructor(config: EmbeddingConfig);
    /**
     * Generate embedding for a single text
     */
    embedText(text: string): Promise<EmbeddingResult>;
    /**
     * Generate embeddings for multiple texts (batched)
     */
    embedBatch(texts: string[]): Promise<BatchEmbeddingResult>;
    /**
     * Get embedding statistics
     */
    getStats(): {
        totalRequests: number;
        requestsThisMinute: number;
        model: string;
        dimensions: number;
        rateLimit: number;
    };
    /**
     * Reset rate limiting counters (called automatically every minute)
     */
    private resetRateLimit;
    /**
     * Check rate limiting and wait if necessary
     */
    private checkRateLimit;
    /**
     * Utility delay function
     */
    private delay;
}
//# sourceMappingURL=EmbeddingService.d.ts.map