/**
 * HnswIndexService - Local HNSW Vector Indexing
 * 
 * Provides local Hierarchical Navigable Small World (HNSW) vector indexing
 * with intelligent batching, caching, and Walrus persistence for the PDW SDK.
 */

import * as hnswlib from 'hnswlib-node';
import * as fs from 'fs';
import * as path from 'path';
import { StorageService } from '../storage/StorageService';
import { 
  HNSWIndexConfig, 
  HNSWSearchResult, 
  HNSWSearchOptions, 
  BatchConfig, 
  BatchJob, 
  BatchStats,
  VectorError 
} from '../embedding/types';

interface IndexCacheEntry {
  index: hnswlib.HierarchicalNSW;
  lastModified: Date;
  pendingVectors: Map<number, number[]>; // vectorId -> vector
  isDirty: boolean;
  version: number;
  metadata: Map<number, any>; // vectorId -> metadata
}

interface IndexMetadata {
  dimension: number;
  maxElements: number;
  efConstruction: number;
  m: number;
  spaceType: string;
  version: number;
  createdAt: Date;
  lastUpdated: Date;
}

/**
 * Local HNSW vector indexing service with batching and Walrus persistence
 */
export class HnswIndexService {
  private readonly indexCache = new Map<string, IndexCacheEntry>();
  private readonly batchJobs = new Map<string, BatchJob>();
  private readonly config: Required<BatchConfig>;
  private readonly indexConfig: Required<HNSWIndexConfig>;
  private batchProcessor?: NodeJS.Timer;
  private cacheCleanup?: NodeJS.Timer;

  constructor(
    private storageService: StorageService,
    indexConfig: Partial<HNSWIndexConfig> = {},
    batchConfig: Partial<BatchConfig> = {}
  ) {
    // Default HNSW configuration
    this.indexConfig = {
      dimension: indexConfig.dimension || 768,
      maxElements: indexConfig.maxElements || 10000,
      efConstruction: indexConfig.efConstruction || 200,
      m: indexConfig.m || 16,
      randomSeed: indexConfig.randomSeed || 42,
      spaceType: indexConfig.spaceType || 'cosine'
    };

    // Default batch configuration
    this.config = {
      maxBatchSize: batchConfig.maxBatchSize || 50,
      batchDelayMs: batchConfig.batchDelayMs || 5000,
      maxCacheSize: batchConfig.maxCacheSize || 100,
      cacheTtlMs: batchConfig.cacheTtlMs || 30 * 60 * 1000 // 30 minutes
    };

    this.startBatchProcessor();
    this.startCacheCleanup();
  }

  /**
   * Create a new HNSW index
   */
  async createIndex(
    userAddress: string,
    options: Partial<HNSWIndexConfig> = {}
  ): Promise<{ index: hnswlib.HierarchicalNSW; serialized: Buffer }> {
    try {
      const config = { ...this.indexConfig, ...options };
      
      console.log(`Creating new HNSW index for user ${userAddress} with dimensions ${config.dimension}`);
      
      // Create a new index
      const index = new hnswlib.HierarchicalNSW(config.spaceType as any, config.dimension);
      index.initIndex(config.maxElements, config.m, config.efConstruction, config.randomSeed);
      
      // Create cache entry
      this.indexCache.set(userAddress, {
        index,
        lastModified: new Date(),
        pendingVectors: new Map(),
        isDirty: false,
        version: 1,
        metadata: new Map()
      });

      // Serialize the empty index
      const tempFilePath = this.getTempFilePath();
      index.writeIndexSync(tempFilePath);
      const serialized = fs.readFileSync(tempFilePath);
      this.cleanupTempFile(tempFilePath);
      
      return { index, serialized };
    } catch (error) {
      throw this.createVectorError('INDEX_ERROR', `Failed to create index: ${error}`, error);
    }
  }

