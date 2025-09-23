/**
 * Streamlined EmbeddingService for Vector Storage
 */
import { EmbeddingConfig, EmbeddingResult, BatchEmbeddingResult } from '../types';
export interface EmbeddingOptions {
    text: string;
    type?: 'content' | 'query' | 'metadata';
}
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
    embedText(options: EmbeddingOptions): Promise<EmbeddingResult>;
    /**
     * Generate embeddings for multiple texts (batched)
     */
    embedBatch(texts: string[]): Promise<BatchEmbeddingResult>;
    /**
     * Calculate cosine similarity between two vectors
     */
    calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number;
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
    private resetRateLimit;
    private checkRateLimit;
    private delay;
}
//# sourceMappingURL=EmbeddingService.d.ts.map