import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';

@Injectable()
export class EmbeddingService {
  private logger = new Logger(EmbeddingService.name);
  
  constructor(private geminiService: GeminiService) {}
  
  /**
   * Create embeddings for a text
   * @param text The text to embed
   * @returns The embedding vector
   */
  async embedText(text: string): Promise<{ vector: number[] }> {
    try {
      return await this.geminiService.embedText(text);
    } catch (error) {
      this.logger.error(`Error embedding text: ${error.message}`);
      throw new Error(`Embedding error: ${error.message}`);
    }
  }
  
  /**
   * Create embeddings for multiple texts
   * @param texts Array of texts to embed
   * @returns Array of embedding vectors
   */
  async embedBatch(texts: string[]): Promise<{ vectors: number[][] }> {
    try {
      const embeddings = await Promise.all(
        texts.map(text => this.geminiService.embedText(text))
      );
      
      return {
        vectors: embeddings.map(e => e.vector)
      };
    } catch (error) {
      this.logger.error(`Error batch embedding texts: ${error.message}`);
      throw new Error(`Batch embedding error: ${error.message}`);
    }
  }
  
  /**
   * Calculate cosine similarity between two vectors
   * @param vectorA First vector
   * @param vectorB Second vector
   * @returns Cosine similarity score (0-1)
   */
  calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    try {
      if (vectorA.length !== vectorB.length) {
        throw new Error('Vectors must have the same dimensions');
      }
      
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      
      for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
        normA += vectorA[i] ** 2;
        normB += vectorB[i] ** 2;
      }
      
      const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
      
      return similarity;
    } catch (error) {
      this.logger.error(`Error calculating cosine similarity: ${error.message}`);
      throw new Error(`Similarity calculation error: ${error.message}`);
    }
  }
}