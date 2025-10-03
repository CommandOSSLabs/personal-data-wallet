"use strict";
/**
 * QueryService - Advanced Memory Query Operations
 *
 * High-level query service providing sophisticated memory search capabilities
 * similar to backend's MemoryQueryService. Combines vector search, semantic search,
 * knowledge graph traversal, and complex filtering operations.
 *
 * This service coordinates between MemoryIndexService, GraphService, and other
 * components to provide unified query capabilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryService = void 0;
/**
 * Advanced query service providing unified memory search capabilities
 */
class QueryService {
    constructor(memoryIndexService, embeddingService, storageService, graphService) {
        this.memoryIndexService = memoryIndexService;
        this.embeddingService = embeddingService;
        this.storageService = storageService;
        this.graphService = graphService;
        console.log('✅ QueryService initialized');
        console.log(`   Memory Index: ${!!memoryIndexService ? 'available' : 'not available'}`);
        console.log(`   Embeddings: ${!!embeddingService ? 'available' : 'not available'}`);
        if (embeddingService) {
            const stats = embeddingService.getStats();
            console.log(`     Model: ${stats.model}, Dimensions: ${stats.dimensions}`);
        }
        console.log(`   Storage: ${!!storageService ? 'available' : 'not available'}`);
        console.log(`   Knowledge Graph: ${!!graphService ? 'available' : 'not available'}`);
    }
    /**
     * Get QueryService statistics including EmbeddingService stats
     */
    getStats() {
        return {
            memoryIndexAvailable: !!this.memoryIndexService,
            embeddingServiceAvailable: !!this.embeddingService,
            storageAvailable: !!this.storageService,
            graphServiceAvailable: !!this.graphService,
            embeddingStats: this.embeddingService?.getStats()
        };
    }
    /**
     * Initialize services (can be called after construction)
     */
    initialize(memoryIndexService, embeddingService, storageService, graphService) {
        this.memoryIndexService = memoryIndexService;
        this.embeddingService = embeddingService;
        this.storageService = storageService;
        this.graphService = graphService;
        console.log('✅ QueryService: All services connected');
    }
    /**
     * Execute advanced memory query with multiple search strategies
     */
    async query(query) {
        const startTime = Date.now();
        try {
            console.log(`🔍 Executing ${query.queryType || 'hybrid'} query for user ${query.userAddress}`);
            console.log(`   Query: "${query.query || 'vector/filter search'}"`);
            console.log(`   Limit: ${query.limit || 'unlimited'}`);
            let results = [];
            let totalCount = 0;
            let graphResults = null;
            let analytics = null;
            switch (query.queryType) {
                case 'vector':
                    results = await this.vectorSearch(query);
                    break;
                case 'semantic':
                    results = await this.semanticSearch(query);
                    break;
                case 'keyword':
                    results = await this.keywordSearch(query);
                    break;
                case 'graph':
                    const graphQuery = await this.graphSearch(query);
                    results = graphQuery.memories;
                    graphResults = graphQuery.graphResults;
                    break;
                case 'temporal':
                    results = await this.temporalSearch(query);
                    break;
                case 'analytical':
                    const analyticalResults = await this.analyticalSearch(query);
                    results = analyticalResults.memories;
                    analytics = analyticalResults.analytics;
                    break;
                case 'hybrid':
                default:
                    results = await this.hybridSearch(query);
                    break;
            }
            // Apply post-processing
            results = this.postProcessResults(results, query);
            totalCount = results.length;
            // Apply pagination
            if (query.offset || query.limit) {
                const start = query.offset || 0;
                const end = query.limit ? start + query.limit : undefined;
                results = results.slice(start, end);
            }
            // Generate analytics if requested
            if (query.includeAnalytics && !analytics) {
                analytics = this.generateAnalytics(results);
            }
            const queryTime = Date.now() - startTime;
            console.log(`✅ Query completed in ${queryTime}ms`);
            console.log(`   Found: ${totalCount} total results`);
            console.log(`   Returned: ${results.length} results`);
            return {
                memories: results,
                totalCount,
                queryTime,
                queryType: query.queryType || 'hybrid',
                graphResults,
                analytics
            };
        }
        catch (error) {
            console.error('❌ Query failed:', error);
            throw error;
        }
    }
    /**
     * Pure vector similarity search
     */
    async vectorSearch(query) {
        if (!this.memoryIndexService) {
            throw new Error('MemoryIndexService not available for vector search');
        }
        const searchQuery = {
            query: query.query,
            vector: query.vector,
            userAddress: query.userAddress,
            k: query.k || 20,
            threshold: query.threshold || 0.5,
            categories: query.categories,
            dateRange: query.dateRange,
            importanceRange: query.importanceRange,
            tags: query.tags,
            includeContent: query.includeContent
        };
        return await this.memoryIndexService.searchMemories(searchQuery);
    }
    /**
     * Semantic search with query expansion and context understanding
     */
    async semanticSearch(query, options = {}) {
        if (!this.embeddingService || !this.memoryIndexService) {
            throw new Error('EmbeddingService and MemoryIndexService required for semantic search');
        }
        console.log('🧠 Performing semantic search with AI understanding');
        let searchTerms = [query.query || ''];
        let queryEmbedding;
        // Generate query embedding for semantic analysis
        if (query.query) {
            try {
                const embeddingResult = await this.embeddingService.embedText({
                    text: query.query,
                    type: 'query',
                    taskType: 'RETRIEVAL_QUERY'
                });
                queryEmbedding = embeddingResult.vector;
                console.log(`   Generated query embedding: ${embeddingResult.dimension}D in ${embeddingResult.processingTime}ms`);
            }
            catch (error) {
                console.warn('   Failed to generate query embedding:', error);
            }
        }
        // Query expansion using embeddings (enhanced semantic understanding)
        if (options.expandQuery && query.query && queryEmbedding) {
            console.log('   Query expansion: Using semantic similarity for expanded search');
            // Note: Query expansion via similar terms would require a term database
            // For now, we use the embedding directly for semantic matching
        }
        // Execute multiple searches and combine results
        const allResults = [];
        for (const term of searchTerms) {
            if (term.trim()) {
                const results = await this.vectorSearch({
                    ...query,
                    query: term,
                    vector: queryEmbedding, // Use pre-computed embedding for efficiency
                    k: (query.k || 10) * 2 // Get more results for merging
                });
                allResults.push(...results);
            }
        }
        // Deduplicate and re-rank results
        const uniqueResults = this.deduplicateResults(allResults);
        return this.rerankSemanticResults(uniqueResults, query);
    }
    /**
     * Keyword-based search in metadata and content
     */
    async keywordSearch(query) {
        if (!this.memoryIndexService) {
            throw new Error('MemoryIndexService not available for keyword search');
        }
        console.log('🔤 Performing keyword search in metadata');
        // Get all memories for the user
        const allMemories = await this.memoryIndexService.getUserMemories(query.userAddress, {
            categories: query.categories,
            dateRange: query.dateRange,
            importanceRange: query.importanceRange
        });
        // Filter by keywords
        const keywords = query.query?.toLowerCase().split(/\s+/) || [];
        const results = [];
        for (const memory of allMemories) {
            let relevanceScore = 0;
            const searchableText = [
                memory.metadata.category,
                memory.metadata.topic,
                JSON.stringify(memory.metadata.customMetadata || {})
            ].join(' ').toLowerCase();
            // Score based on keyword matches
            for (const keyword of keywords) {
                const matches = (searchableText.match(new RegExp(keyword, 'g')) || []).length;
                relevanceScore += matches * 0.2;
            }
            if (relevanceScore > 0) {
                results.push({
                    ...memory,
                    similarity: Math.min(1.0, relevanceScore),
                    relevanceScore: Math.min(1.0, relevanceScore)
                });
            }
        }
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    /**
     * Knowledge graph-based search
     */
    async graphSearch(query) {
        if (!this.storageService || !query.graphQuery) {
            throw new Error('StorageService and graphQuery required for graph search');
        }
        console.log('🕸️ Performing knowledge graph search');
        // Execute graph query
        const graphResults = await this.storageService.searchKnowledgeGraph(query.userAddress, {
            entityTypes: query.graphQuery.entityTypes,
            relationshipTypes: query.graphQuery.relationshipTypes,
            searchText: query.query,
            maxHops: query.graphQuery.maxHops,
            limit: query.limit
        });
        // Convert graph results to memory results
        // This would need to map entities/relationships back to source memories
        const memories = [];
        // TODO: Implement graph result to memory mapping
        console.log(`   Found ${graphResults.entities.length} entities, ${graphResults.relationships.length} relationships`);
        return {
            memories,
            graphResults
        };
    }
    /**
     * Time-based search with temporal patterns
     */
    async temporalSearch(query) {
        if (!this.memoryIndexService) {
            throw new Error('MemoryIndexService not available for temporal search');
        }
        console.log('⏰ Performing temporal search');
        return await this.memoryIndexService.getUserMemories(query.userAddress, {
            categories: query.categories,
            dateRange: query.dateRange,
            importanceRange: query.importanceRange,
            limit: query.limit
        });
    }
    /**
     * Analytical search for insights and patterns
     */
    async analyticalSearch(query) {
        if (!this.memoryIndexService) {
            throw new Error('MemoryIndexService not available for analytical search');
        }
        console.log('📊 Performing analytical search');
        const memories = await this.memoryIndexService.getUserMemories(query.userAddress);
        const analytics = this.generateAnalytics(memories);
        // Filter memories based on analytical criteria
        let filteredMemories = memories;
        if (query.importanceRange) {
            filteredMemories = filteredMemories.filter(m => {
                const importance = m.metadata.importance || 5;
                return (!query.importanceRange.min || importance >= query.importanceRange.min) &&
                    (!query.importanceRange.max || importance <= query.importanceRange.max);
            });
        }
        return {
            memories: filteredMemories,
            analytics
        };
    }
    /**
     * Hybrid search combining multiple strategies
     */
    async hybridSearch(query) {
        console.log('🔄 Performing hybrid search (vector + semantic + keyword)');
        const results = [];
        // Vector search (if we have embeddings)
        if (query.query && this.embeddingService && this.memoryIndexService) {
            try {
                const vectorResults = await this.vectorSearch({
                    ...query,
                    k: (query.k || 10) * 2
                });
                results.push(...vectorResults.map(r => ({ ...r, source: 'vector' })));
            }
            catch (error) {
                console.warn('Vector search failed in hybrid mode:', error);
            }
        }
        // Keyword search
        if (query.query && this.memoryIndexService) {
            try {
                const keywordResults = await this.keywordSearch({
                    ...query,
                    k: (query.k || 10) * 2
                });
                results.push(...keywordResults.map(r => ({ ...r, source: 'keyword' })));
            }
            catch (error) {
                console.warn('Keyword search failed in hybrid mode:', error);
            }
        }
        // Deduplicate and merge results
        const uniqueResults = this.deduplicateResults(results);
        // Re-rank with hybrid scoring
        return this.rerankHybridResults(uniqueResults, query);
    }
    /**
     * Execute analytical queries for insights
     */
    async analyzeMemories(query) {
        if (!this.memoryIndexService) {
            throw new Error('MemoryIndexService not available for analysis');
        }
        console.log(`📈 Analyzing memories: ${query.analysis} for user ${query.userAddress}`);
        const stats = this.memoryIndexService.getIndexStats(query.userAddress);
        switch (query.analysis) {
            case 'trends':
                return this.analyzeTrends(query, stats);
            case 'categories':
                return this.analyzeCategories(query, stats);
            case 'importance':
                return this.analyzeImportance(query, stats);
            case 'temporal':
                return this.analyzeTemporal(query, stats);
            case 'relationships':
                return this.analyzeRelationships(query);
            case 'insights':
                return this.generateInsights(query, stats);
            default:
                throw new Error(`Unknown analysis type: ${query.analysis}`);
        }
    }
    // ==================== PRIVATE HELPER METHODS ====================
    /**
     * Calculate similarity between two vectors using EmbeddingService
     */
    calculateSimilarity(vectorA, vectorB, metric = 'cosine') {
        if (!this.embeddingService) {
            throw new Error('EmbeddingService required for similarity calculation');
        }
        if (metric === 'cosine') {
            return this.embeddingService.calculateCosineSimilarity(vectorA, vectorB);
        }
        else {
            const distance = this.embeddingService.calculateEuclideanDistance(vectorA, vectorB);
            // Convert distance to similarity (0-1 range)
            return 1 / (1 + distance);
        }
    }
    /**
     * Find most similar memories to a query using EmbeddingService
     */
    async findSimilarMemories(queryVector, candidateMemories, k = 10) {
        if (!this.embeddingService) {
            throw new Error('EmbeddingService required for similarity search');
        }
        // Filter memories that have embeddings
        const memoriesWithEmbeddings = candidateMemories.filter(m => m.embedding && m.embedding.length > 0);
        if (memoriesWithEmbeddings.length === 0) {
            console.warn('No memories with embeddings found for similarity comparison');
            return [];
        }
        // Extract vectors from memories
        const vectors = memoriesWithEmbeddings.map(m => m.embedding);
        // Use EmbeddingService to find most similar
        const similarities = this.embeddingService.findMostSimilar(queryVector, vectors, k);
        // Map back to memory results with updated scores
        return similarities.map(sim => {
            const memory = memoriesWithEmbeddings[sim.index];
            return {
                ...memory,
                similarity: sim.similarity,
                relevanceScore: sim.similarity
            };
        });
    }
    /**
     * Batch generate embeddings for multiple texts using EmbeddingService
     */
    async batchEmbedTexts(texts, options = {}) {
        if (!this.embeddingService) {
            throw new Error('EmbeddingService required for batch embedding');
        }
        try {
            const result = await this.embeddingService.embedBatch(texts, options);
            console.log(`   Batch embedded ${texts.length} texts in ${result.totalProcessingTime}ms (${result.successCount} successful)`);
            return result.vectors;
        }
        catch (error) {
            console.error('   Batch embedding failed:', error);
            throw error;
        }
    }
    postProcessResults(results, query) {
        let processed = [...results];
        // Apply minimum relevance threshold
        if (query.minRelevanceScore) {
            processed = processed.filter(r => r.relevanceScore >= query.minRelevanceScore);
        }
        // Boost recent results if requested
        if (query.boostRecent) {
            processed = this.boostRecentResults(processed);
        }
        // Boost important results if requested
        if (query.boostImportant) {
            processed = this.boostImportantResults(processed);
        }
        // Diversify results if requested
        if (query.diversifyResults) {
            processed = this.diversifyResults(processed);
        }
        return processed;
    }
    deduplicateResults(results) {
        const seen = new Set();
        const unique = [];
        for (const result of results) {
            if (!seen.has(result.memoryId)) {
                seen.add(result.memoryId);
                unique.push(result);
            }
        }
        return unique;
    }
    rerankSemanticResults(results, query) {
        // Enhanced semantic ranking considering context and relationships
        return results.sort((a, b) => {
            let scoreA = a.similarity * 0.4 + a.relevanceScore * 0.6;
            let scoreB = b.similarity * 0.4 + b.relevanceScore * 0.6;
            // Boost exact topic matches
            if (query.query && query.topics) {
                const queryLower = query.query.toLowerCase();
                if (a.metadata.topic?.toLowerCase().includes(queryLower))
                    scoreA += 0.2;
                if (b.metadata.topic?.toLowerCase().includes(queryLower))
                    scoreB += 0.2;
            }
            return scoreB - scoreA;
        });
    }
    rerankHybridResults(results, query) {
        // Hybrid ranking combining multiple signals
        return results.sort((a, b) => {
            let scoreA = a.relevanceScore;
            let scoreB = b.relevanceScore;
            // Boost by importance
            scoreA += (a.metadata.importance || 5) * 0.05;
            scoreB += (b.metadata.importance || 5) * 0.05;
            // Boost recent content
            const ageA = (Date.now() - (a.metadata.createdTimestamp || 0)) / (1000 * 60 * 60 * 24);
            const ageB = (Date.now() - (b.metadata.createdTimestamp || 0)) / (1000 * 60 * 60 * 24);
            scoreA += Math.max(0, (30 - ageA) / 30) * 0.1;
            scoreB += Math.max(0, (30 - ageB) / 30) * 0.1;
            return scoreB - scoreA;
        });
    }
    boostRecentResults(results) {
        const now = Date.now();
        return results.map(result => {
            const age = (now - (result.metadata.createdTimestamp || 0)) / (1000 * 60 * 60 * 24);
            const recencyBoost = Math.max(0, (7 - age) / 7) * 0.3; // Boost content from last 7 days
            return {
                ...result,
                relevanceScore: Math.min(1.0, result.relevanceScore + recencyBoost)
            };
        });
    }
    boostImportantResults(results) {
        return results.map(result => {
            const importance = result.metadata.importance || 5;
            const importanceBoost = (importance - 5) * 0.05; // Boost high importance, penalize low
            return {
                ...result,
                relevanceScore: Math.max(0, Math.min(1.0, result.relevanceScore + importanceBoost))
            };
        });
    }
    diversifyResults(results) {
        // Simple diversification by category
        const diversified = [];
        const categoryCounts = {};
        const maxPerCategory = Math.max(2, Math.floor(results.length / 5));
        for (const result of results) {
            const category = result.metadata.category;
            if ((categoryCounts[category] || 0) < maxPerCategory) {
                diversified.push(result);
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
        }
        // Add remaining results if we haven't reached the limit
        const remaining = results.filter(r => !diversified.includes(r));
        diversified.push(...remaining.slice(0, results.length - diversified.length));
        return diversified;
    }
    generateAnalytics(results) {
        const categoryDist = {};
        const importanceDist = {};
        const temporalDist = {};
        let totalRelevance = 0;
        for (const result of results) {
            // Categories
            categoryDist[result.metadata.category] = (categoryDist[result.metadata.category] || 0) + 1;
            // Importance
            const importance = result.metadata.importance || 5;
            importanceDist[importance] = (importanceDist[importance] || 0) + 1;
            // Temporal (by month)
            const date = new Date(result.metadata.createdTimestamp || 0);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            temporalDist[monthKey] = (temporalDist[monthKey] || 0) + 1;
            totalRelevance += result.relevanceScore;
        }
        return {
            categoryDistribution: categoryDist,
            importanceDistribution: importanceDist,
            temporalDistribution: temporalDist,
            averageRelevance: results.length > 0 ? totalRelevance / results.length : 0
        };
    }
    analyzeTrends(query, stats) {
        // Analyze trends over time
        return {
            type: 'trends',
            totalMemories: stats.totalMemories,
            timeRange: {
                start: stats.oldestMemory,
                end: stats.newestMemory
            },
            // TODO: Implement detailed trend analysis
            trends: []
        };
    }
    analyzeCategories(query, stats) {
        return {
            type: 'categories',
            distribution: stats.categoryCounts,
            topCategories: Object.entries(stats.categoryCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
        };
    }
    analyzeImportance(query, stats) {
        return {
            type: 'importance',
            distribution: stats.importanceDistribution,
            average: stats.averageImportance,
            recommendations: this.generateImportanceRecommendations(stats)
        };
    }
    analyzeTemporal(query, stats) {
        return {
            type: 'temporal',
            timeRange: {
                oldest: stats.oldestMemory,
                newest: stats.newestMemory
            },
            // TODO: Implement temporal pattern analysis
            patterns: []
        };
    }
    analyzeRelationships(query) {
        // This would use GraphService if available
        return {
            type: 'relationships',
            // TODO: Implement relationship analysis
            connections: []
        };
    }
    generateInsights(query, stats) {
        const insights = [];
        // Category insights
        const topCategory = Object.entries(stats.categoryCounts)
            .sort(([, a], [, b]) => b - a)[0];
        if (topCategory) {
            insights.push(`Your most common memory category is "${topCategory[0]}" with ${topCategory[1]} memories`);
        }
        // Importance insights
        if (stats.averageImportance < 5) {
            insights.push("Consider marking more important memories with higher importance ratings");
        }
        // Temporal insights
        if (stats.newestMemory && stats.oldestMemory) {
            const daysDiff = (new Date(stats.newestMemory).getTime() - new Date(stats.oldestMemory).getTime()) / (1000 * 60 * 60 * 24);
            insights.push(`Your memories span ${Math.round(daysDiff)} days`);
        }
        return {
            type: 'insights',
            insights,
            stats
        };
    }
    generateImportanceRecommendations(stats) {
        const recommendations = [];
        const lowImportanceCount = (stats.importanceDistribution[1] || 0) + (stats.importanceDistribution[2] || 0);
        const highImportanceCount = (stats.importanceDistribution[8] || 0) + (stats.importanceDistribution[9] || 0) + (stats.importanceDistribution[10] || 0);
        if (lowImportanceCount > highImportanceCount * 2) {
            recommendations.push("Consider reviewing low-importance memories and increasing ratings for valuable content");
        }
        if (stats.averageImportance > 8) {
            recommendations.push("Your memories have high average importance - consider using the full 1-10 scale for better prioritization");
        }
        return recommendations;
    }
}
exports.QueryService = QueryService;
//# sourceMappingURL=QueryService.js.map