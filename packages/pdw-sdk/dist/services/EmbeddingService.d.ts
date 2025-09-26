/**
 * EmbeddingService - Local AI Embedding Generation
 *
 * Provides local embedding generation using Google Gemini API,
 * eliminating the need for backend API calls for vector operations.
 */
export interface EmbeddingConfig {
    apiKey?: string;
    model?: string;
    dimensions?: number;
    requestsPerMinute?: number;
}
export interface EmbeddingOptions {
    text: string;
    type?: 'content' | 'metadata' | 'query';
    taskType?: 'RETRIEVAL_QUERY' | 'RETRIEVAL_DOCUMENT' | 'SEMANTIC_SIMILARITY';
}
export interface EmbeddingResult {
    vector: number[];
    dimension: number;
    model: string;
    processingTime: number;
    tokenCount?: number;
}
export interface BatchEmbeddingResult {
    vectors: number[][];
    dimension: number;
    model: string;
    totalProcessingTime: number;
    averageProcessingTime: number;
    successCount: number;
    failedCount: number;
}
/**
 * Local embedding service using Google Gemini API
 */
export declare class EmbeddingService {
    private genAI;
    private model;
    private dimensions;
    private requestCount;
    private lastReset;
    private readonly maxRequestsPerMinute;
    constructor(config?: EmbeddingConfig);
    /**
     * Generate embedding for a single text
     */
    embedText(options: EmbeddingOptions): Promise<EmbeddingResult>;
    /**
     * Generate embeddings for multiple texts (batched)
     */
    embedBatch(texts: string[], options?: Omit<EmbeddingOptions, 'text'>): Promise<BatchEmbeddingResult>;
    /**
     * Calculate cosine similarity between two vectors
     */
    calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number;
    /**
     * Calculate Euclidean distance between two vectors
     */
    calculateEuclideanDistance(vectorA: number[], vectorB: number[]): number;
    /**
     * Normalize a vector to unit length
     */
    normalizeVector(vector: number[]): number[];
    /**
     * Find the most similar vectors to a query vector
     */
    findMostSimilar(queryVector: number[], candidateVectors: number[][], k?: number): Array<{
        index: number;
        similarity: number;
        distance: number;
    }>;
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
     * Get appropriate task type for Gemini API
     */
    private getTaskType;
    /**
     * Utility delay function
     */
    private delay;
}
export default EmbeddingService;
//# sourceMappingURL=EmbeddingService.d.ts.map