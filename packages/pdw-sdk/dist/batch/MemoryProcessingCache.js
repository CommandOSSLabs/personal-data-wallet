"use strict";
/**
 * MemoryProcessingCache - Specialized caching for memory processing
 *
 * Optimized caching service for memory data with intelligent eviction,
 * embedding similarity, and memory-specific optimization patterns.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryProcessingCache = void 0;
const BatchingService_1 = require("./BatchingService");
/**
 * Specialized caching service for memory processing operations
 */
class MemoryProcessingCache {
    constructor(config = {}) {
        this.memoryCache = new Map();
        this.embeddingCache = new Map();
        this.metadataCache = new Map();
        this.similarityIndex = new Map(); // Content hash -> similar memory IDs
        this.metrics = {
            memoryHits: 0,
            memoryMisses: 0,
            embeddingHits: 0,
            embeddingMisses: 0,
            totalQueries: 0,
            averageRetrievalTime: 0
        };
        this.config = {
            maxSize: config.maxSize || 5000,
            ttlMs: config.ttlMs || 60 * 60 * 1000, // 1 hour
            cleanupIntervalMs: config.cleanupIntervalMs || 10 * 60 * 1000, // 10 minutes
            enableMetrics: config.enableMetrics !== false,
            embeddingCacheSize: config.embeddingCacheSize || 1000,
            memoryCacheSize: config.memoryCacheSize || 3000,
            metadataCacheSize: config.metadataCacheSize || 1000,
            similarityThreshold: config.similarityThreshold || 0.85,
            enableSimilarityIndex: config.enableSimilarityIndex !== false
        };
        this.batchingService = new BatchingService_1.BatchingService({
            maxBatchSize: 50,
            batchDelayMs: 3000,
            maxCacheSize: this.config.maxSize
        }, {
            maxSize: this.config.maxSize,
            ttlMs: this.config.ttlMs,
            enableMetrics: true
        });
    }
    // ==================== MEMORY CACHING ====================
    /**
     * Cache processed memory
     */
    cacheMemory(memory, processed) {
        const cachedMemory = {
            ...memory,
            ...processed,
            cachedAt: new Date(),
            accessCount: 0,
            lastAccessed: new Date(),
            processingState: processed?.embedding ? 'completed' : 'pending'
        };
        // Check memory cache size
        if (this.memoryCache.size >= this.config.memoryCacheSize) {
            this.evictLeastAccessedMemories(Math.floor(this.config.memoryCacheSize * 0.1));
        }
        this.memoryCache.set(memory.id, cachedMemory);
        // Update similarity index if enabled and embedding available
        if (this.config.enableSimilarityIndex && processed?.embedding) {
            this.updateSimilarityIndex(memory.id, memory.content, processed.embedding);
        }
    }
    /**
     * Get cached memory
     */
    getCachedMemory(memoryId) {
        const memory = this.memoryCache.get(memoryId);
        if (memory) {
            memory.lastAccessed = new Date();
            memory.accessCount++;
            this.metrics.memoryHits++;
            return memory;
        }
        this.metrics.memoryMisses++;
        return undefined;
    }
    /**
     * Update memory processing state
     */
    updateMemoryState(memoryId, state, error) {
        const memory = this.memoryCache.get(memoryId);
        if (memory) {
            memory.processingState = state;
            memory.lastAccessed = new Date();
            if (error) {
                memory.errorInfo = {
                    lastError: error,
                    errorCount: (memory.errorInfo?.errorCount || 0) + 1,
                    lastErrorAt: new Date()
                };
            }
        }
    }
    /**
     * Get memories by processing state
     */
    getMemoriesByState(state) {
        return Array.from(this.memoryCache.values())
            .filter(memory => memory.processingState === state);
    }
    // ==================== EMBEDDING CACHING ====================
    /**
     * Cache embedding result
     */
    cacheEmbedding(content, embedding, model) {
        const contentHash = this.hashContent(content);
        const cachedEmbedding = {
            content,
            embedding,
            model,
            createdAt: new Date(),
            accessCount: 1,
            contentHash
        };
        // Check embedding cache size
        if (this.embeddingCache.size >= this.config.embeddingCacheSize) {
            this.evictLeastUsedEmbeddings(Math.floor(this.config.embeddingCacheSize * 0.1));
        }
        this.embeddingCache.set(contentHash, cachedEmbedding);
        return contentHash;
    }
    /**
     * Get cached embedding
     */
    getCachedEmbedding(content) {
        const contentHash = this.hashContent(content);
        const cached = this.embeddingCache.get(contentHash);
        if (cached) {
            cached.accessCount++;
            this.metrics.embeddingHits++;
            return cached;
        }
        this.metrics.embeddingMisses++;
        return undefined;
    }
    /**
     * Find similar content by embedding
     */
    findSimilarContent(content, threshold) {
        const similarityThreshold = threshold || this.config.similarityThreshold;
        const results = [];
        const targetEmbedding = this.getCachedEmbedding(content);
        if (!targetEmbedding)
            return results;
        for (const cached of this.embeddingCache.values()) {
            if (cached.contentHash === targetEmbedding.contentHash)
                continue;
            const similarity = this.calculateCosineSimilarity(targetEmbedding.embedding, cached.embedding);
            if (similarity >= similarityThreshold) {
                results.push({
                    content: cached.content,
                    similarity,
                    embedding: cached.embedding
                });
            }
        }
        return results.sort((a, b) => b.similarity - a.similarity);
    }
    // ==================== METADATA CACHING ====================
    /**
     * Cache memory metadata
     */
    cacheMetadata(memoryId, metadata) {
        // Check metadata cache size
        if (this.metadataCache.size >= this.config.metadataCacheSize) {
            this.evictRandomMetadata(Math.floor(this.config.metadataCacheSize * 0.1));
        }
        this.metadataCache.set(memoryId, metadata);
    }
    /**
     * Get cached metadata
     */
    getCachedMetadata(memoryId) {
        return this.metadataCache.get(memoryId);
    }
    // ==================== BATCH PROCESSING ====================
    /**
     * Add memory to processing batch
     */
    addToProcessingBatch(memory, priority = 'normal') {
        const priorityMap = { low: 0, normal: 1, high: 2 };
        this.batchingService.addToBatch('memory-processing', {
            id: memory.id,
            data: memory,
            timestamp: new Date(),
            priority: priorityMap[priority],
            metadata: { type: 'memory', priority }
        });
        // Cache as pending
        this.cacheMemory(memory);
        this.updateMemoryState(memory.id, 'pending');
    }
    /**
     * Process memory batch
     */
    async processMemoryBatch() {
        await this.batchingService.processAllBatches();
    }
    // ==================== SIMILARITY INDEX ====================
    /**
     * Find similar memories by content
     */
    findSimilarMemories(memoryId, limit = 10) {
        if (!this.config.enableSimilarityIndex)
            return [];
        const memory = this.getCachedMemory(memoryId);
        if (!memory?.embedding)
            return [];
        const results = [];
        for (const [id, cachedMemory] of this.memoryCache.entries()) {
            if (id === memoryId || !cachedMemory.embedding)
                continue;
            const similarity = this.calculateCosineSimilarity(memory.embedding, cachedMemory.embedding);
            if (similarity >= this.config.similarityThreshold) {
                results.push({ memoryId: id, similarity, memory: cachedMemory });
            }
        }
        return results
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }
    // ==================== STATISTICS & MONITORING ====================
    /**
     * Get comprehensive cache statistics
     */
    getStats() {
        const memories = Array.from(this.memoryCache.values());
        const embeddings = Array.from(this.embeddingCache.values());
        // Group memories by state
        const stateGroups = memories.reduce((groups, memory) => {
            const state = memory.processingState || 'unknown';
            groups[state] = (groups[state] || 0) + 1;
            return groups;
        }, {});
        return {
            memories: {
                total: memories.length,
                byState: stateGroups,
                averageAccessCount: memories.length > 0
                    ? memories.reduce((sum, m) => sum + m.accessCount, 0) / memories.length
                    : 0
            },
            embeddings: {
                total: embeddings.length,
                uniqueContent: new Set(embeddings.map(e => e.contentHash)).size,
                averageReuseCount: embeddings.length > 0
                    ? embeddings.reduce((sum, e) => sum + e.accessCount, 0) / embeddings.length
                    : 0
            },
            performance: {
                hitRateMemories: this.getHitRate(this.metrics.memoryHits, this.metrics.memoryMisses),
                hitRateEmbeddings: this.getHitRate(this.metrics.embeddingHits, this.metrics.embeddingMisses),
                averageRetrievalTime: this.metrics.averageRetrievalTime
            },
            similarity: {
                indexSize: this.similarityIndex.size,
                averageSimilarityScore: 0, // TODO: Calculate from recent queries
                queryCount: this.metrics.totalQueries
            }
        };
    }
    /**
     * Clear all caches
     */
    clearAll() {
        this.memoryCache.clear();
        this.embeddingCache.clear();
        this.metadataCache.clear();
        this.similarityIndex.clear();
        // Reset metrics
        Object.keys(this.metrics).forEach(key => {
            this.metrics[key] = 0;
        });
    }
    /**
     * Cleanup and destroy cache
     */
    destroy() {
        this.clearAll();
        this.batchingService.destroy();
    }
    // ==================== PRIVATE METHODS ====================
    updateSimilarityIndex(memoryId, content, embedding) {
        const contentHash = this.hashContent(content);
        if (!this.similarityIndex.has(contentHash)) {
            this.similarityIndex.set(contentHash, new Set());
        }
        this.similarityIndex.get(contentHash).add(memoryId);
    }
    evictLeastAccessedMemories(count) {
        const memories = Array.from(this.memoryCache.entries())
            .sort(([, a], [, b]) => a.accessCount - b.accessCount)
            .slice(0, count);
        for (const [id] of memories) {
            this.memoryCache.delete(id);
        }
    }
    evictLeastUsedEmbeddings(count) {
        const embeddings = Array.from(this.embeddingCache.entries())
            .sort(([, a], [, b]) => a.accessCount - b.accessCount)
            .slice(0, count);
        for (const [hash] of embeddings) {
            this.embeddingCache.delete(hash);
        }
    }
    evictRandomMetadata(count) {
        const keys = Array.from(this.metadataCache.keys()).slice(0, count);
        for (const key of keys) {
            this.metadataCache.delete(key);
        }
    }
    hashContent(content) {
        // Simple hash function - replace with crypto hash if needed
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }
    calculateCosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length)
            return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0)
            return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    getHitRate(hits, misses) {
        const total = hits + misses;
        return total > 0 ? hits / total : 0;
    }
}
exports.MemoryProcessingCache = MemoryProcessingCache;
exports.default = MemoryProcessingCache;
//# sourceMappingURL=MemoryProcessingCache.js.map