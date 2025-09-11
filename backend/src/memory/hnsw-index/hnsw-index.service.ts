import { Injectable, Logger } from '@nestjs/common';
import * as hnswlib from 'hnswlib-node';
import * as fs from 'fs';
import { CachedWalrusService } from '../../infrastructure/walrus/cached-walrus.service';
import { DemoStorageService } from '../../infrastructure/demo-storage/demo-storage.service';
import { ConfigService } from '@nestjs/config';

interface IndexCacheEntry {
  index: hnswlib.HierarchicalNSW;
  lastModified: Date;
  pendingVectors: Map<number, number[]>; // vectorId -> vector
  isDirty: boolean;
  version: number;
}

interface BatchUpdateJob {
  userAddress: string;
  vectors: Map<number, number[]>;
  scheduledAt: Date;
}

@Injectable()
export class HnswIndexService {
  private logger = new Logger(HnswIndexService.name);
  private readonly indexCache = new Map<string, IndexCacheEntry>();
  private readonly batchJobs = new Map<string, BatchUpdateJob>();
  private readonly BATCH_DELAY_MS = 5000; // 5 seconds
  private readonly MAX_BATCH_SIZE = 50; // Max vectors per batch
  private readonly CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
  private readonly DEFAULT_VECTOR_DIMENSIONS = 768; // Gemini embedding-001 default

  constructor(
    private walrusService: CachedWalrusService,
    private demoStorageService: DemoStorageService,
    private configService: ConfigService
  ) {
    // Start the batch processing timer
    this.startBatchProcessor();

    // Start cache cleanup timer
    this.startCacheCleanup();
  }

  /**
   * Get the appropriate storage service based on demo mode
   */
  private getStorageService(): CachedWalrusService | DemoStorageService {
    const isDemoMode = this.configService.get<boolean>('USE_DEMO_STORAGE', true);
    return isDemoMode ? this.demoStorageService : this.walrusService;
  }

  /**
   * Start the batch processor that periodically uploads pending index updates
   */
  private startBatchProcessor(): void {
    setInterval(async () => {
      await this.processBatchJobs();
    }, this.BATCH_DELAY_MS);
  }

  /**
   * Start cache cleanup timer to remove stale entries
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanupCache();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Clean up stale cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [userAddress, entry] of this.indexCache.entries()) {
      if (now - entry.lastModified.getTime() > this.CACHE_TTL_MS) {
        this.logger.debug(`Removing stale cache entry for user ${userAddress}`);
        this.indexCache.delete(userAddress);
      }
    }
  }

  /**
   * Process all pending batch jobs
   */
  private async processBatchJobs(): Promise<void> {
    const now = Date.now();
    const jobsToProcess: string[] = [];

    // Find jobs that are ready to process
    for (const [userAddress, job] of this.batchJobs.entries()) {
      const timeSinceScheduled = now - job.scheduledAt.getTime();
      const cacheEntry = this.indexCache.get(userAddress);

      if (timeSinceScheduled >= this.BATCH_DELAY_MS ||
          (cacheEntry && cacheEntry.pendingVectors.size >= this.MAX_BATCH_SIZE)) {
        jobsToProcess.push(userAddress);
      }
    }

    // Process each job
    for (const userAddress of jobsToProcess) {
      try {
        await this.flushPendingVectors(userAddress);
      } catch (error) {
        this.logger.error(`Error processing batch job for user ${userAddress}: ${error.message}`);
      }
    }
  }

