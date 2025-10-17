/**
 * BrowserHnswIndexService - Client-Side HNSW Vector Indexing
 *
 * Browser-compatible HNSW vector indexing with IndexedDB persistence.
 * Uses hnswlib-wasm for WASM-based vector search (10-50x faster than pure JS).
 *
 * Features:
 * - WASM-powered HNSW algorithm for fast vector search
 * - IndexedDB persistence (survives page refresh)
 * - Intelligent batching and caching
 * - Metadata filtering support
 * - Zero backend dependencies
 */

import type {
  HNSWIndexConfig,
  HNSWSearchResult,
  HNSWSearchOptions,
  BatchConfig,
  BatchStats,
  VectorError
} from '../embedding/types';

interface IndexCacheEntry {
  index: any; // hnswlib-wasm HierarchicalNSW instance
  lastModified: Date;
  pendingVectors: Map<number, number[]>;
  isDirty: boolean;
  version: number;
  metadata: Map<number, any>;
}

interface IndexedDBSchema {
  indices: {
    key: string; // userAddress
    value: {
      userAddress: string;
      indexData: ArrayBuffer; // Serialized HNSW index
      metadata: Record<string, any>;
      version: number;
      lastUpdated: number;
    };
  };
  vectors: {
    key: [string, number]; // [userAddress, vectorId]
    value: {
      userAddress: string;
      vectorId: number;
      vector: number[];
      metadata: any;
      timestamp: number;
    };
  };
}

/**
 * Browser-compatible HNSW vector indexing service with IndexedDB persistence
 */
export class BrowserHnswIndexService {
  private readonly indexCache = new Map<string, IndexCacheEntry>();
  private readonly batchJobs = new Map<string, any>();
  private readonly config: Required<BatchConfig>;
  private readonly indexConfig: Required<HNSWIndexConfig>;
  private batchProcessor?: number;
  private cacheCleanup?: number;
  private db?: IDBDatabase;
  private hnswLib?: any; // Will be loaded dynamically

  constructor(
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

    this.initializeIndexedDB();
    this.startBatchProcessor();
    this.startCacheCleanup();
  }

  /**
   * Initialize IndexedDB for persistence
   */
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('HnswIndexDB', 1);

      request.onerror = () => reject(new Error('Failed to open IndexedDB'));

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized for HNSW indices');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Indices store
        if (!db.objectStoreNames.contains('indices')) {
          const indicesStore = db.createObjectStore('indices', { keyPath: 'userAddress' });
          indicesStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }

        // Vectors store
        if (!db.objectStoreNames.contains('vectors')) {
          const vectorsStore = db.createObjectStore('vectors', { keyPath: ['userAddress', 'vectorId'] });
          vectorsStore.createIndex('userAddress', 'userAddress', { unique: false });
          vectorsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Load hnswlib-wasm dynamically (only when needed)
   */
  private async loadHnswLib(): Promise<any> {
    if (this.hnswLib) return this.hnswLib;

    try {
      // Dynamic import for hnswlib-wasm
      const module = await import('hnswlib-wasm');
      // Use the module directly (hnswlib-wasm exports HierarchicalNSW directly)
      this.hnswLib = module;
      console.log('✅ hnswlib-wasm loaded successfully');
      return this.hnswLib;
    } catch (error) {
      console.error('❌ Failed to load hnswlib-wasm:', error);
      throw new Error('hnswlib-wasm is required but not available. Install it with: npm install hnswlib-wasm');
    }
  }

  /**
   * Create a new HNSW index
   */
  async createIndex(
    userAddress: string,
    options: Partial<HNSWIndexConfig> = {}
  ): Promise<{ index: any; serialized: ArrayBuffer }> {
    try {
      const hnswLib = await this.loadHnswLib();
      const config = { ...this.indexConfig, ...options };

      console.log(`Creating new HNSW index for user ${userAddress} with dimensions ${config.dimension}`);

      // Create a new index (hnswlib-wasm API)
      const index = new hnswLib.HierarchicalNSW(config.spaceType, config.dimension);
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
      const serialized = index.serializeIndex();

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
        console.warn(`No cached index found for user ${userAddress}, will create on flush`);
        // Create empty cache entry
        cacheEntry = {
          index: null,
          lastModified: new Date(),
          pendingVectors: new Map(),
          isDirty: true,
          version: 1,
          metadata: new Map()
        };
        this.indexCache.set(userAddress, cacheEntry);
      }

      // Add to pending queue
      cacheEntry.pendingVectors.set(vectorId, vector);
      if (metadata) {
        cacheEntry.metadata.set(vectorId, metadata);
      }
      cacheEntry.isDirty = true;
      cacheEntry.lastModified = new Date();

      // Schedule batch job
      this.scheduleBatchJob(userAddress, vectorId, vector);

      console.debug(`Vector ${vectorId} queued for batch processing for user ${userAddress}. Pending: ${cacheEntry.pendingVectors.size}`);

      // Process immediately if batch size limit reached
      if (cacheEntry.pendingVectors.size >= this.config.maxBatchSize) {
        console.log(`Batch size limit reached for user ${userAddress}, processing immediately`);
        setTimeout(() => this.flushPendingVectors(userAddress), 0);
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
        // Try to load from IndexedDB
        const loaded = await this.loadIndexFromDB(userAddress);
        if (!loaded) {
          // No index exists yet - this is normal for new users or users with no memories
          console.info(`No index found for user ${userAddress} - returning empty results`);
          return {
            ids: [],
            distances: [],
            similarities: []
          };
        }
      }

      const { k = 10, efSearch = 50, filter } = options;

      const entry = this.indexCache.get(userAddress)!;

      // Set search parameters
      if (entry.index.setEf) {
        entry.index.setEf(efSearch);
      }

      let searchIndex = entry.index;

      // If there are pending vectors, create a temporary index for search
      if (entry.pendingVectors.size > 0) {
        searchIndex = await this.cloneIndexWithPending(entry, queryVector.length);
      }

      // Perform search
      const result = searchIndex.searchKnn(queryVector, k);

      // Apply metadata filter if provided
      let filteredIds = result.neighbors || result.indices || [];
      let filteredDistances = result.distances;

      if (filter && entry.metadata.size > 0) {
        const filtered = this.applyMetadataFilter(filteredIds, filteredDistances, entry.metadata, filter);
        filteredIds = filtered.ids;
        filteredDistances = filtered.distances;
      }

      // Convert distances to similarities (for cosine distance)
      const similarities = this.indexConfig.spaceType === 'cosine'
        ? filteredDistances.map((dist: number) => 1 - dist)
        : filteredDistances.map((dist: number) => 1 / (1 + dist));

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
   * Load index from IndexedDB
   */
  async loadIndexFromDB(userAddress: string): Promise<boolean> {
    if (!this.db) {
      await this.initializeIndexedDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['indices'], 'readonly');
      const store = transaction.objectStore('indices');
      const request = store.get(userAddress);

      request.onsuccess = async () => {
        const result = request.result;
        if (!result) {
          resolve(false);
          return;
        }

        try {
          const hnswLib = await this.loadHnswLib();

          // Deserialize index
          const index = new hnswLib.HierarchicalNSW(this.indexConfig.spaceType, this.indexConfig.dimension);
          index.deserializeIndex(new Uint8Array(result.indexData));

          // Cache the loaded index
          // Convert metadata string keys back to numbers (vectorId)
          const metadataEntries = Object.entries(result.metadata || {})
            .map(([k, v]) => [Number(k), v] as [number, any]);

          this.indexCache.set(userAddress, {
            index,
            lastModified: new Date(result.lastUpdated),
            pendingVectors: new Map(),
            isDirty: false,
            version: result.version,
            metadata: new Map(metadataEntries)
          });

          console.log(`✅ Successfully loaded index for user ${userAddress} from IndexedDB`);
          resolve(true);
        } catch (error) {
          console.error('Failed to deserialize index:', error);
          reject(error);
        }
      };

      request.onerror = () => reject(new Error('Failed to load index from IndexedDB'));
    });
  }

