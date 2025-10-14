/**
 * VectorManager - High-level Vector Operations Orchestrator
 *
 * Provides a unified interface for vector operations combining
 * embedding generation and HNSW indexing with smart caching.
 * Uses hnswlib-wasm for full browser compatibility.
 */

import { EmbeddingService, EmbeddingOptions, EmbeddingResult, BatchEmbeddingResult } from '../services/EmbeddingService';
import { HnswWasmService } from './HnswWasmService';
import { StorageService } from '../services/StorageService';
import {
  VectorEmbedding,
  EmbeddingConfig,
  HNSWIndexConfig,
  BatchConfig,
  VectorSearchOptions,
  VectorSearchResult,
  VectorSearchMatch,
  HNSWSearchResult
} from '../embedding/types';

export interface VectorManagerConfig {
  embedding: EmbeddingConfig;
  index?: Partial<HNSWIndexConfig>;
  batch?: Partial<BatchConfig>;
  enableAutoIndex?: boolean;
  enableMemoryCache?: boolean;
}

export interface VectorOperationResult {
  success: boolean;
  vectorId?: number;
  embedding?: VectorEmbedding;
  indexBlobId?: string;
  processingTime: number;
  error?: string;
}

export interface VectorSearchStats {
  searchTime: number;
  embeddingTime: number;
  indexSearchTime: number;
  totalResults: number;
  cacheHits: number;
  indexSize: number;
}

/**
 * Unified vector operations manager
 */
export class VectorManager {
  private embeddingService: EmbeddingService;
  private indexService: HnswWasmService;
  private vectorIdCounter = new Map<string, number>(); // userAddress -> nextVectorId
  private memoryCache = new Map<string, VectorEmbedding>(); // text hash -> embedding
  private config: VectorManagerConfig;

  constructor(
    storageService: StorageService,
    config: VectorManagerConfig
  ) {
    this.config = config;

    // Initialize embedding service
    this.embeddingService = new EmbeddingService(config.embedding);

    // Initialize HNSW index service (using WASM for browser compatibility)
    this.indexService = new HnswWasmService(
      storageService,
      config.index,
      config.batch
    );
  }

