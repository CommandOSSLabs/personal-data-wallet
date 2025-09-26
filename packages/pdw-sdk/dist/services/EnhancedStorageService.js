"use strict";
/**
 * Enhanced StorageService with HNSW-Based Metadata Retrieval
 *
 * This service integrates your existing StorageService with HNSW indexing
 * for sophisticated metadata-based search and retrieval capabilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedStorageService = void 0;
const StorageService_1 = require("./StorageService");
const HnswIndexService_1 = require("../vector/HnswIndexService");
/**
 * Enhanced Storage Service with HNSW-based metadata search
 */
class EnhancedStorageService extends StorageService_1.StorageService {
    constructor(storageService, embeddingService, hnswService) {
        // Inherit from base StorageService
        super(storageService['client'], storageService['config']);
        this.memoryIndex = new Map(); // userAddress -> entries
        this.nextVectorId = 1;
        this.embeddingService = embeddingService;
        this.hnswService = hnswService || new HnswIndexService_1.HnswIndexService(this);
    }
    /**
     * Enhanced upload with automatic HNSW indexing
     */
    async uploadWithIndexing(content, metadata, userAddress) {
        // 1. Upload to Walrus via parent StorageService
        const uploadResult = await this.upload(content, metadata);
        // 2. Generate embeddings for the content
        let textContent;
        if (content instanceof Uint8Array) {
            // For binary content, use metadata for embeddings
            textContent = `${metadata.category} ${metadata.topic || ''} ${metadata.customMetadata ? Object.values(metadata.customMetadata).join(' ') : ''}`.trim();
        }
        else {
            textContent = content;
        }
        const embeddings = await this.embeddingService.generateEmbedding(textContent);
        // 3. Add to HNSW index
        const vectorId = this.nextVectorId++;
        this.hnswService.addVectorToIndexBatched(userAddress, vectorId, embeddings, {
            blobId: uploadResult.blobId,
            category: metadata.category,
            topic: metadata.topic,
            importance: metadata.importance,
            contentType: metadata.contentType,
            createdTimestamp: metadata.createdTimestamp,
            customMetadata: metadata.customMetadata
        });
        // 4. Store in local index
        if (!this.memoryIndex.has(userAddress)) {
            this.memoryIndex.set(userAddress, []);
        }
        this.memoryIndex.get(userAddress).push({
            blobId: uploadResult.blobId,
            vectorId,
            metadata,
            vector: embeddings
        });
        console.log(`✅ Uploaded and indexed: ${uploadResult.blobId} (vector ${vectorId}) for user ${userAddress}`);
        return {
            ...uploadResult,
            vectorId
        };
    }
    /**
     * Sophisticated metadata-based search using HNSW
     */
    async searchByMetadata(userAddress, searchQuery) {
        try {
            let queryVector;
            // Generate query vector
            if (searchQuery.vector) {
                queryVector = searchQuery.vector;
            }
            else if (searchQuery.query) {
                queryVector = await this.embeddingService.generateEmbedding(searchQuery.query);
            }
            else {
                throw new Error('Either query text or vector must be provided');
            }
            // Perform HNSW search
            const searchOptions = {
                k: searchQuery.k || 10,
                efSearch: 50,
                filter: searchQuery.filters ? this.createMetadataFilter(searchQuery.filters) : undefined
            };
            const hnswResults = await this.hnswService.searchVectors(userAddress, queryVector, searchOptions);
            // Convert HNSW results to metadata results
            const results = [];
            const userEntries = this.memoryIndex.get(userAddress) || [];
            for (let i = 0; i < hnswResults.ids.length; i++) {
                const vectorId = hnswResults.ids[i];
                const similarity = hnswResults.similarities[i];
                // Skip results below threshold
                if (searchQuery.threshold && similarity < searchQuery.threshold) {
                    continue;
                }
                // Find the indexed entry
                const entry = userEntries.find(e => e.vectorId === vectorId);
                if (!entry)
                    continue;
                // Optionally retrieve content
                let content;
                if (searchQuery.includeContent) {
                    try {
                        const retrieveResult = await this.retrieve(entry.blobId);
                        content = retrieveResult.content;
                    }
                    catch (error) {
                        console.warn(`Failed to retrieve content for ${entry.blobId}:`, error);
                    }
                }
                results.push({
                    blobId: entry.blobId,
                    content,
                    metadata: entry.metadata,
                    similarity,
                    relevanceScore: this.calculateRelevanceScore(similarity, entry.metadata, searchQuery)
                });
            }
            // Sort by relevance score
            results.sort((a, b) => b.relevanceScore - a.relevanceScore);
            console.log(`🔍 Found ${results.length} results for metadata search by ${userAddress}`);
            return results;
        }
        catch (error) {
            console.error('❌ Metadata search failed:', error);
            throw error;
        }
    }
    /**
     * Get all indexed memories for a user with optional filtering
     */
    async getUserMemoriesWithMetadata(userAddress, filters) {
        const userEntries = this.memoryIndex.get(userAddress) || [];
        const results = [];
        for (const entry of userEntries) {
            // Apply filters if provided
            if (filters && !this.matchesFilters(entry.metadata, filters)) {
                continue;
            }
            results.push({
                blobId: entry.blobId,
                metadata: entry.metadata,
                similarity: 1.0, // No similarity for direct listing
                relevanceScore: entry.metadata.importance || 5
            });
        }
        // Sort by importance and creation time
        results.sort((a, b) => {
            const importanceDiff = (b.metadata.importance || 5) - (a.metadata.importance || 5);
            if (importanceDiff !== 0)
                return importanceDiff;
            return (b.metadata.createdTimestamp || 0) - (a.metadata.createdTimestamp || 0);
        });
        return results;
    }
    /**
     * Search by category with advanced filtering
     */
    async searchByCategory(userAddress, category, additionalFilters) {
        return this.searchByMetadata(userAddress, {
            filters: {
                category,
                ...additionalFilters
            },
            k: 50, // Get more results for category searches
            includeContent: false
        });
    }
    /**
     * Temporal search - find memories within time ranges
     */
    async searchByTimeRange(userAddress, startDate, endDate, additionalFilters) {
        return this.searchByMetadata(userAddress, {
            filters: {
                dateRange: { start: startDate, end: endDate },
                ...additionalFilters
            },
            k: 100,
            includeContent: false
        });
    }
    /**
     * Get search statistics and analytics
     */
    getSearchAnalytics(userAddress) {
        const userEntries = this.memoryIndex.get(userAddress) || [];
        if (userEntries.length === 0) {
            return {
                totalMemories: 0,
                categoryCounts: {},
                averageImportance: 0,
                timeRange: null,
                topTags: []
            };
        }
        const categoryCounts = {};
        const tagCounts = {};
        let totalImportance = 0;
        let earliest = new Date();
        let latest = new Date(0);
        for (const entry of userEntries) {
            // Categories
            categoryCounts[entry.metadata.category] = (categoryCounts[entry.metadata.category] || 0) + 1;
            // Importance
            totalImportance += entry.metadata.importance || 5;
            // Time range
            const created = new Date(entry.metadata.createdTimestamp || Date.now());
            if (created < earliest)
                earliest = created;
            if (created > latest)
                latest = created;
            // Tags from custom metadata
            if (entry.metadata.customMetadata) {
                Object.values(entry.metadata.customMetadata).forEach(value => {
                    if (typeof value === 'string' && value.includes('#')) {
                        const tags = value.match(/#\w+/g) || [];
                        tags.forEach(tag => {
                            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                        });
                    }
                });
            }
        }
        const topTags = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
        return {
            totalMemories: userEntries.length,
            categoryCounts,
            averageImportance: totalImportance / userEntries.length,
            timeRange: { earliest, latest },
            topTags
        };
    }
    // ==================== PRIVATE HELPER METHODS ====================
    createMetadataFilter(filters) {
        return (metadata) => {
            // Category filter
            if (filters.category) {
                const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
                if (!categories.includes(metadata.category))
                    return false;
            }
            // Topic filter
            if (filters.topic) {
                const topics = Array.isArray(filters.topic) ? filters.topic : [filters.topic];
                if (!topics.includes(metadata.topic))
                    return false;
            }
            // Importance range
            if (filters.importance) {
                const importance = metadata.importance || 5;
                if (filters.importance.min && importance < filters.importance.min)
                    return false;
                if (filters.importance.max && importance > filters.importance.max)
                    return false;
            }
            // Content type filter
            if (filters.contentType) {
                const contentTypes = Array.isArray(filters.contentType) ? filters.contentType : [filters.contentType];
                if (!contentTypes.includes(metadata.contentType))
                    return false;
            }
            // Content size filter
            if (filters.contentSize) {
                const size = metadata.contentSize || 0;
                if (filters.contentSize.min && size < filters.contentSize.min)
                    return false;
                if (filters.contentSize.max && size > filters.contentSize.max)
                    return false;
            }
            // Custom tag filtering
            if (filters.tags && filters.tags.length > 0) {
                const metadataText = JSON.stringify(metadata).toLowerCase();
                const hasMatchingTag = filters.tags.some(tag => metadataText.includes(tag.toLowerCase()));
                if (!hasMatchingTag)
                    return false;
            }
            return true;
        };
    }
    matchesFilters(metadata, filters) {
        return this.createMetadataFilter(filters)(metadata);
    }
    calculateRelevanceScore(similarity, metadata, query) {
        let score = similarity * 0.6; // Base similarity weight
        // Boost by importance
        score += (metadata.importance || 5) * 0.1;
        // Recent content boost
        const ageInDays = (Date.now() - (metadata.createdTimestamp || 0)) / (1000 * 60 * 60 * 24);
        const recencyBoost = Math.max(0, (30 - ageInDays) / 30) * 0.2;
        score += recencyBoost;
        // Category exact match boost
        if (query.filters?.category && metadata.category === query.filters.category) {
            score += 0.1;
        }
        return Math.min(1.0, score);
    }
}
exports.EnhancedStorageService = EnhancedStorageService;
exports.default = EnhancedStorageService;
//# sourceMappingURL=EnhancedStorageService.js.map