  /**
   * Add vector to index with batching (main entry point)
   */
  addVectorToIndexBatched(
    userAddress: string, 
    vectorId: number, 
    vector: number[],
    metadata?: any
  ): void {
    try {
      // Validate input
      this.validateVector(vector);
      
      // Get or create cache entry
      let cacheEntry = this.indexCache.get(userAddress);
      if (!cacheEntry) {
        console.warn(`No cached index found for user ${userAddress}, creating new index in memory`);
        cacheEntry = this.createCacheEntry(vector.length);
        this.indexCache.set(userAddress, cacheEntry);
      }

      // Validate vector dimensions
      const expectedDim = cacheEntry.index?.getNumDimensions?.() || this.indexConfig.dimension;
      if (vector.length !== expectedDim) {
        throw new Error(`Vector dimension mismatch: expected ${expectedDim}, got ${vector.length}`);
      }

      // Add to pending queue
      cacheEntry.pendingVectors.set(vectorId, vector);
      if (metadata) {
        cacheEntry.metadata.set(vectorId, metadata);
      }
      cacheEntry.isDirty = true;
      cacheEntry.lastModified = new Date();

      // Schedule or update batch job
      this.scheduleBatchJob(userAddress, vectorId, vector);

      console.debug(`Vector ${vectorId} queued for batch processing for user ${userAddress}. Pending: ${cacheEntry.pendingVectors.size}`);

      // Process immediately if batch size limit reached
      if (cacheEntry.pendingVectors.size >= this.config.maxBatchSize) {
        console.log(`Batch size limit reached for user ${userAddress}, processing immediately`);
        setImmediate(() => this.flushPendingVectors(userAddress));
      }
    } catch (error) {
      throw this.createVectorError('INDEX_ERROR', `Failed to queue vector: ${error}`, error);
    }
  }

  /**
   * Search vectors in the index (including pending vectors)
   */
  async searchVectors(
    userAddress: string, 
    queryVector: number[], 
    options: HNSWSearchOptions = {}
  ): Promise<HNSWSearchResult> {
    try {
      this.validateVector(queryVector);
      
      const cacheEntry = this.indexCache.get(userAddress);
      if (!cacheEntry?.index) {
        throw new Error(`No index found for user ${userAddress}`);
      }

      const { k = 10, efSearch = 50, filter } = options;

      // Set search parameters
      if (cacheEntry.index.setEf) {
        cacheEntry.index.setEf(efSearch);
      }

      let searchIndex = cacheEntry.index;

      // If there are pending vectors, create a temporary index for search
      if (cacheEntry.pendingVectors.size > 0) {
        searchIndex = await this.cloneIndexWithPending(cacheEntry, queryVector.length);
      }

      // Perform search
      const result = searchIndex.searchKnn(queryVector, k);
      
      // Apply metadata filter if provided
      let filteredIds = result.neighbors;
      let filteredDistances = result.distances;
      
      if (filter) {
        const filtered = this.applyMetadataFilter(result.neighbors, result.distances, cacheEntry.metadata, filter);
        filteredIds = filtered.ids;
        filteredDistances = filtered.distances;
      }

      // Convert distances to similarities (for cosine distance)
      const similarities = this.indexConfig.spaceType === 'cosine' 
        ? filteredDistances.map(dist => 1 - dist)
        : filteredDistances.map(dist => 1 / (1 + dist));

      return {
        ids: filteredIds,
        distances: filteredDistances,
        similarities
      };
    } catch (error) {
      throw this.createVectorError('SEARCH_ERROR', `Search failed: ${error}`, error);
    }
  }

  /**
   * Load index from Walrus storage
   */
  async loadIndex(blobId: string, userAddress: string): Promise<hnswlib.HierarchicalNSW> {
    try {
      console.log(`Loading HNSW index from Walrus for user ${userAddress}: ${blobId}`);

      // Download index from Walrus
      const retrieveResult = await this.storageService.retrieve(blobId);
      const indexBuffer = retrieveResult.content;
      
      // Create temporary file
      const tempFilePath = this.getTempFilePath();
      fs.writeFileSync(tempFilePath, indexBuffer);      // Load index from file
      const index = new hnswlib.HierarchicalNSW(this.indexConfig.spaceType as any, this.indexConfig.dimension);
      index.readIndexSync(tempFilePath);

      // Clean up
      this.cleanupTempFile(tempFilePath);

      // Cache the loaded index
      this.indexCache.set(userAddress, {
        index,
        lastModified: new Date(),
        pendingVectors: new Map(),
        isDirty: false,
        version: 1,
        metadata: new Map()
      });

      console.log(`Successfully loaded index for user ${userAddress}`);
      return index;
    } catch (error) {
      throw this.createVectorError('STORAGE_ERROR', `Failed to load index: ${error}`, error);
    }
  }

  /**
   * Save index to Walrus storage
   */
  async saveIndex(userAddress: string): Promise<string> {
    try {
      const cacheEntry = this.indexCache.get(userAddress);
      if (!cacheEntry?.index) {
        throw new Error(`No index found for user ${userAddress}`);
      }

      return await this.saveIndexToWalrus(cacheEntry.index, userAddress);
    } catch (error) {
      throw this.createVectorError('STORAGE_ERROR', `Failed to save index: ${error}`, error);
    }
  }

