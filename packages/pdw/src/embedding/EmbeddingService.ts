/**
 * Streamlined EmbeddingService for Vector Storage
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmbeddingConfig, EmbeddingResult, BatchEmbeddingResult } from '../types';

export interface EmbeddingOptions {
  text: string;
  type?: 'content' | 'query' | 'metadata';
}

export class EmbeddingService {
  private genAI: GoogleGenerativeAI;
  private model: string;
  private dimensions: number;
  private requestCount = 0;
  private lastReset = Date.now();
  private readonly maxRequestsPerMinute: number;

  constructor(config: EmbeddingConfig) {
    if (!config.apiKey) {
      throw new Error(
        'Gemini API key is required. Get your API key from: https://makersuite.google.com/app/apikey'
      );
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
  async embedText(options: EmbeddingOptions): Promise<EmbeddingResult> {
    const startTime = Date.now();
    
    await this.checkRateLimit();

    try {
      const embeddingModel = this.genAI.getGenerativeModel({ 
        model: this.model 
      });

      const result = await embeddingModel.embedContent(options.text);
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
    } catch (error) {
      throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate embeddings for multiple texts (batched)
   */
  async embedBatch(texts: string[]): Promise<BatchEmbeddingResult> {
    const startTime = Date.now();
    const results: number[][] = [];
    let successCount = 0;
    let failedCount = 0;
    
    // Process in smaller batches to respect rate limits
    const batchSize = 10;
    const totalBatches = Math.ceil(texts.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const batch = texts.slice(i * batchSize, (i + 1) * batchSize);
      
      const batchPromises = batch.map(async (text) => {
        try {
          const result = await this.embedText({ text });
          successCount++;
          return result.vector;
        } catch (error) {
          failedCount++;
          console.warn(`Failed to embed text: ${text.substring(0, 100)}...`);
          return new Array(this.dimensions).fill(0);
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i < totalBatches - 1) {
        await this.delay(100);
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
   * Calculate cosine similarity between two vectors
   */
  calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error(`Vector dimension mismatch: ${vectorA.length} vs ${vectorB.length}`);
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
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

  private resetRateLimit(): void {
    const now = Date.now();
    if (now - this.lastReset >= 60000) {
      this.requestCount = 0;
      this.lastReset = now;
    }
  }

  private async checkRateLimit(): Promise<void> {
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}