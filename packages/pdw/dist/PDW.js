"use strict";
/**
 * PDW - Personal Data Wallet for Vector Embedding Storage
 *
 * Main class that orchestrates AI embeddings, vector indexing, and Walrus storage
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDW = void 0;
exports.createPDW = createPDW;
const EmbeddingService_1 = require("./services/EmbeddingService");
const VectorService_1 = require("./services/VectorService");
const WalrusService_1 = require("./services/WalrusService");
class PDW {
    constructor(config) {
        this.userIndices = new Map(); // userId -> blobId mapping
        // Initialize services
        this.embeddingService = new EmbeddingService_1.EmbeddingService(config.embedding);
        this.vectorService = new VectorService_1.VectorService(config.vector);
        this.walrusService = new WalrusService_1.WalrusService(config.walrus);
        console.log('✅ PDW initialized successfully');
    }
    /**
     * Store text as vector embedding on Walrus
     */
    async storeText(userId, text, options = {}) {
        try {
            console.log(`📝 Storing text for user: ${userId}`);
            // Generate embedding and add to vector index
            const embeddingResult = await this.embeddingService.embedText(text);
            const vectorId = this.vectorService.addVector(userId, embeddingResult.vector, text, {
                category: options.category || 'general',
                ...options.metadata
            });
            let blobId;
            // Auto-save index to Walrus if enabled (default: true)
            if (options.autoSave !== false) {
                blobId = await this.saveUserIndex(userId);
            }
            console.log(`✅ Text stored with vector ID: ${vectorId}`);
            return {
                vectorId,
                blobId,
                embedding: embeddingResult.vector
            };
        }
        catch (error) {
            console.error('Failed to store text:', error);
            throw error;
        }
    }
    /**
     * Store multiple texts in batch
     */
    async storeTextsBatch(userId, texts, options = {}) {
        try {
            console.log(`📦 Storing ${texts.length} texts in batch for user: ${userId}`);
            // Process texts in batch
            const results = [];
            let successCount = 0;
            let failureCount = 0;
            for (const item of texts) {
                try {
                    const embeddingResult = await this.embeddingService.embedText(item.text);
                    const vectorId = this.vectorService.addVector(userId, embeddingResult.vector, item.text, { category: item.category || 'general', ...item.metadata });
                    results.push({ success: true, vectorId });
                    successCount++;
                }
                catch (error) {
                    results.push({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
                    failureCount++;
                }
            }
            const batchResult = { results, successCount, failureCount };
            let blobId;
            // Auto-save index to Walrus if enabled (default: true)
            if (options.autoSave !== false) {
                blobId = await this.saveUserIndex(userId);
            }
            console.log(`✅ Batch completed: ${batchResult.successCount} success, ${batchResult.failureCount} failed`);
            return {
                ...batchResult,
                blobId
            };
        }
        catch (error) {
            console.error('Failed to store texts batch:', error);
            throw error;
        }
    }
    /**
     * Search similar texts using vector similarity
     */
    async searchSimilar(userId, queryText, options = {}) {
        try {
            console.log(`🔍 Searching similar texts for user: ${userId}`);
            const embeddingResult = await this.embeddingService.embedText(queryText);
            const result = await this.vectorService.searchSimilar(userId, embeddingResult.vector, options);
            console.log(`✅ Found ${result.results.length} similar texts in ${Date.now() - performance.now()}ms`);
            return result;
        }
        catch (error) {
            console.error('Failed to search similar texts:', error);
            throw error;
        }
    }
    /**
     * Save user's vector index to Walrus
     */
    async saveUserIndex(userId) {
        try {
            console.log(`💾 Saving vector index for user: ${userId}`);
            // Get index data from vector service
            const indexData = this.vectorService.saveIndex(userId);
            if (!indexData) {
                throw new Error('No vector index found for user');
            }
            // Upload to Walrus
            const uploadResult = await this.walrusService.storeVectorIndex(userId, indexData);
            // Store mapping
            this.userIndices.set(userId, uploadResult.blobId);
            console.log(`✅ Index saved to Walrus with blob ID: ${uploadResult.blobId}`);
            return uploadResult.blobId;
        }
        catch (error) {
            console.error('Failed to save user index:', error);
            throw error;
        }
    }
    /**
     * Load user's vector index from Walrus
     */
    async loadUserIndex(userId, blobId) {
        try {
            const targetBlobId = blobId || this.userIndices.get(userId);
            if (!targetBlobId) {
                throw new Error('No blob ID provided and no stored mapping found');
            }
            console.log(`📥 Loading vector index for user: ${userId} from blob: ${targetBlobId}`);
            // Retrieve from Walrus
            const indexData = await this.walrusService.retrieveVectorIndex(targetBlobId);
            // Load into vector service
            const success = this.vectorService.loadIndex(userId, indexData);
            if (success) {
                this.userIndices.set(userId, targetBlobId);
                console.log(`✅ Index loaded successfully for user: ${userId}`);
            }
            else {
                throw new Error('Failed to load index from buffer');
            }
            return success;
        }
        catch (error) {
            console.error('Failed to load user index:', error);
            throw error;
        }
    }
    /**
     * Check if vector index exists for user
     */
    async hasUserIndex(userId, blobId) {
        try {
            const targetBlobId = blobId || this.userIndices.get(userId);
            if (!targetBlobId) {
                return false;
            }
            // For now, just check if we have the blob ID
            // In a full implementation, you'd check if the blob exists on Walrus
            return !!targetBlobId;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get user's vector index statistics
     */
    getUserIndexStats(userId) {
        return this.vectorService.getIndexStats(userId);
    }
    /**
     * Get user's stored index blob ID
     */
    getUserIndexBlobId(userId) {
        return this.userIndices.get(userId);
    }
    /**
     * Clear user data (from memory, not from Walrus)
     */
    clearUserData(userId) {
        this.vectorService.clearIndex(userId);
        this.userIndices.delete(userId);
        console.log(`🗑️ Cleared user data for: ${userId}`);
    }
    /**
     * Get comprehensive service statistics
     */
    getStats() {
        return {
            embedding: this.embeddingService.getStats(),
            walrus: this.walrusService.getStats(),
            users: {
                totalUsers: this.userIndices.size,
                userMappings: Object.fromEntries(this.userIndices)
            }
        };
    }
}
exports.PDW = PDW;
/**
 * Create PDW instance with configuration
 */
function createPDW(config) {
    return new PDW(config);
}
exports.default = PDW;
//# sourceMappingURL=PDW.js.map