  /**
   * Force flush all pending vectors for a user
   */
  async forceFlush(userAddress: string): Promise<void> {
    await this.flushPendingVectors(userAddress);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): BatchStats {
    const cacheEntries: any[] = [];
    let totalPendingVectors = 0;

    for (const [userAddress, entry] of this.indexCache.entries()) {
      const pendingCount = entry.pendingVectors.size;
      totalPendingVectors += pendingCount;

      cacheEntries.push({
        userAddress,
        pendingVectors: pendingCount,
        lastModified: entry.lastModified,
        isDirty: entry.isDirty,
        indexDimensions: entry.index?.getNumDimensions?.() || 'unknown'
      });
    }

    return {
      totalUsers: this.indexCache.size,
      totalPendingVectors,
      activeBatchJobs: this.batchJobs.size,
      cacheHitRate: 0, // TODO: Implement hit rate tracking
      averageBatchSize: totalPendingVectors / Math.max(1, this.indexCache.size),
      averageProcessingTime: 0 // TODO: Implement timing tracking
    };
  }

  /**
   * Remove a vector from the index
   */
  removeVector(userAddress: string, vectorId: number): void {
    try {
      const cacheEntry = this.indexCache.get(userAddress);
      if (!cacheEntry?.index) {
        throw new Error(`No index found for user ${userAddress}`);
      }

      // Remove from pending vectors if exists
      cacheEntry.pendingVectors.delete(vectorId);
      cacheEntry.metadata.delete(vectorId);

      // Mark vector for deletion in HNSW (if it exists in the index)
      if (cacheEntry.index.markDelete) {
        cacheEntry.index.markDelete(vectorId);
      }

      cacheEntry.isDirty = true;
      cacheEntry.lastModified = new Date();
    } catch (error) {
      throw this.createVectorError('INDEX_ERROR', `Failed to remove vector: ${error}`, error);
    }
  }

