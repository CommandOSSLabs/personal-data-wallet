/**
 * PDW - Personal Data Wallet for Vector Embedding Storage
 * 
 * Main class that orchestrates AI embeddings, vector indexing, and Walrus storage
 */

import { EmbeddingService } from './services/EmbeddingService';
import { VectorService } from './services/VectorService';
import { WalrusService } from './services/WalrusService';
import { 
  PDWConfig,
  PDWMemory, 
  ProcessedMemory,
  VectorSearchOptions,
  VectorSearchResult,
  VectorStorageResult
} from './types';

export class PDW {
  private embeddingService: EmbeddingService;
  private vectorService: VectorService;
  private walrusService: WalrusService;
  private userIndices = new Map<string, string>(); // userId -> blobId mapping

  constructor(config: PDWConfig) {
    // Initialize services
    this.embeddingService = new EmbeddingService(config.embedding);
    this.vectorService = new VectorService(config.vector);
    this.walrusService = new WalrusService(config.walrus);

    console.log('✅ PDW initialized successfully');
  }

  /**
   * Store text as vector embedding on Walrus
   */
  async storeText(
    userId: string,
    text: string,
    options: {
      category?: string;
      metadata?: any;
      autoSave?: boolean;
    } = {}
  ): Promise<{
    vectorId: number;
    blobId?: string;
    embedding: number[];
  }> {
    try {
      console.log(`📝 Storing text for user: ${userId}`);
      
      // Generate embedding and add to vector index
      const embeddingResult = await this.embeddingService.embedText(text);
      const vectorId = this.vectorService.addVector(
        userId,
        embeddingResult.vector,
        text,
        { 
          category: options.category || 'general',
          ...options.metadata 
        }
      );

      let blobId: string | undefined;

      // Auto-save index to Walrus if enabled (default: true)
      if (options.autoSave !== false) {
        blobId = await this.saveUserIndex(userId);
      }

      console.log(`✅ Text stored with vector ID: ${vectorId}`);

      return {
        vectorId,
        blobId,
        embedding: embeddingResult.vector
      };
    } catch (error) {
      console.error('Failed to store text:', error);
      throw error;
    }
  }

  /**
   * Store multiple texts in batch
   */
  async storeTextsBatch(
    userId: string,
    texts: Array<{
      text: string;
      category?: string;
      metadata?: any;
    }>,
    options: {
      autoSave?: boolean;
    } = {}
  ): Promise<{
    results: Array<{ success: boolean; vectorId?: number; error?: string }>;
    blobId?: string;
    successCount: number;
    failureCount: number;
  }> {
    try {
      console.log(`📦 Storing ${texts.length} texts in batch for user: ${userId}`);
      
      // Process texts in batch
      const results: Array<{ success: boolean; vectorId?: number; error?: string }> = [];
      let successCount = 0;
      let failureCount = 0;
      
      for (const item of texts) {
        try {
          const embeddingResult = await this.embeddingService.embedText(item.text);
          const vectorId = this.vectorService.addVector(
            userId,
            embeddingResult.vector,
            item.text,
            { category: item.category || 'general', ...item.metadata }
          );
          results.push({ success: true, vectorId });
          successCount++;
        } catch (error) {
          results.push({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
          failureCount++;
        }
      }
      
      const batchResult = { results, successCount, failureCount };

      let blobId: string | undefined;

      // Auto-save index to Walrus if enabled (default: true)
      if (options.autoSave !== false) {
        blobId = await this.saveUserIndex(userId);
      }

      console.log(`✅ Batch completed: ${batchResult.successCount} success, ${batchResult.failureCount} failed`);

      return {
        ...batchResult,
        blobId
      };
    } catch (error) {
      console.error('Failed to store texts batch:', error);
      throw error;
    }
  }

  /**
   * Search similar texts using vector similarity
   */
  async searchSimilar(
    userId: string,
    queryText: string,
    options: VectorSearchOptions = {}
  ): Promise<VectorSearchResult> {
    try {
      console.log(`🔍 Searching similar texts for user: ${userId}`);
      
      const embeddingResult = await this.embeddingService.embedText(queryText);
      const result = await this.vectorService.searchSimilar(userId, embeddingResult.vector, options);
      
      console.log(`✅ Found ${result.results.length} similar texts in ${Date.now() - performance.now()}ms`);
      
      return result;
    } catch (error) {
      console.error('Failed to search similar texts:', error);
      throw error;
    }
  }

  /**
   * Save user's vector index to Walrus
   */
  async saveUserIndex(userId: string): Promise<string> {
    try {
      console.log(`💾 Saving vector index for user: ${userId}`);
      
      // Get index data from vector service
      const indexData = this.vectorService.saveIndex(userId);
      if (!indexData) {
        throw new Error('No vector index found for user');
      }

      // Upload to Walrus
      const uploadResult = await this.walrusService.storeVectorIndex(userId, indexData);

      // Store mapping
      this.userIndices.set(userId, uploadResult.blobId);

      console.log(`✅ Index saved to Walrus with blob ID: ${uploadResult.blobId}`);
      
      return uploadResult.blobId;
    } catch (error) {
      console.error('Failed to save user index:', error);
      throw error;
    }
  }

  /**
   * Load user's vector index from Walrus
   */
  async loadUserIndex(userId: string, blobId?: string): Promise<boolean> {
    try {
      const targetBlobId = blobId || this.userIndices.get(userId);
      if (!targetBlobId) {
        throw new Error('No blob ID provided and no stored mapping found');
      }

      console.log(`📥 Loading vector index for user: ${userId} from blob: ${targetBlobId}`);

      // Retrieve from Walrus
      const indexData = await this.walrusService.retrieveVectorIndex(targetBlobId);
      
      // Load into vector service
      const success = this.vectorService.loadIndex(userId, indexData);

      if (success) {
        this.userIndices.set(userId, targetBlobId);
        console.log(`✅ Index loaded successfully for user: ${userId}`);
      } else {
        throw new Error('Failed to load index from buffer');
      }

      return success;
    } catch (error) {
      console.error('Failed to load user index:', error);
      throw error;
    }
  }

  /**
   * Check if vector index exists for user
   */
  async hasUserIndex(userId: string, blobId?: string): Promise<boolean> {
    try {
      const targetBlobId = blobId || this.userIndices.get(userId);
      if (!targetBlobId) {
        return false;
      }

      // For now, just check if we have the blob ID
      // In a full implementation, you'd check if the blob exists on Walrus
      return !!targetBlobId;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user's vector index statistics
   */
  getUserIndexStats(userId: string) {
    return this.vectorService.getIndexStats(userId);
  }

  /**
   * Get user's stored index blob ID
   */
  getUserIndexBlobId(userId: string): string | undefined {
    return this.userIndices.get(userId);
  }

  /**
   * Clear user data (from memory, not from Walrus)
   */
  clearUserData(userId: string): void {
    this.vectorService.clearIndex(userId);
    this.userIndices.delete(userId);
    console.log(`🗑️ Cleared user data for: ${userId}`);
  }

  /**
   * Get comprehensive service statistics
   */
  getStats() {
    return {
      embedding: this.embeddingService.getStats(),
      walrus: this.walrusService.getStats(),
      users: {
        totalUsers: this.userIndices.size,
        userMappings: Object.fromEntries(this.userIndices)
      }
    };
  }
}

/**
 * Create PDW instance with configuration
 */
export function createPDW(config: PDWConfig): PDW {
  return new PDW(config);
}

export default PDW;