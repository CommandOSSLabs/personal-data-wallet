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
/**
 * Browser-compatible HNSW vector indexing service with IndexedDB persistence
 */
export class BrowserHnswIndexService {
    constructor(indexConfig = {}, batchConfig = {}) {
        this.indexCache = new Map();
        this.batchJobs = new Map();
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
    async initializeIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('HnswIndexDB', 1);
            request.onerror = () => reject(new Error('Failed to open IndexedDB'));
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB initialized for HNSW indices');
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
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
    async loadHnswLib() {
        if (this.hnswLib)
            return this.hnswLib;
        try {
            // Dynamic import for hnswlib-wasm
            const module = await import('hnswlib-wasm');
            // Use the module directly (hnswlib-wasm exports HierarchicalNSW directly)
            this.hnswLib = module;
            console.log('✅ hnswlib-wasm loaded successfully');
            return this.hnswLib;
        }
        catch (error) {
            console.error('❌ Failed to load hnswlib-wasm:', error);
            throw new Error('hnswlib-wasm is required but not available. Install it with: npm install hnswlib-wasm');
        }
    }
    /**
     * Create a new HNSW index
     */
    async createIndex(userAddress, options = {}) {
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
        }
        catch (error) {
            throw this.createVectorError('INDEX_ERROR', `Failed to create index: ${error}`, error);
        }
    }
    /**
     * Add vector to index with batching (main entry point)
     */
    addVectorToIndexBatched(userAddress, vectorId, vector, metadata) {
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
        }
        catch (error) {
            throw this.createVectorError('INDEX_ERROR', `Failed to queue vector: ${error}`, error);
        }
    }
    /**
     * Search vectors in the index (including pending vectors)
     */
    async searchVectors(userAddress, queryVector, options = {}) {
        try {
            this.validateVector(queryVector);
            const cacheEntry = this.indexCache.get(userAddress);
            if (!cacheEntry?.index) {
                // Try to load from IndexedDB
                const loaded = await this.loadIndexFromDB(userAddress);
                if (!loaded) {
                    throw new Error(`No index found for user ${userAddress}`);
                }
            }
            const { k = 10, efSearch = 50, filter } = options;
            const entry = this.indexCache.get(userAddress);
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
                ? filteredDistances.map((dist) => 1 - dist)
                : filteredDistances.map((dist) => 1 / (1 + dist));
            return {
                ids: filteredIds,
                distances: filteredDistances,
                similarities
            };
        }
        catch (error) {
            throw this.createVectorError('SEARCH_ERROR', `Search failed: ${error}`, error);
        }
    }
    /**
     * Load index from IndexedDB
     */
    async loadIndexFromDB(userAddress) {
        if (!this.db) {
            await this.initializeIndexedDB();
        }
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['indices'], 'readonly');
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
                        .map(([k, v]) => [Number(k), v]);
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
                }
                catch (error) {
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
    async saveIndexToDB(userAddress) {
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
            const transaction = this.db.transaction(['indices'], 'readwrite');
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
    async forceFlush(userAddress) {
        await this.flushPendingVectors(userAddress);
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        const cacheEntries = [];
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
    clearUserIndex(userAddress) {
        this.indexCache.delete(userAddress);
        this.batchJobs.delete(userAddress);
        console.log(`Cleared index cache for user ${userAddress}`);
    }
    /**
     * Cleanup resources
     */
    destroy() {
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
    scheduleBatchJob(userAddress, vectorId, vector) {
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
    startBatchProcessor() {
        this.batchProcessor = window.setInterval(async () => {
            await this.processBatchJobs();
        }, this.config.batchDelayMs);
    }
    startCacheCleanup() {
        this.cacheCleanup = window.setInterval(() => {
            this.cleanupCache();
        }, 5 * 60 * 1000); // Every 5 minutes
    }
    async processBatchJobs() {
        const now = Date.now();
        const jobsToProcess = [];
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
            }
            catch (error) {
                console.error(`Error processing batch job for user ${userAddress}:`, error);
            }
        }
    }
    async flushPendingVectors(userAddress) {
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
        }
        catch (error) {
            console.error(`Error flushing vectors for user ${userAddress}:`, error);
            throw error;
        }
    }
    async cloneIndexWithPending(cacheEntry, dimensions) {
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
    applyMetadataFilter(ids, distances, metadata, filter) {
        const filteredIds = [];
        const filteredDistances = [];
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
    cleanupCache() {
        const now = Date.now();
        for (const [userAddress, entry] of this.indexCache.entries()) {
            if (now - entry.lastModified.getTime() > this.config.cacheTtlMs) {
                console.debug(`Removing stale cache entry for user ${userAddress}`);
                this.indexCache.delete(userAddress);
            }
        }
    }
    validateVector(vector) {
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
    createVectorError(code, message, details) {
        const error = new Error(message);
        error.code = code;
        error.details = details;
        return error;
    }
}
export default BrowserHnswIndexService;
//# sourceMappingURL=BrowserHnswIndexService.js.map