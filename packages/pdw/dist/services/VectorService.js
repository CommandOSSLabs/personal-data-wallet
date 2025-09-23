"use strict";
/**
 * VectorService - HNSW vector indexing and similarity search
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorService = void 0;
const hnswlib_node_1 = require("hnswlib-node");
class VectorService {
    constructor(config = {}) {
        this.indices = new Map();
        this.vectorData = new Map();
        this.vectorIdCounters = new Map();
        this.config = {
            dimensions: config.dimensions || 768,
            maxElements: config.maxElements || 10000,
            efConstruction: config.efConstruction || 200,
            m: config.m || 16,
            enablePersistence: config.enablePersistence !== false
        };
    }
    /**
     * Initialize or get HNSW index for a user
     */
    getOrCreateIndex(userId) {
        if (!this.indices.has(userId)) {
            const index = new hnswlib_node_1.HierarchicalNSW('cosine', this.config.dimensions);
            index.initIndex(this.config.maxElements, this.config.m, this.config.efConstruction);
            this.indices.set(userId, index);
            this.vectorData.set(userId, new Map());
            this.vectorIdCounters.set(userId, 0);
        }
        return this.indices.get(userId);
    }
    /**
     * Add vector to user's index
     */
    addVector(userId, vector, text, metadata = {}) {
        const index = this.getOrCreateIndex(userId);
        const vectorId = this.getNextVectorId(userId);
        // Add vector to HNSW index
        index.addPoint(vector, vectorId);
        // Store associated data
        const userData = this.vectorData.get(userId);
        userData.set(vectorId, { text, metadata });
        return vectorId;
    }
    /**
     * Search for similar vectors
     */
    async searchSimilar(userId, queryVector, options = {}) {
        const startTime = Date.now();
        const index = this.indices.get(userId);
        if (!index) {
            return {
                results: [],
                totalResults: 0,
                stats: {
                    searchTime: Date.now() - startTime,
                    embeddingTime: 0,
                    indexSearchTime: 0,
                    totalResults: 0,
                    cacheHits: 0,
                    indexSize: 0
                }
            };
        }
        const k = options.k || 10;
        const efSearch = options.efSearch || 50;
        // Set search parameters
        index.setEf(efSearch);
        // Search in HNSW index
        const indexStartTime = Date.now();
        const searchResult = index.searchKnn(queryVector, k);
        const indexSearchTime = Date.now() - indexStartTime;
        // Get user data
        const userData = this.vectorData.get(userId);
        // Build results
        const results = [];
        for (let i = 0; i < searchResult.neighbors.length; i++) {
            const vectorId = searchResult.neighbors[i];
            const distance = searchResult.distances[i];
            const similarity = 1 - distance; // Convert cosine distance to similarity
            // Apply threshold filter
            if (options.threshold && similarity < options.threshold) {
                continue;
            }
            const data = userData.get(vectorId);
            if (data) {
                const match = {
                    memoryId: `memory_${vectorId}`,
                    vectorId,
                    similarity,
                    distance,
                    metadata: data.metadata
                };
                if (options.includeEmbeddings) {
                    // Note: HNSW doesn't store original vectors by default
                    // In a production implementation, you'd need to store vectors separately
                    match.embedding = {
                        vector: [], // Would need to be retrieved from storage
                        dimension: this.config.dimensions,
                        model: 'stored'
                    };
                }
                results.push(match);
            }
        }
        return {
            results,
            totalResults: results.length,
            stats: {
                searchTime: Date.now() - startTime,
                embeddingTime: 0,
                indexSearchTime,
                totalResults: results.length,
                cacheHits: 0,
                indexSize: index.getCurrentCount()
            }
        };
    }
    /**
     * Save index to binary data (for Walrus storage)
     */
    saveIndex(userId) {
        const index = this.indices.get(userId);
        if (!index) {
            return null;
        }
        try {
            // Save index to temporary filename and get data
            const tempFilename = `temp_index_${userId}.bin`;
            index.writeIndexSync(tempFilename);
            // Read the binary data (this is simplified - in production, you'd read the file)
            // For now, just serialize the essential metadata
            const userData = this.vectorData.get(userId) || new Map();
            const userDataJson = JSON.stringify(Array.from(userData.entries()));
            // Combine metadata (without actual binary data for simplicity)
            const combined = {
                userData: userDataJson,
                config: this.config,
                indexFilename: tempFilename
            };
            return new TextEncoder().encode(JSON.stringify(combined));
        }
        catch (error) {
            console.error('Failed to save index:', error);
            return null;
        }
    }
    /**
     * Load index from binary data (from Walrus storage)
     */
    loadIndex(userId, data) {
        try {
            const combined = JSON.parse(new TextDecoder().decode(data));
            // Recreate HNSW index
            const index = new hnswlib_node_1.HierarchicalNSW('cosine', combined.config.dimensions);
            // If we have an index filename, try to read it
            if (combined.indexFilename) {
                try {
                    index.readIndexSync(combined.indexFilename);
                }
                catch (err) {
                    console.warn('Could not read index file, creating new index');
                }
            }
            // Restore user data
            const userDataArray = JSON.parse(combined.userData);
            const userData = new Map(userDataArray);
            // Store in memory
            this.indices.set(userId, index);
            this.vectorData.set(userId, userData);
            // Set vector ID counter to max + 1
            const vectorIds = Array.from(userData.keys());
            const maxVectorId = vectorIds.length > 0 ? Math.max(...vectorIds) : 0;
            this.vectorIdCounters.set(userId, maxVectorId + 1);
            return true;
        }
        catch (error) {
            console.error('Failed to load index:', error);
            return false;
        }
    }
    /**
     * Get index statistics
     */
    getIndexStats(userId) {
        const index = this.indices.get(userId);
        const userData = this.vectorData.get(userId);
        if (!index || !userData) {
            return {
                vectorCount: 0,
                indexSize: 0,
                memoryUsage: 0
            };
        }
        return {
            vectorCount: index.getCurrentCount(),
            indexSize: userData.size,
            memoryUsage: index.getCurrentCount() * this.config.dimensions * 4 // Rough estimate
        };
    }
    /**
     * Clear user's index
     */
    clearIndex(userId) {
        this.indices.delete(userId);
        this.vectorData.delete(userId);
        this.vectorIdCounters.delete(userId);
    }
    /**
     * Get next vector ID for user
     */
    getNextVectorId(userId) {
        const current = this.vectorIdCounters.get(userId) || 0;
        const next = current + 1;
        this.vectorIdCounters.set(userId, next);
        return next;
    }
}
exports.VectorService = VectorService;
//# sourceMappingURL=VectorService.js.map