  /**
   * Flush pending vectors for a user to Walrus
   */
  private async flushPendingVectors(userAddress: string): Promise<void> {
    const cacheEntry = this.indexCache.get(userAddress);
    if (!cacheEntry || cacheEntry.pendingVectors.size === 0) {
      return;
    }

    this.logger.log(`Flushing ${cacheEntry.pendingVectors.size} pending vectors for user ${userAddress}`);

    try {
      // Ensure we have an index to work with
      if (!cacheEntry.index) {
        // Determine dimensions from the first pending vector
        const firstVector = cacheEntry.pendingVectors.values().next().value;
        const dimensions = firstVector ? firstVector.length : this.DEFAULT_VECTOR_DIMENSIONS;

        this.logger.log(`Creating new index for user ${userAddress} during flush with ${dimensions} dimensions`);
        const newIndex = new hnswlib.HierarchicalNSW('cosine', dimensions);
        newIndex.initIndex(1000); // Initial capacity
        cacheEntry.index = newIndex;
      }

      // Add all pending vectors to the index
      for (const [vectorId, vector] of cacheEntry.pendingVectors.entries()) {
        try {
          cacheEntry.index.addPoint(vector, vectorId);
          this.logger.debug(`Added vector ${vectorId} with ${vector.length} dimensions to index for user ${userAddress}`);
        } catch (error) {
          this.logger.error(`Failed to add vector ${vectorId} to index for user ${userAddress}: ${error.message}`);
          this.logger.error(`Vector dimensions: ${vector.length}, Index dimensions: ${cacheEntry.index.getNumDimensions?.() || 'unknown'}`);
          throw error;
        }
      }

      // Save the updated index to Walrus
      const newBlobId = await this.saveIndexToWalrus(cacheEntry.index, userAddress);

      // Clear pending vectors and mark as clean
      cacheEntry.pendingVectors.clear();
      cacheEntry.isDirty = false;
      cacheEntry.lastModified = new Date();
      cacheEntry.version++;

      // Remove the batch job
      this.batchJobs.delete(userAddress);

      this.logger.log(`Successfully flushed vectors for user ${userAddress}, new blob ID: ${newBlobId}`);

      // Emit an event or callback to update on-chain index pointer
      // This would be handled by a separate service in a production system
      this.onIndexUpdated?.(userAddress, newBlobId, cacheEntry.version);
    } catch (error) {
      this.logger.error(`Error flushing vectors for user ${userAddress}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Callback for when index is updated (can be overridden by dependency injection)
   */
  private onIndexUpdated?: (userAddress: string, newBlobId: string, version: number) => void;

  /**
   * Save index to Walrus (internal method)
   */
  private async saveIndexToWalrus(index: hnswlib.HierarchicalNSW, userAddress: string): Promise<string> {
    // Create a temporary file path for serialization
    const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;

    try {
      // Save the index to the temporary file
      index.writeIndexSync(tempFilePath);

      // Read the file into a buffer
      const serialized = fs.readFileSync(tempFilePath);

      // Get admin address for blob ownership (ensures backend access)
      const storageService = this.getStorageService();
      const adminAddress = storageService.getAdminAddress();

      // Save to storage with dual-ownership pattern
      const blobId = await storageService.uploadFile(
        serialized,
        `index_${userAddress}_${Date.now()}.hnsw`,
        adminAddress, // owner address
        12, // epochs
        {
          'user-address': userAddress,  // Record actual user for permission checks
          'content-type': 'application/hnsw-index',
          'version': '1.0'
        }
      );

      return blobId;
    } finally {
      // Clean up the temporary file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        // ignore cleanup errors
      }
    }
  }

  /**
   * Get or load index from cache/Walrus
   */
  async getOrLoadIndexCached(userAddress: string, indexBlobId?: string): Promise<hnswlib.HierarchicalNSW | null> {
    // Check cache first
    const cacheEntry = this.indexCache.get(userAddress);
    if (cacheEntry && cacheEntry.index) {
      cacheEntry.lastModified = new Date(); // Update access time
      return cacheEntry.index;
    }

    // Load from Walrus if blob ID provided
    if (indexBlobId) {
      try {
        const index = await this.loadIndexFromWalrus(indexBlobId, userAddress);

        // Cache the loaded index
        this.indexCache.set(userAddress, {
          index,
          lastModified: new Date(),
          pendingVectors: new Map(),
          isDirty: false,
          version: 1
        });

        return index;
      } catch (error) {
        this.logger.error(`Error loading index from Walrus: ${error.message}`);
        return null;
      }
    }

    return null;
  }

  /**
   * Add an index to cache (for new indexes created in memory)
   */
  addIndexToCache(userAddress: string, index: hnswlib.HierarchicalNSW, version: number = 1): void {
    this.indexCache.set(userAddress, {
      index,
      lastModified: new Date(),
      pendingVectors: new Map(),
      isDirty: false,
      version
    });

    this.logger.log(`Index added to cache for user ${userAddress}`);
  }

  /**
   * Load index from Walrus (internal method)
   */
  private async loadIndexFromWalrus(blobId: string, userAddress: string): Promise<hnswlib.HierarchicalNSW> {
    const storageService = this.getStorageService();
    const buffer = await storageService.downloadFile(blobId);

    // Create a temporary file to load the index
    const tempFilePath = `./tmp_hnsw_load_${Date.now()}.bin`;

    try {
      // Write buffer to temporary file
      fs.writeFileSync(tempFilePath, buffer);

      // Load the index from the temporary file
      const index = new hnswlib.HierarchicalNSW('cosine', this.DEFAULT_VECTOR_DIMENSIONS);
      index.readIndexSync(tempFilePath);

      return index;
    } finally {
      // Clean up the temporary file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        // ignore cleanup errors
      }
    }
  }

  /**
   * Create a new HNSW index
   * @param dimensions Vector dimensions
   * @param maxElements Maximum number of elements
   * @returns The index and its serialized form
   */
  async createIndex(
    dimensions: number = 768,
    maxElements: number = 10000
  ): Promise<{ index: hnswlib.HierarchicalNSW; serialized: Buffer }> {
    try {
      this.logger.log(`Creating new HNSW index with dimensions ${dimensions}, max elements ${maxElements}`);
      
      // Create a new index
      const index = new hnswlib.HierarchicalNSW('cosine', dimensions);
      index.initIndex(maxElements);
      
      // Create a temporary file path for serialization
      const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;
      
      // Save the index to the temporary file
      index.writeIndexSync(tempFilePath);
      
      // Read the file into a buffer
      const serialized = fs.readFileSync(tempFilePath);
      
      // Clean up the temporary file
      try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore */ }
      
      return { index, serialized };
    } catch (error) {
      this.logger.error(`Error creating index: ${error.message}`);
      throw new Error(`Index creation error: ${error.message}`);
    }
  }

  /**
   * Add a vector to the index (optimized with batching)
   * @param userAddress The user address
   * @param id The vector ID
   * @param vector The vector to add
   */
  addVectorToIndexBatched(userAddress: string, id: number, vector: number[]): void {
    try {
      // Detect vector dimensions from the first vector
      const vectorDimensions = vector.length;

      // Get or create cache entry
      let cacheEntry = this.indexCache.get(userAddress);
      if (!cacheEntry) {
        this.logger.warn(`No cached index found for user ${userAddress}, creating new index in memory`);

        // Create a new index in memory with the correct dimensions
        const newIndex = new hnswlib.HierarchicalNSW('cosine', vectorDimensions);
        newIndex.initIndex(1000); // Initial capacity

        // Create cache entry with the new index
        cacheEntry = {
          index: newIndex,
          lastModified: new Date(),
          pendingVectors: new Map(),
          isDirty: true,
          version: 1
        };
        this.indexCache.set(userAddress, cacheEntry);

        this.logger.log(`Created new in-memory index for user ${userAddress} with ${vectorDimensions} dimensions`);
      }

      // Validate vector dimensions match the index
      if (cacheEntry.index && cacheEntry.index.getNumDimensions && cacheEntry.index.getNumDimensions() !== vectorDimensions) {
        this.logger.error(`Vector dimension mismatch for user ${userAddress}: expected ${cacheEntry.index.getNumDimensions()}, got ${vectorDimensions}`);
        throw new Error(`Vector dimension mismatch: expected ${cacheEntry.index.getNumDimensions()}, got ${vectorDimensions}`);
      }

      // Add vector to pending queue
      cacheEntry.pendingVectors.set(id, vector);
      cacheEntry.isDirty = true;
      cacheEntry.lastModified = new Date();

      // Schedule or update batch job
      let batchJob = this.batchJobs.get(userAddress);
      if (!batchJob) {
        batchJob = {
          userAddress,
          vectors: new Map(),
          scheduledAt: new Date()
        };
        this.batchJobs.set(userAddress, batchJob);
      }

      batchJob.vectors.set(id, vector);

      this.logger.debug(`Vector ${id} queued for batch processing for user ${userAddress}. Pending: ${cacheEntry.pendingVectors.size}`);

      // If we've reached the batch size limit, process immediately
      if (cacheEntry.pendingVectors.size >= this.MAX_BATCH_SIZE) {
        this.logger.log(`Batch size limit reached for user ${userAddress}, processing immediately`);
        // Process asynchronously to avoid blocking
        setImmediate(() => this.flushPendingVectors(userAddress));
      }
    } catch (error) {
      this.logger.error(`Error queuing vector for batch processing: ${error.message}`);
      throw new Error(`Vector batching error: ${error.message}`);
    }
  }

  /**
   * Add a vector to the index (legacy method for backward compatibility)
   * @param index The HNSW index
   * @param id The vector ID
   * @param vector The vector to add
   */
  addVectorToIndex(index: hnswlib.HierarchicalNSW, id: number, vector: number[]): void {
    try {
      index.addPoint(vector, id);
    } catch (error) {
      this.logger.error(`Error adding vector to index: ${error.message}`);
      throw new Error(`Vector addition error: ${error.message}`);
    }
  }

  /**
   * Force flush all pending vectors for a user (useful for immediate consistency)
   */
  async forceFlush(userAddress: string): Promise<void> {
    await this.flushPendingVectors(userAddress);
  }

  /**
   * Search vectors in the index (including pending vectors)
   * This allows immediate search even before vectors are persisted to Walrus
   */
  async searchVectors(userAddress: string, queryVector: number[], k: number = 10): Promise<{
    ids: number[];
    distances: number[];
  }> {
    const cacheEntry = this.indexCache.get(userAddress);
    if (!cacheEntry || !cacheEntry.index) {
      throw new Error(`No index found for user ${userAddress}`);
    }

    // If there are pending vectors, add them to a temporary index for search
    if (cacheEntry.pendingVectors.size > 0) {
      // Create a temporary index that includes pending vectors
      const tempIndex = this.cloneIndex(cacheEntry.index);

      // Add pending vectors to the temporary index
      for (const [vectorId, vector] of cacheEntry.pendingVectors.entries()) {
        tempIndex.addPoint(vector, vectorId);
      }

      // Search the temporary index
      const result = tempIndex.searchKnn(queryVector, k);
      return {
        ids: result.neighbors,
        distances: result.distances
      };
    } else {
      // Search the main index
      const result = cacheEntry.index.searchKnn(queryVector, k);
      return {
        ids: result.neighbors,
        distances: result.distances
      };
    }
  }

  /**
   * Clone an HNSW index (for temporary search operations)
   */
  private cloneIndex(originalIndex: hnswlib.HierarchicalNSW): hnswlib.HierarchicalNSW {
    // Create a temporary file to serialize/deserialize the index
    const tempFilePath = `./tmp_hnsw_clone_${Date.now()}.bin`;

    try {
      // Serialize the original index
      originalIndex.writeIndexSync(tempFilePath);

      // Create a new index and load the serialized data
      const clonedIndex = new hnswlib.HierarchicalNSW('cosine', this.DEFAULT_VECTOR_DIMENSIONS);
      clonedIndex.readIndexSync(tempFilePath);

      return clonedIndex;
    } finally {
      // Clean up the temporary file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        // ignore cleanup errors
      }
    }
  }

  /**
   * Clear user index cache (useful for dimension mismatches)
   */
  clearUserIndex(userAddress: string): void {
    this.indexCache.delete(userAddress);
    this.batchJobs.delete(userAddress);
    this.logger.log(`Cleared index cache for user ${userAddress}`);
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    totalUsers: number;
    totalPendingVectors: number;
    activeBatchJobs: number;
    cacheEntries: Array<{
      userAddress: string;
      pendingVectors: number;
      lastModified: Date;
      isDirty: boolean;
      indexDimensions: number | string;
    }>;
  } {
    const cacheEntries: Array<{
      userAddress: string;
      pendingVectors: number;
      lastModified: Date;
      isDirty: boolean;
      indexDimensions: number | string;
    }> = [];
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
      cacheEntries
    };
  }

  /**
   * Search the index for similar vectors
   * @param index The HNSW index
   * @param vector The query vector
   * @param k Number of results to return
   * @returns The search results
   */
  searchIndex(
    index: hnswlib.HierarchicalNSW, 
    vector: number[], 
    k: number
  ): { ids: number[]; distances: number[] } {
    try {
      const results = index.searchKnn(vector, k);
      
      return {
        ids: results.neighbors,
        distances: results.distances
      };
    } catch (error) {
      this.logger.error(`Error searching index: ${error.message}`);
      throw new Error(`Index search error: ${error.message}`);
    }
  }

  /**
   * Serialize and save the index to Walrus
   * @param index The HNSW index
   * @param userAddress The user's address for access control
   * @returns The blob ID of the saved index
   */
  async saveIndex(index: hnswlib.HierarchicalNSW, userAddress: string): Promise<string> {
    try {
      // Validate userAddress
      if (!userAddress || userAddress === 'undefined') {
        throw new Error('User address is required for saving index');
      }
      
      this.logger.log(`Saving HNSW index for user ${userAddress}`);
      
      // Create a temporary file path for serialization
      const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;
      
      // Save the index to the temporary file
      index.writeIndexSync(tempFilePath);
      
      // Read the file into a buffer
      const serialized = fs.readFileSync(tempFilePath);
      
      // Clean up the temporary file
      try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore */ }
      
      // Get admin address for blob ownership (ensures backend access)
      const storageService = this.getStorageService();
      const adminAddress = storageService.getAdminAddress();

      // Save to storage with dual-ownership pattern
      // - Admin as the actual owner (for backend access)
      // - User address stored in metadata (for permission checks)
      const blobId = await storageService.uploadFile(
        serialized, 
        `index_${userAddress}_${Date.now()}.hnsw`,
        adminAddress, // Admin as owner for backend access
        12, // Default epochs
        { 
          'user-address': userAddress,  // Record actual user for permission checks
          'content-type': 'application/hnsw-index',
          'version': '1.0'
        }
      );
      
      this.logger.log(`Index saved to Walrus with blobId ${blobId}`);
      
      // Wait a bit to ensure blob is propagated to storage nodes
      this.logger.log('Waiting for blob propagation...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return blobId;
    } catch (error) {
      this.logger.error(`Error saving index: ${error.message}`);
      throw new Error(`Index save error: ${error.message}`);
    }
  }

  /**
   * Load an index from Walrus
   * @param blobId The blob ID of the index
   * @param userAddress The user's address for access verification
   * @returns The loaded index and its serialized form
   */
  async loadIndex(blobId: string, userAddress?: string): Promise<{ index: hnswlib.HierarchicalNSW; serialized: Buffer }> {
    try {
      this.logger.log(`Loading index from blobId: ${blobId}`);
      
      // Verify user access if an address is provided
      const storageService = this.getStorageService();
      if (userAddress) {
        const hasAccess = await storageService.verifyUserAccess(blobId, userAddress);
        if (!hasAccess) {
          this.logger.warn(`User ${userAddress} attempted to access index without permission: ${blobId}`);
          // Continue anyway since we're using admin to access
        }
      }

      // Download the index file
      const serialized = await storageService.downloadFile(blobId);
      
      // Create a temporary file path
      const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;
      
      // Write the serialized data to the temporary file
      fs.writeFileSync(tempFilePath, serialized);
      
      // Create a new index and load from the file
      const index = new hnswlib.HierarchicalNSW('cosine', 0); // Dimensions will be loaded from file
      index.readIndexSync(tempFilePath);
      
      // Clean up the temporary file
      try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore */ }
      
      return { index, serialized };
    } catch (error) {
      this.logger.error(`Error loading index: ${error.message}`);
      throw new Error(`Index load error: ${error.message}`);
    }
  }

  /**
   * Get the number of elements in the index
   * @param index The HNSW index
   * @returns The number of elements
   */
  getIndexSize(index: hnswlib.HierarchicalNSW): number {
    try {
      return index.getCurrentCount();
    } catch (error) {
      this.logger.error(`Error getting index size: ${error.message}`);
      throw new Error(`Index size error: ${error.message}`);
    }
  }

  /**
   * Remove a vector from the index
   * @param index The HNSW index
   * @param id The vector ID to remove
   */
  removeVectorFromIndex(index: hnswlib.HierarchicalNSW, id: number): void {
    try {
      index.markDelete(id);
    } catch (error) {
      this.logger.error(`Error removing vector from index: ${error.message}`);
      throw new Error(`Vector removal error: ${error.message}`);
    }
  }
}