  /**
   * Add text content to vector index (embed + index)
   */
  async addTextToIndex(
    userAddress: string,
    text: string,
    options: {
      vectorId?: number;
      metadata?: any;
      embeddingType?: 'content' | 'metadata' | 'query';
      enableCache?: boolean;
    } = {}
  ): Promise<VectorOperationResult> {
    const startTime = Date.now();

    try {
      // Generate or get cached embedding
      let embedding: VectorEmbedding;
      const textHash = this.hashText(text);
      
      if (options.enableCache !== false && this.config.enableMemoryCache && this.memoryCache.has(textHash)) {
        embedding = this.memoryCache.get(textHash)!;
        console.debug(`Using cached embedding for text hash: ${textHash.substring(0, 8)}`);
      } else {
        // Generate new embedding
        const embeddingResult = await this.embeddingService.embedText({
          text,
          type: options.embeddingType || 'content'
        });

        embedding = {
          vector: embeddingResult.vector,
          dimension: embeddingResult.dimension,
          model: embeddingResult.model,
          metadata: {
            contentType: 'text/plain',
            timestamp: Date.now(),
            source: 'vector-manager',
            ...options.metadata
          }
        };

        // Cache if enabled
        if (this.config.enableMemoryCache) {
          this.memoryCache.set(textHash, embedding);
        }
      }

      // Get vector ID
      const vectorId = options.vectorId || this.getNextVectorId(userAddress);

      // Add to HNSW index
      if (this.config.enableAutoIndex !== false) {
        this.indexService.addVectorToIndexBatched(
          userAddress,
          vectorId,
          embedding.vector,
          { text, ...options.metadata }
        );
      }

      return {
        success: true,
        vectorId,
        embedding,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Search for similar texts using vector similarity
   */
  async searchSimilarTexts(
    userAddress: string,
    queryText: string,
    options: {
      k?: number;
      threshold?: number;
      efSearch?: number;
      category?: string;
      metadata?: any;
      includeEmbeddings?: boolean;
    } = {}
  ): Promise<{
    results: VectorSearchMatch[];
    stats: VectorSearchStats;
  }> {
    const totalStartTime = Date.now();
    
    try {
      // Generate query embedding
      const embeddingStartTime = Date.now();
      const queryEmbedding = await this.embeddingService.embedText({
        text: queryText,
        type: 'query'
      });
      const embeddingTime = Date.now() - embeddingStartTime;

      // Search in HNSW index
      const indexStartTime = Date.now();
      const searchResult = await this.indexService.searchVectors(
        userAddress,
        queryEmbedding.vector,
        {
          k: options.k || 10,
          efSearch: options.efSearch || 50,
          filter: options.metadata ? (meta) => this.matchesMetadata(meta, options.metadata!) : undefined
        }
      );
      const indexSearchTime = Date.now() - indexStartTime;

      // Convert HNSW results to VectorSearchMatch format
      const results: VectorSearchMatch[] = [];
      for (let i = 0; i < searchResult.ids.length; i++) {
        const vectorId = searchResult.ids[i];
        const distance = searchResult.distances[i];
        const similarity = searchResult.similarities?.[i] || (1 - distance);

        // Apply threshold filter
        if (options.threshold && similarity < options.threshold) {
          continue;
        }

        const match: VectorSearchMatch = {
          memoryId: `memory_${vectorId}`, // TODO: Map to actual memory ID
          vectorId,
          similarity,
          distance,
          metadata: {} // TODO: Get metadata from index
        };

        if (options.includeEmbeddings) {
          match.embedding = {
            vector: [], // TODO: Store and retrieve vectors
            dimension: queryEmbedding.dimension,
            model: queryEmbedding.model
          };
        }

        results.push(match);
      }

      const stats: VectorSearchStats = {
        searchTime: Date.now() - totalStartTime,
        embeddingTime,
        indexSearchTime,
        totalResults: results.length,
        cacheHits: 0, // TODO: Track cache hits
        indexSize: 0 // TODO: Get from index service
      };

      return { results, stats };
    } catch (error) {
      throw new Error(`Vector search failed: ${error}`);
    }
  }

  /**
   * Batch add multiple texts to index
   */
  async addTextsBatch(
    userAddress: string,
    texts: Array<{
      text: string;
      metadata?: any;
      embeddingType?: 'content' | 'metadata' | 'query';
    }>,
    options: {
      batchSize?: number;
      enableCache?: boolean;
    } = {}
  ): Promise<{
    results: VectorOperationResult[];
    stats: {
      totalTime: number;
      embeddingTime: number;
      indexingTime: number;
      successCount: number;
      failureCount: number;
    };
  }> {
    const startTime = Date.now();
    const batchSize = options.batchSize || 10;
    const results: VectorOperationResult[] = [];

    // Extract texts for batch embedding
    const textContents = texts.map(t => t.text);

    // Generate embeddings in batch
    const embeddingStartTime = Date.now();
    const batchEmbeddings = await this.embeddingService.embedBatch(textContents);
    const embeddingTime = Date.now() - embeddingStartTime;

    // Add to index
    const indexingStartTime = Date.now();
    for (let i = 0; i < texts.length; i++) {
      try {
        const text = texts[i];
        const vector = batchEmbeddings.vectors[i];
        const vectorId = this.getNextVectorId(userAddress);

        const embedding: VectorEmbedding = {
          vector,
          dimension: batchEmbeddings.dimension,
          model: batchEmbeddings.model,
          metadata: {
            contentType: 'text/plain',
            timestamp: Date.now(),
            ...text.metadata
          }
        };

        // Add to index
        if (this.config.enableAutoIndex !== false) {
          this.indexService.addVectorToIndexBatched(
            userAddress,
            vectorId,
            vector,
            text.metadata
          );
        }

        // Cache embedding
        if (this.config.enableMemoryCache && options.enableCache !== false) {
          const textHash = this.hashText(text.text);
          this.memoryCache.set(textHash, embedding);
        }

        results.push({
          success: true,
          vectorId,
          embedding,
          processingTime: 0 // Individual timing not tracked in batch
        });
      } catch (error) {
        results.push({
          success: false,
          processingTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const indexingTime = Date.now() - indexingStartTime;
    const totalTime = Date.now() - startTime;

    return {
      results,
      stats: {
        totalTime,
        embeddingTime,
        indexingTime,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length
      }
    };
  }

  /**
   * Load user's vector index from storage
   */
  async loadUserIndex(userAddress: string, indexBlobId: string): Promise<void> {
    await this.indexService.loadIndex(indexBlobId, userAddress);
  }

  /**
   * Save user's vector index to storage
   */
  async saveUserIndex(userAddress: string): Promise<string> {
    return await this.indexService.saveIndex(userAddress);
  }

  /**
   * Force flush pending vectors for a user
   */
  async forceFlushUser(userAddress: string): Promise<void> {
    await this.indexService.forceFlush(userAddress);
  }

  /**
   * Get vector processing statistics
   */
  getStats() {
    const indexStats = this.indexService.getCacheStats();
    const embeddingStats = this.embeddingService.getStats();

    return {
      index: indexStats,
      embedding: embeddingStats,
      cache: {
        memoryCache: {
          size: this.memoryCache.size,
          enabled: this.config.enableMemoryCache
        },
        vectorIdCounters: Object.fromEntries(this.vectorIdCounter)
      }
    };
  }

  /**
   * Clear cache and reset state for a user
   */
  clearUserData(userAddress: string): void {
    this.indexService.clearUserIndex(userAddress);
    this.vectorIdCounter.delete(userAddress);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.indexService.destroy();
    this.memoryCache.clear();
    this.vectorIdCounter.clear();
  }

  // ==================== PRIVATE METHODS ====================

  private getNextVectorId(userAddress: string): number {
    const current = this.vectorIdCounter.get(userAddress) || 0;
    const next = current + 1;
    this.vectorIdCounter.set(userAddress, next);
    return next;
  }

  private hashText(text: string): string {
    // Simple hash function for text caching
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private matchesMetadata(metadata: any, filter: any): boolean {
    if (!metadata || !filter) return true;

    for (const [key, value] of Object.entries(filter)) {
      if (metadata[key] !== value) return false;
    }

    return true;
  }
}

export default VectorManager;