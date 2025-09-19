/**
 * Memory Service
 *
 * Handles all memory-related operations including CRUD, search, context retrieval,
 * HNSW vector search, metadata embeddings, and Walrus Quilts integration.
 */
import { PDWApiClient } from '../api/client';
import { Transaction } from '@mysten/sui/transactions';
import * as memoryContract from '../generated/pdw/memory.js';
export class MemoryService {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.apiClient = new PDWApiClient(config.apiUrl);
    }
    // ==================== TOP-LEVEL METHODS ====================
    /**
     * Create a new memory with full processing pipeline
     */
    async createMemory(options) {
        const response = await this.apiClient.createMemory(options);
        if (!response.success) {
            throw new Error(response.message || 'Failed to create memory');
        }
        return response.data.memoryId;
    }
    /**
     * Search memories using HNSW vector similarity
     */
    async searchMemories(options) {
        const response = await this.apiClient.searchMemories(options);
        if (!response.success) {
            throw new Error(response.message || 'Failed to search memories');
        }
        return response.data.results;
    }
    /**
     * Get memory context for AI chat integration
     */
    async getMemoryContext(query, userAddress, k) {
        const response = await this.apiClient.getMemoryContext({
            query_text: query,
            user_address: userAddress,
            k,
        });
        if (!response.success) {
            throw new Error(response.message || 'Failed to get memory context');
        }
        return response.data;
    }
    // ==================== TRANSACTION BUILDERS ====================
    get tx() {
        return {
            /**
             * Create transaction for memory record on blockchain
             */
            createMemoryRecord: async (options) => {
                const tx = new Transaction();
                // Create the memory record with inline metadata
                const memoryRecord = memoryContract.createMemoryRecord({
                    package: this.config.packageId,
                    arguments: {
                        category: Array.from(new TextEncoder().encode(options.category)),
                        vectorId: options.vectorId,
                        blobId: Array.from(new TextEncoder().encode(options.blobId)),
                        contentType: Array.from(new TextEncoder().encode(options.metadata.contentType)),
                        contentSize: options.metadata.contentSize,
                        contentHash: Array.from(new TextEncoder().encode(options.metadata.contentHash)),
                        topic: Array.from(new TextEncoder().encode(options.metadata.topic)),
                        importance: options.metadata.importance,
                        embeddingBlobId: Array.from(new TextEncoder().encode(options.metadata.embeddingBlobId))
                    }
                });
                tx.add(memoryRecord);
                return tx;
            },
            /**
             * Create transaction to delete memory
             */
            deleteMemory: async (memoryId) => {
                const tx = new Transaction();
                const deleteCall = memoryContract.deleteMemoryRecord({
                    package: this.config.packageId,
                    arguments: {
                        memory: memoryId
                    }
                });
                tx.add(deleteCall);
                return tx;
            },
            /**
             * Create transaction to update memory metadata
             */
            updateMemoryMetadata: async (memoryId, metadata) => {
                const tx = new Transaction();
                const updateCall = memoryContract.updateMemoryMetadata({
                    package: this.config.packageId,
                    arguments: {
                        memory: memoryId,
                        newTopic: Array.from(new TextEncoder().encode(metadata.newTopic)),
                        newImportance: metadata.newImportance
                    }
                });
                tx.add(updateCall);
                return tx;
            },
            /**
             * Create memory index transaction
             */
            createMemoryIndex: async (options) => {
                const tx = new Transaction();
                const indexCall = memoryContract.createMemoryIndex({
                    package: this.config.packageId,
                    arguments: {
                        indexBlobId: Array.from(new TextEncoder().encode(options.indexBlobId)),
                        graphBlobId: Array.from(new TextEncoder().encode(options.graphBlobId))
                    }
                });
                tx.add(indexCall);
                return tx;
            },
            /**
             * Update memory index transaction
             */
            updateMemoryIndex: async (options) => {
                const tx = new Transaction();
                const updateCall = memoryContract.updateMemoryIndex({
                    package: this.config.packageId,
                    arguments: {
                        memoryIndex: options.memoryIndex,
                        expectedVersion: options.expectedVersion,
                        newIndexBlobId: Array.from(new TextEncoder().encode(options.newIndexBlobId)),
                        newGraphBlobId: Array.from(new TextEncoder().encode(options.newGraphBlobId))
                    }
                });
                tx.add(updateCall);
                return tx;
            },
        };
    }
    // ==================== MOVE CALL BUILDERS ====================
    get call() {
        return {
            /**
             * Move call for memory record creation
             */
            createMemoryRecord: (options) => {
                return memoryContract.createMemoryRecord({
                    package: this.config.packageId,
                    arguments: {
                        category: Array.from(new TextEncoder().encode(options.category)),
                        vectorId: options.vectorId,
                        blobId: Array.from(new TextEncoder().encode(options.blobId)),
                        contentType: Array.from(new TextEncoder().encode(options.contentType)),
                        contentSize: options.contentSize,
                        contentHash: Array.from(new TextEncoder().encode(options.contentHash)),
                        topic: Array.from(new TextEncoder().encode(options.topic)),
                        importance: options.importance,
                        embeddingBlobId: Array.from(new TextEncoder().encode(options.embeddingBlobId))
                    }
                });
            },
            /**
             * Move call for memory deletion
             */
            deleteMemory: (memoryId) => {
                return memoryContract.deleteMemoryRecord({
                    package: this.config.packageId,
                    arguments: {
                        memory: memoryId
                    }
                });
            },
            /**
             * Move call for memory metadata updates
             */
            updateMemoryMetadata: (memoryId, options) => {
                return memoryContract.updateMemoryMetadata({
                    package: this.config.packageId,
                    arguments: {
                        memory: memoryId,
                        newTopic: Array.from(new TextEncoder().encode(options.newTopic)),
                        newImportance: options.newImportance
                    }
                });
            },
            /**
             * Move call for memory index creation
             */
            createMemoryIndex: (options) => {
                return memoryContract.createMemoryIndex({
                    package: this.config.packageId,
                    arguments: {
                        indexBlobId: Array.from(new TextEncoder().encode(options.indexBlobId)),
                        graphBlobId: Array.from(new TextEncoder().encode(options.graphBlobId))
                    }
                });
            },
            /**
             * Move call for memory index updates
             */
            updateMemoryIndex: (options) => {
                return memoryContract.updateMemoryIndex({
                    package: this.config.packageId,
                    arguments: {
                        memoryIndex: options.memoryIndex,
                        expectedVersion: options.expectedVersion,
                        newIndexBlobId: Array.from(new TextEncoder().encode(options.newIndexBlobId)),
                        newGraphBlobId: Array.from(new TextEncoder().encode(options.newGraphBlobId))
                    }
                });
            },
            /**
             * Move call for adding custom metadata
             */
            addCustomMetadata: (options) => {
                return memoryContract.addCustomMetadata({
                    package: this.config.packageId,
                    arguments: {
                        memory: options.memory,
                        key: Array.from(new TextEncoder().encode(options.key)),
                        value: Array.from(new TextEncoder().encode(options.value))
                    }
                });
            },
        };
    }
    // ==================== VIEW METHODS ====================
    get view() {
        return {
            /**
             * Get all memories for a user (from backend API)
             */
            getUserMemories: async (userAddress) => {
                const response = await this.apiClient.getUserMemories(userAddress);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to get user memories');
                }
                return response.data.memories;
            },
            /**
             * Get memory object from blockchain
             */
            getMemory: async (memoryId) => {
                try {
                    const memoryObject = await this.client.core.getObject(memoryId);
                    return memoryObject;
                }
                catch (error) {
                    throw new Error(`Failed to get memory ${memoryId}: ${error}`);
                }
            },
            /**
             * Get memory index information from blockchain
             */
            getMemoryIndex: async (indexId) => {
                try {
                    const indexObject = await this.client.core.getObject(indexId);
                    return indexObject;
                }
                catch (error) {
                    throw new Error(`Failed to get memory index ${indexId}: ${error}`);
                }
            },
            /**
             * Get memory statistics from backend
             */
            getMemoryStats: async (userAddress) => {
                const response = await this.apiClient.getMemoryStats(userAddress);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to get memory stats');
                }
                return response.data;
            },
            /**
             * Get batch processing statistics
             */
            getBatchStats: async () => {
                const response = await this.apiClient.getBatchStats();
                if (!response.success) {
                    throw new Error(response.message || 'Failed to get batch stats');
                }
                return response.data;
            },
            /**
             * Get memory blob ID from blockchain
             */
            getMemoryBlobId: async (memoryId) => {
                // This would use memoryContract.getMemoryBlobId but it's a view function
                // For now, we'll get the full object and extract the blob ID
                const memoryObject = await this.view.getMemory(memoryId);
                return memoryObject?.data?.content?.fields?.blob_id;
            },
            /**
             * Get memory category from blockchain
             */
            getMemoryCategory: async (memoryId) => {
                const memoryObject = await this.view.getMemory(memoryId);
                return memoryObject?.data?.content?.fields?.category;
            },
            /**
             * Get memory vector ID from blockchain
             */
            getMemoryVectorId: async (memoryId) => {
                const memoryObject = await this.view.getMemory(memoryId);
                return memoryObject?.data?.content?.fields?.vector_id;
            },
            /**
             * Get memory metadata from blockchain
             */
            getMemoryMetadata: async (memoryId) => {
                const memoryObject = await this.view.getMemory(memoryId);
                return memoryObject?.data?.content?.fields?.metadata;
            },
            /**
             * Get index blob ID from memory index
             */
            getIndexBlobId: async (indexId) => {
                const indexObject = await this.view.getMemoryIndex(indexId);
                return indexObject?.data?.content?.fields?.index_blob_id;
            },
            /**
             * Get graph blob ID from memory index
             */
            getGraphBlobId: async (indexId) => {
                const indexObject = await this.view.getMemoryIndex(indexId);
                return indexObject?.data?.content?.fields?.graph_blob_id;
            },
            /**
             * Get memory index version
             */
            getIndexVersion: async (indexId) => {
                const indexObject = await this.view.getMemoryIndex(indexId);
                return indexObject?.data?.content?.fields?.version;
            },
        };
    }
    // ==================== ENHANCED METHODS ====================
    /**
     * Delete memory with both backend and blockchain cleanup
     */
    async deleteMemoryRecord(memoryId, userAddress, signer) {
        // Delete from backend first
        const response = await this.apiClient.deleteMemory(memoryId, userAddress);
        if (!response.success) {
            throw new Error(response.message || 'Failed to delete memory from backend');
        }
        // If signer is provided, also delete from blockchain
        if (signer) {
            const tx = await this.tx.deleteMemory(memoryId);
            const result = await signer.signAndExecuteTransaction({
                transaction: tx,
                client: this.client,
            });
            return result;
        }
        return response;
    }
    /**
     * Force flush batch processing for a user
     */
    async forceFlushUser(userAddress) {
        // This would be a backend operation
        const url = `/memories/force-flush/${encodeURIComponent(userAddress)}`;
        const response = await fetch(`${this.apiClient['baseUrl']}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            throw new Error(`Failed to flush user data: ${response.statusText}`);
        }
        return response.json();
    }
}
//# sourceMappingURL=MemoryService.js.map