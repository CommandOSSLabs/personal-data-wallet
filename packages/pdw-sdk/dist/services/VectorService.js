/**
 * VectorService - Unified Vector Operations
 *
 * Consolidated service combining embedding generation and HNSW indexing
 * with smart caching and Walrus persistence.
 *
 * Replaces: HnswIndexService + VectorManager
 */
// Using hnswlib-wasm for browser compatibility
import { loadHnswlib } from 'hnswlib-wasm';
import { EmbeddingService } from './EmbeddingService';
import { StorageService } from './StorageService';
// Local VectorError class implementation
class VectorErrorImpl extends Error {
    constructor(message) {
        super(message);
        this.name = 'VectorError';
    }
}
/**
 * VectorService provides unified vector operations including:
 * - Embedding generation via EmbeddingService
 * - HNSW vector indexing and search
 * - Intelligent batching and caching
 * - Persistence via Walrus storage
 */
export class VectorService {
    constructor(config, embeddingService, storageService) {
        this.config = config;
        this.indexCache = new Map();
        this.hnswlibModule = null;
        this.embeddingService = embeddingService || new EmbeddingService(config.embedding);
        this.storageService = storageService || new StorageService({ packageId: '' }); // Will be properly configured
    }
    /**
     * Initialize the WASM module (must be called before using any index operations)
     */
    async initialize() {
        if (!this.hnswlibModule) {
            this.hnswlibModule = await loadHnswlib('IDBFS');
        }
    }
    /**
     * Generate embeddings for text content
     */
    async generateEmbedding(text) {
        const result = await this.embeddingService.embedText({ text });
        return {
            vector: result.vector,
            dimension: result.dimension,
            model: result.model
        };
    }
    /**
     * Create or get HNSW index for a specific space
     */
    async createIndex(spaceId, dimension, config) {
        await this.initialize();
        if (!this.hnswlibModule) {
            throw new VectorErrorImpl('WASM module not initialized');
        }
        const finalConfig = { ...this.config.index, ...config };
        const index = new this.hnswlibModule.HierarchicalNSW('cosine', dimension, '');
        index.initIndex(finalConfig?.maxElements || 10000, finalConfig?.m || 16, finalConfig?.efConstruction || 200, 100 // randomSeed
        );
        this.indexCache.set(spaceId, {
            index,
            lastModified: new Date(),
            pendingVectors: new Map(),
            isDirty: false,
            version: 1,
            metadata: new Map()
        });
    }
    /**
     * Add vector to index
     */
    async addVector(spaceId, vectorId, vector, metadata) {
        const entry = this.indexCache.get(spaceId);
        if (!entry) {
            throw new VectorErrorImpl(`Index ${spaceId} not found`);
        }
        entry.index.addPoint(vector, vectorId, false);
        if (metadata) {
            entry.metadata.set(vectorId, metadata);
        }
        entry.isDirty = true;
        entry.lastModified = new Date();
    }
    /**
     * Search vectors in index
     */
    async searchVectors(spaceId, queryVector, options) {
        const entry = this.indexCache.get(spaceId);
        if (!entry) {
            throw new VectorErrorImpl(`Index ${spaceId} not found`);
        }
        const k = options?.k || 10;
        const result = entry.index.searchKnn(queryVector, k, undefined);
        return {
            results: result.neighbors.map((neighborId, i) => ({
                memoryId: neighborId.toString(),
                vectorId: neighborId,
                similarity: 1 - result.distances[i], // Convert distance to similarity
                distance: result.distances[i],
                metadata: entry.metadata.get(neighborId)
            })),
            searchStats: {
                searchTime: 0, // TODO: Add timing
                nodesVisited: result.neighbors.length,
                exactMatches: result.neighbors.length,
                approximateMatches: 0,
                cacheHits: 0,
                indexSize: entry.index.getCurrentCount()
            }
        };
    }
    /**
     * Save index to Walrus storage
     */
    async saveIndex(spaceId) {
        const entry = this.indexCache.get(spaceId);
        if (!entry) {
            throw new VectorErrorImpl(`Index ${spaceId} not found`);
        }
        // Serialize index data
        const indexData = {
            spaceId,
            version: entry.version,
            metadata: Array.from(entry.metadata.entries()),
            // Note: Actual index serialization would need hnswlib serialization
            lastModified: entry.lastModified.toISOString()
        };
        // Store in Walrus
        const serializedData = JSON.stringify(indexData);
        const metadata = {
            contentType: 'application/json',
            contentSize: serializedData.length,
            contentHash: '', // TODO: Calculate hash
            category: 'vector-index',
            topic: spaceId,
            importance: 8, // High importance for index
            embeddingDimension: 384, // TODO: Get from index or store in IndexCacheEntry
            createdTimestamp: Date.now(),
            customMetadata: {
                type: 'hnsw-index',
                spaceId,
                version: entry.version.toString()
            }
        };
        const result = await this.storageService.upload(serializedData, metadata);
        entry.isDirty = false;
        return result.blobId;
    }
    /**
     * Load index from Walrus storage
     */
    async loadIndex(spaceId, blobId) {
        const result = await this.storageService.retrieve(blobId);
        const indexData = JSON.parse(new TextDecoder().decode(result.content));
        // Reconstruct index
        // Note: This would need proper hnswlib deserialization
        // For now, create a new index and mark as loaded
        await this.createIndex(spaceId, 1536); // Default dimension
        const entry = this.indexCache.get(spaceId);
        entry.version = indexData.version;
        entry.metadata = new Map(indexData.metadata);
        entry.lastModified = new Date(indexData.lastModified);
    }
    /**
     * Process text to vector pipeline
     */
    async processText(spaceId, text, vectorId, metadata) {
        // Generate embedding
        const embedding = await this.generateEmbedding(text);
        // Add to index
        await this.addVector(spaceId, vectorId, embedding.vector, metadata);
        return embedding;
    }
    /**
     * Search by text query
     */
    async searchByText(spaceId, query, options) {
        // Generate query embedding
        const queryEmbedding = await this.generateEmbedding(query);
        // Search vectors
        return await this.searchVectors(spaceId, queryEmbedding.vector, options);
    }
    /**
     * Get index statistics
     */
    getIndexStats(spaceId) {
        const entry = this.indexCache.get(spaceId);
        if (!entry) {
            return null;
        }
        return {
            spaceId,
            version: entry.version,
            currentElements: entry.index.getCurrentCount(),
            maxElements: entry.index.getMaxElements(),
            isDirty: entry.isDirty,
            lastModified: entry.lastModified,
            metadataCount: entry.metadata.size
        };
    }
    /**
     * Clean up resources
     */
    async cleanup() {
        // Save all dirty indices
        for (const [spaceId, entry] of this.indexCache.entries()) {
            if (entry.isDirty) {
                await this.saveIndex(spaceId);
            }
        }
        this.indexCache.clear();
    }
}
//# sourceMappingURL=VectorService.js.map