  /**
   * Clear user index and cache
   */
  clearUserIndex(userAddress: string): void {
    this.indexCache.delete(userAddress);
    this.batchJobs.delete(userAddress);
    console.log(`Cleared index cache for user ${userAddress}`);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.batchProcessor) {
      clearInterval(this.batchProcessor);
    }
    if (this.cacheCleanup) {
      clearInterval(this.cacheCleanup);
    }
    this.indexCache.clear();
    this.batchJobs.clear();
  }

  // ==================== PRIVATE METHODS ====================

  private createCacheEntry(dimensions: number): IndexCacheEntry {
    const index = new hnswlib.HierarchicalNSW(this.indexConfig.spaceType as any, dimensions);
    index.initIndex(this.indexConfig.maxElements, this.indexConfig.m, this.indexConfig.efConstruction);

    return {
      index,
      lastModified: new Date(),
      pendingVectors: new Map(),
      isDirty: false,
      version: 1,
      metadata: new Map()
    };
  }

  private scheduleBatchJob(userAddress: string, vectorId: number, vector: number[]): void {
    let batchJob = this.batchJobs.get(userAddress);
    if (!batchJob) {
      batchJob = {
        userAddress,
        vectors: new Map(),
        scheduledAt: new Date()
      };
      this.batchJobs.set(userAddress, batchJob);
    }

    batchJob.vectors.set(vectorId, vector);
  }

  private startBatchProcessor(): void {
    this.batchProcessor = setInterval(async () => {
      await this.processBatchJobs();
    }, this.config.batchDelayMs);
  }

  private startCacheCleanup(): void {
    this.cacheCleanup = setInterval(() => {
      this.cleanupCache();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private async processBatchJobs(): Promise<void> {
    const now = Date.now();
    const jobsToProcess: string[] = [];

    for (const [userAddress, job] of this.batchJobs.entries()) {
      const timeSinceScheduled = now - job.scheduledAt.getTime();
      const cacheEntry = this.indexCache.get(userAddress);

      if (timeSinceScheduled >= this.config.batchDelayMs ||
          (cacheEntry && cacheEntry.pendingVectors.size >= this.config.maxBatchSize)) {
        jobsToProcess.push(userAddress);
      }
    }

    for (const userAddress of jobsToProcess) {
      try {
        await this.flushPendingVectors(userAddress);
      } catch (error) {
        console.error(`Error processing batch job for user ${userAddress}:`, error);
      }
    }
  }

  private async flushPendingVectors(userAddress: string): Promise<void> {
    const cacheEntry = this.indexCache.get(userAddress);
    if (!cacheEntry || cacheEntry.pendingVectors.size === 0) {
      return;
    }

    console.log(`Flushing ${cacheEntry.pendingVectors.size} pending vectors for user ${userAddress}`);

    try {
      // Add all pending vectors to the index
      for (const [vectorId, vector] of cacheEntry.pendingVectors.entries()) {
        cacheEntry.index.addPoint(vector, vectorId);
      }

      // Save to Walrus
      await this.saveIndexToWalrus(cacheEntry.index, userAddress);

      // Clear pending vectors
      cacheEntry.pendingVectors.clear();
      cacheEntry.isDirty = false;
      cacheEntry.lastModified = new Date();
      cacheEntry.version++;

      // Remove batch job
      this.batchJobs.delete(userAddress);

      console.log(`Successfully flushed vectors for user ${userAddress}`);
    } catch (error) {
      console.error(`Error flushing vectors for user ${userAddress}:`, error);
      throw error;
    }
  }

  private async saveIndexToWalrus(index: hnswlib.HierarchicalNSW, userAddress: string): Promise<string> {
    const tempFilePath = this.getTempFilePath();

    try {
      // Serialize index
      index.writeIndexSync(tempFilePath);
      const serialized = fs.readFileSync(tempFilePath);

      // Upload to Walrus via StorageService
      const result = await this.storageService.upload(new Uint8Array(serialized), {
        signer: undefined, // TODO: Get signer from context
        epochs: 12,
        tags: {
          'user-address': userAddress,
          'content-type': 'application/hnsw-index',
          'version': '1.0'
        }
      });

      return result.blobId;
    } finally {
      this.cleanupTempFile(tempFilePath);
    }
  }

  private async cloneIndexWithPending(cacheEntry: IndexCacheEntry, dimensions: number): Promise<hnswlib.HierarchicalNSW> {
    const tempFilePath = this.getTempFilePath();

    try {
      // Serialize original index
      cacheEntry.index.writeIndexSync(tempFilePath);

      // Create clone
      const clonedIndex = new hnswlib.HierarchicalNSW(this.indexConfig.spaceType as any, dimensions);
      clonedIndex.readIndexSync(tempFilePath);

      // Add pending vectors
      for (const [vectorId, vector] of cacheEntry.pendingVectors.entries()) {
        clonedIndex.addPoint(vector, vectorId);
      }

      return clonedIndex;
    } finally {
      this.cleanupTempFile(tempFilePath);
    }
  }

  private applyMetadataFilter(
    ids: number[], 
    distances: number[], 
    metadata: Map<number, any>,
    filter: (metadata: any) => boolean
  ): { ids: number[]; distances: number[] } {
    const filteredIds: number[] = [];
    const filteredDistances: number[] = [];

    for (let i = 0; i < ids.length; i++) {
      const vectorId = ids[i];
      const vectorMetadata = metadata.get(vectorId);
      
      if (!vectorMetadata || filter(vectorMetadata)) {
        filteredIds.push(vectorId);
        filteredDistances.push(distances[i]);
      }
    }

    return { ids: filteredIds, distances: filteredDistances };
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [userAddress, entry] of this.indexCache.entries()) {
      if (now - entry.lastModified.getTime() > this.config.cacheTtlMs) {
        console.debug(`Removing stale cache entry for user ${userAddress}`);
        this.indexCache.delete(userAddress);
      }
    }
  }

  private validateVector(vector: number[]): void {
    if (!Array.isArray(vector) || vector.length === 0) {
      throw new Error('Vector must be a non-empty array');
    }

    if (vector.some(v => typeof v !== 'number' || !isFinite(v))) {
      throw new Error('Vector must contain only finite numbers');
    }

    if (vector.length !== this.indexConfig.dimension) {
      throw new Error(`Vector dimension mismatch: expected ${this.indexConfig.dimension}, got ${vector.length}`);
    }
  }

  private getTempFilePath(): string {
    return path.join(process.cwd(), `tmp_hnsw_${Date.now()}_${Math.random().toString(36).substring(2)}.bin`);
  }

  private cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn(`Failed to cleanup temp file ${filePath}:`, error);
    }
  }

  private createVectorError(code: VectorError['code'], message: string, details?: any): VectorError {
    const error = new Error(message) as VectorError;
    error.code = code;
    error.details = details;
    return error;
  }
}

export default HnswIndexService;