  /**
   * Save index to IndexedDB
   */
  async saveIndexToDB(userAddress: string): Promise<void> {
    const cacheEntry = this.indexCache.get(userAddress);
    if (!cacheEntry?.index) {
      throw new Error(`No index found for user ${userAddress}`);
    }

    if (!this.db) {
      await this.initializeIndexedDB();
    }

    return new Promise((resolve, reject) => {
      // Serialize index
      const serialized = cacheEntry.index.serializeIndex();

      const transaction = this.db!.transaction(['indices'], 'readwrite');
      const store = transaction.objectStore('indices');

      const data = {
        userAddress,
        indexData: serialized.buffer || serialized,
        metadata: Object.fromEntries(cacheEntry.metadata),
        version: cacheEntry.version,
        lastUpdated: Date.now()
      };

      const request = store.put(data);

      request.onsuccess = () => {
        console.log(`✅ Index saved to IndexedDB for user ${userAddress}`);
        resolve();
      };

      request.onerror = () => reject(new Error('Failed to save index to IndexedDB'));
    });
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
        hasIndex: !!entry.index
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

    if (this.db) {
      this.db.close();
    }
  }

  // ==================== PRIVATE METHODS ====================

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
    this.batchProcessor = window.setInterval(async () => {
      await this.processBatchJobs();
    }, this.config.batchDelayMs);
  }

  private startCacheCleanup(): void {
    this.cacheCleanup = window.setInterval(() => {
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
      // Create index if it doesn't exist
      if (!cacheEntry.index) {
        const { index } = await this.createIndex(userAddress);
        cacheEntry.index = index;
      }

      // Add all pending vectors to the index
      for (const [vectorId, vector] of cacheEntry.pendingVectors.entries()) {
        cacheEntry.index.addPoint(vector, vectorId);
      }

      // Save to IndexedDB
      await this.saveIndexToDB(userAddress);

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

  private async cloneIndexWithPending(cacheEntry: IndexCacheEntry, dimensions: number): Promise<any> {
    const hnswLib = await this.loadHnswLib();

    // Serialize original index
    const serialized = cacheEntry.index.serializeIndex();

    // Create clone
    const clonedIndex = new hnswLib.HierarchicalNSW(this.indexConfig.spaceType, dimensions);
    clonedIndex.deserializeIndex(new Uint8Array(serialized));

    // Add pending vectors
    for (const [vectorId, vector] of cacheEntry.pendingVectors.entries()) {
      clonedIndex.addPoint(vector, vectorId);
    }

    return clonedIndex;
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

  private createVectorError(code: VectorError['code'], message: string, details?: any): VectorError {
    const error = new Error(message) as VectorError;
    error.code = code;
    error.details = details;
    return error;
  }
}

export default BrowserHnswIndexService;
