/**
 * Streamlined VectorManager for HNSW Vector Operations
 */
import { HierarchicalNSW } from 'hnswlib-node';
export class VectorManager {
    constructor(embeddingService, config = {}) {
        this.indices = new Map();
        this.metadata = new Map();
        this.vectorIdCounters = new Map();
        this.embeddingService = embeddingService;
        this.config = {
            dimensions: config.dimensions || 768,
            maxElements: config.maxElements || 10000,
            efConstruction: config.efConstruction || 200,
            m: config.m || 16
        };
    }
    /**
     * Initialize or get HNSW index for a user
     */
    getOrCreateIndex(userId) {
        if (!this.indices.has(userId)) {
            const index = new HierarchicalNSW('cosine', this.config.dimensions);
            index.initIndex(this.config.maxElements, this.config.m, this.config.efConstruction);
            this.indices.set(userId, index);
            this.metadata.set(userId, new Map());
            this.vectorIdCounters.set(userId, 0);
            console.log(`Created new HNSW index for user: ${userId}`);
        }
        return this.indices.get(userId);
    }
    /**
     * Add text to vector index (embed + index)
     */
    async addTextToIndex(userId, text, options = {}) {
        try {
            // Generate embedding
            const embeddingResult = await this.embeddingService.embedText({ text });
            // Get or create index
            const index = this.getOrCreateIndex(userId);
            const userMetadata = this.metadata.get(userId);
            // Get vector ID
            const vectorId = options.vectorId || this.getNextVectorId(userId);
            // Add to HNSW index
            index.addPoint(embeddingResult.vector, vectorId);
            // Store metadata
            userMetadata.set(vectorId, {
                id: vectorId,
                text,
                metadata: options.metadata,
                timestamp: Date.now()
            });
            return {
                success: true,
                vectorId,
                embedding: embeddingResult.vector
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Search for similar texts using vector similarity
     */
    async searchSimilarTexts(userId, queryText, options = {}) {
        const startTime = Date.now();
        try {
            // Generate query embedding
            const queryEmbedding = await this.embeddingService.embedText({
                text: queryText,
                type: 'query'
            });
            // Get user's index
            const index = this.indices.get(userId);
            const userMetadata = this.metadata.get(userId);
            if (!index || !userMetadata || index.getCurrentCount() === 0) {
                return {
                    results: [],
                    totalResults: 0
                };
            }
            // Set search parameters
            const k = options.k || 10;
            const efSearch = options.efSearch || 50;
            index.setEf(efSearch);
            // Search vectors
            const searchResults = index.searchKnn(queryEmbedding.vector, k);
            const results = [];
            for (let i = 0; i < searchResults.neighbors.length; i++) {
                const vectorId = searchResults.neighbors[i];
                const distance = searchResults.distances[i];
                const similarity = 1 - distance; // Convert distance to similarity
                // Apply threshold filter
                if (options.threshold && similarity < options.threshold) {
                    continue;
                }
                const metadata = userMetadata.get(vectorId);
                if (metadata) {
                    const match = {
                        memoryId: `memory_${vectorId}`,
                        vectorId,
                        similarity,
                        distance,
                        metadata: options.includeMetadata ? metadata.metadata : undefined
                    };
                    results.push(match);
                }
            }
            return {
                results,
                totalResults: results.length
            };
        }
        catch (error) {
            throw new Error(`Vector search failed: ${error}`);
        }
    }
    /**
     * Add multiple texts in batch
     */
    async addTextsBatch(userId, texts) {
        const results = [];
        let successCount = 0;
        let failureCount = 0;
        // Generate embeddings in batch
        const textContents = texts.map(t => t.text);
        const batchEmbeddings = await this.embeddingService.embedBatch(textContents);
        // Get or create index
        const index = this.getOrCreateIndex(userId);
        const userMetadata = this.metadata.get(userId);
        // Add to index
        for (let i = 0; i < texts.length; i++) {
            try {
                const text = texts[i];
                const vector = batchEmbeddings.vectors[i];
                const vectorId = this.getNextVectorId(userId);
                // Add to HNSW index
                index.addPoint(vector, vectorId);
                // Store metadata
                userMetadata.set(vectorId, {
                    id: vectorId,
                    text: text.text,
                    metadata: text.metadata,
                    timestamp: Date.now()
                });
                results.push({ success: true, vectorId });
                successCount++;
            }
            catch (error) {
                results.push({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                failureCount++;
            }
        }
        return { results, successCount, failureCount };
    }
    /**
     * Save index to buffer for storage
     */
    saveIndexToBuffer(userId) {
        const index = this.indices.get(userId);
        const userMetadata = this.metadata.get(userId);
        if (!index || !userMetadata) {
            return null;
        }
        try {
            // Create serializable data (HNSW doesn't support direct buffer export)
            const combinedData = {
                metadata: Array.from(userMetadata.entries()),
                config: this.config,
                vectorIdCounter: this.vectorIdCounters.get(userId) || 0,
                vectorCount: index.getCurrentCount(),
                maxElements: index.getMaxElements()
            };
            return Buffer.from(JSON.stringify(combinedData));
        }
        catch (error) {
            console.error('Failed to save index to buffer:', error);
            return null;
        }
    }
    /**
     * Load index from buffer
     */
    loadIndexFromBuffer(userId, buffer) {
        try {
            const combinedData = JSON.parse(buffer.toString());
            // Create new index (HNSW requires rebuilding from vectors)
            const index = new HierarchicalNSW('cosine', this.config.dimensions);
            index.initIndex(combinedData.maxElements || this.config.maxElements, this.config.m, this.config.efConstruction);
            // Restore metadata
            const userMetadata = new Map();
            for (const [key, value] of combinedData.metadata) {
                userMetadata.set(Number(key), value);
            }
            // Store in maps
            this.indices.set(userId, index);
            this.metadata.set(userId, userMetadata);
            this.vectorIdCounters.set(userId, combinedData.vectorIdCounter || 0);
            console.log(`Loaded HNSW index metadata for user: ${userId} (index will be rebuilt on next vector addition)`);
            return true;
        }
        catch (error) {
            console.error('Failed to load index from buffer:', error);
            return false;
        }
    }
    /**
     * Get index statistics
     */
    getIndexStats(userId) {
        const index = this.indices.get(userId);
        const userMetadata = this.metadata.get(userId);
        if (!index || !userMetadata) {
            return {
                vectorCount: 0,
                maxElements: this.config.maxElements,
                dimension: this.config.dimensions
            };
        }
        return {
            vectorCount: index.getCurrentCount(),
            maxElements: index.getMaxElements(),
            dimension: this.config.dimensions,
            metadataCount: userMetadata.size
        };
    }
    /**
     * Clear user data
     */
    clearUserData(userId) {
        this.indices.delete(userId);
        this.metadata.delete(userId);
        this.vectorIdCounters.delete(userId);
    }
    getNextVectorId(userId) {
        const current = this.vectorIdCounters.get(userId) || 0;
        const next = current + 1;
        this.vectorIdCounters.set(userId, next);
        return next;
    }
}
//# sourceMappingURL=VectorManager.js.map