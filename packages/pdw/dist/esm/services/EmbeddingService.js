/**
 * EmbeddingService - AI embedding generation using Google Gemini API
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
export class EmbeddingService {
    constructor(config) {
        this.requestCount = 0;
        this.lastReset = Date.now();
        if (!config.apiKey) {
            throw new Error('Gemini API key is required for embedding generation');
        }
        this.genAI = new GoogleGenerativeAI(config.apiKey);
        this.model = config.model || 'text-embedding-004';
        this.dimensions = config.dimensions || 768;
        this.maxRequestsPerMinute = config.requestsPerMinute || 1500;
        console.log(`✅ EmbeddingService initialized with model: ${this.model}`);
    }
    /**
     * Generate embedding for a single text
     */
    async embedText(text) {
        const startTime = Date.now();
        await this.checkRateLimit();
        try {
            const embeddingModel = this.genAI.getGenerativeModel({
                model: this.model
            });
            const result = await embeddingModel.embedContent(text);
            this.requestCount++;
            const vector = result.embedding.values;
            if (!vector || vector.length === 0) {
                throw new Error('Empty embedding vector received from Gemini API');
            }
            return {
                vector: Array.from(vector),
                dimension: vector.length,
                model: this.model,
                processingTime: Date.now() - startTime,
            };
        }
        catch (error) {
            throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Generate embeddings for multiple texts (batched)
     */
    async embedBatch(texts) {
        const startTime = Date.now();
        const results = [];
        let successCount = 0;
        let failedCount = 0;
        // Process in smaller batches to respect rate limits
        const batchSize = 10;
        const totalBatches = Math.ceil(texts.length / batchSize);
        for (let i = 0; i < totalBatches; i++) {
            const batch = texts.slice(i * batchSize, (i + 1) * batchSize);
            const batchPromises = batch.map(async (text) => {
                try {
                    const result = await this.embedText(text);
                    successCount++;
                    return result.vector;
                }
                catch (error) {
                    failedCount++;
                    console.warn(`Failed to embed text: ${text.substring(0, 100)}...`);
                    // Return zero vector as fallback
                    return new Array(this.dimensions).fill(0);
                }
            });
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            // Add delay between batches to respect rate limits
            if (i < totalBatches - 1) {
                await this.delay(100); // 100ms delay between batches
            }
        }
        const totalTime = Date.now() - startTime;
        return {
            vectors: results,
            dimension: this.dimensions,
            model: this.model,
            totalProcessingTime: totalTime,
            averageProcessingTime: totalTime / texts.length,
            successCount,
            failedCount,
        };
    }
    /**
     * Get embedding statistics
     */
    getStats() {
        const now = Date.now();
        const requestsThisMinute = (now - this.lastReset) < 60000 ? this.requestCount : 0;
        return {
            totalRequests: this.requestCount,
            requestsThisMinute,
            model: this.model,
            dimensions: this.dimensions,
            rateLimit: this.maxRequestsPerMinute,
        };
    }
    /**
     * Reset rate limiting counters (called automatically every minute)
     */
    resetRateLimit() {
        const now = Date.now();
        if (now - this.lastReset >= 60000) {
            this.requestCount = 0;
            this.lastReset = now;
        }
    }
    /**
     * Check rate limiting and wait if necessary
     */
    async checkRateLimit() {
        this.resetRateLimit();
        if (this.requestCount >= this.maxRequestsPerMinute) {
            const waitTime = 60000 - (Date.now() - this.lastReset);
            if (waitTime > 0) {
                console.warn(`Rate limit reached, waiting ${waitTime}ms`);
                await this.delay(waitTime);
                this.resetRateLimit();
            }
        }
    }
    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=EmbeddingService.js.map