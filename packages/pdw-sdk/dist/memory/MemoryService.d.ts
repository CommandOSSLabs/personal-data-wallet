/**
 * Memory Service
 *
 * Handles all memory-related operations including CRUD, search, context retrieval,
 * HNSW vector search, metadata embeddings, and Walrus Quilts integration.
 */
import type { ClientWithCoreApi, PDWConfig, MemoryCreateOptions, MemorySearchOptions, MemorySearchResult, MemoryContext, MemoryStatsResponse, Thunk } from '../types';
import { Transaction } from '@mysten/sui/transactions';
export declare class MemoryService {
    private client;
    private config;
    private apiClient;
    constructor(client: ClientWithCoreApi, config: PDWConfig);
    /**
     * Create a new memory with full processing pipeline
     */
    createMemory(options: MemoryCreateOptions): Promise<string>;
    /**
     * Search memories using HNSW vector similarity with advanced options
     */
    searchMemories(options: MemorySearchOptions): Promise<MemorySearchResult[]>;
    /**
     * Advanced memory search with similarity scoring and filtering
     */
    searchMemoriesAdvanced(options: {
        query: string;
        userAddress: string;
        category?: string;
        k?: number;
        threshold?: number;
        includeMetadata?: boolean;
        includeEmbeddings?: boolean;
        timeRange?: {
            start?: Date;
            end?: Date;
        };
    }): Promise<{
        results: MemorySearchResult[];
        searchMetadata: {
            queryTime: number;
            totalResults: number;
            filteredResults: number;
            averageSimilarity: number;
            categories: Record<string, number>;
        };
    }>;
    /**
     * Get memory context for AI chat integration
     */
    getMemoryContext(query: string, userAddress: string, k?: number): Promise<MemoryContext>;
    get tx(): {
        /**
         * Create transaction for memory record on blockchain
         */
        createMemoryRecord: (options: {
            category: string;
            vectorId: number | bigint;
            blobId: string;
            metadata: {
                contentType: string;
                contentSize: number | bigint;
                contentHash: string;
                category: string;
                topic: string;
                importance: number;
                embeddingBlobId: string;
                embeddingDimension: number | bigint;
                createdTimestamp: number | bigint;
                updatedTimestamp: number | bigint;
                customMetadata?: Record<string, string>;
            };
        }) => Promise<Transaction>;
        /**
         * Create transaction to delete memory
         */
        deleteMemory: (memoryId: string) => Promise<Transaction>;
        /**
         * Create transaction to update memory metadata
         */
        updateMemoryMetadata: (memoryId: string, metadata: {
            newTopic: string;
            newImportance: number;
        }) => Promise<Transaction>;
        /**
         * Create memory index transaction
         */
        createMemoryIndex: (options: {
            indexBlobId: string;
            graphBlobId: string;
        }) => Promise<Transaction>;
        /**
         * Update memory index transaction
         */
        updateMemoryIndex: (options: {
            memoryIndex: string;
            expectedVersion: number | bigint;
            newIndexBlobId: string;
            newGraphBlobId: string;
        }) => Promise<Transaction>;
    };
    get call(): {
        /**
         * Move call for memory record creation
         */
        createMemoryRecord: (options: {
            category: string;
            vectorId: number | bigint;
            blobId: string;
            contentType: string;
            contentSize: number | bigint;
            contentHash: string;
            topic: string;
            importance: number;
            embeddingBlobId: string;
        }) => Thunk;
        /**
         * Move call for memory deletion
         */
        deleteMemory: (memoryId: string) => Thunk;
        /**
         * Move call for memory metadata updates
         */
        updateMemoryMetadata: (memoryId: string, options: {
            newTopic: string;
            newImportance: number;
        }) => Thunk;
        /**
         * Move call for memory index creation
         */
        createMemoryIndex: (options: {
            indexBlobId: string;
            graphBlobId: string;
        }) => Thunk;
        /**
         * Move call for memory index updates
         */
        updateMemoryIndex: (options: {
            memoryIndex: string;
            expectedVersion: number | bigint;
            newIndexBlobId: string;
            newGraphBlobId: string;
        }) => Thunk;
        /**
         * Move call for adding custom metadata
         */
        addCustomMetadata: (options: {
            memory: string;
            key: string;
            value: string;
        }) => Thunk;
    };
    get view(): {
        /**
         * Get all memories for a user (from backend API)
         */
        getUserMemories: (userAddress: string) => Promise<MemorySearchResult[]>;
        /**
         * Get memory object from blockchain
         */
        getMemory: (memoryId: string) => Promise<any>;
        /**
         * Get memory index information from blockchain
         */
        getMemoryIndex: (indexId: string) => Promise<any>;
        /**
         * Get memory statistics from backend
         */
        getMemoryStats: (userAddress: string) => Promise<MemoryStatsResponse>;
        /**
         * Get batch processing statistics
         */
        getBatchStats: () => Promise<import("../types").BatchStats>;
        /**
         * Get memory blob ID from blockchain
         */
        getMemoryBlobId: (memoryId: string) => Promise<any>;
        /**
         * Get memory category from blockchain
         */
        getMemoryCategory: (memoryId: string) => Promise<any>;
        /**
         * Get memory vector ID from blockchain
         */
        getMemoryVectorId: (memoryId: string) => Promise<any>;
        /**
         * Get memory metadata from blockchain
         */
        getMemoryMetadata: (memoryId: string) => Promise<any>;
        /**
         * Get index blob ID from memory index
         */
        getIndexBlobId: (indexId: string) => Promise<any>;
        /**
         * Get graph blob ID from memory index
         */
        getGraphBlobId: (indexId: string) => Promise<any>;
        /**
         * Get memory index version
         */
        getIndexVersion: (indexId: string) => Promise<any>;
    };
    /**
     * Delete memory with both backend and blockchain cleanup
     */
    deleteMemoryRecord(memoryId: string, userAddress: string, signer?: any): Promise<any>;
    /**
     * Force flush batch processing for a user
     */
    forceFlushUser(userAddress: string): Promise<any>;
    /**
     * Generate embeddings for text content using backend AI service
     */
    generateEmbeddings(options: {
        text: string;
        type?: 'content' | 'metadata' | 'query';
        userAddress: string;
    }): Promise<{
        embeddings: number[];
        dimension: number;
        model: string;
        processingTime: number;
    }>;
    /**
     * Perform HNSW vector similarity search
     */
    vectorSearch(options: {
        queryVector: number[];
        userAddress: string;
        k?: number;
        efSearch?: number;
        category?: string;
        minSimilarity?: number;
    }): Promise<{
        results: Array<{
            memoryId: string;
            vectorId: number;
            similarity: number;
            distance: number;
            metadata?: any;
        }>;
        searchStats: {
            searchTime: number;
            nodesVisited: number;
            exactMatches: number;
            approximateMatches: number;
        };
    }>;
    /**
     * Create memory with enhanced metadata embeddings
     */
    createMemoryWithEmbeddings(options: {
        content: string;
        category: string;
        topic?: string;
        importance?: number;
        userAddress: string;
        signer?: any;
        customMetadata?: Record<string, string>;
        generateEmbeddings?: boolean;
    }): Promise<{
        memoryId: string;
        embeddings?: {
            content: number[];
            metadata: number[];
        };
        processingStats: {
            totalTime: number;
            embeddingTime: number;
            storageTime: number;
            blockchainTime: number;
        };
    }>;
    /**
     * Smart memory retrieval with context awareness
     */
    getMemoryWithContext(options: {
        memoryId: string;
        userAddress: string;
        includeRelated?: boolean;
        relatedCount?: number;
        contextRadius?: number;
    }): Promise<{
        memory: MemorySearchResult;
        relatedMemories?: MemorySearchResult[];
        contextGraph?: {
            nodes: Array<{
                id: string;
                label: string;
                category: string;
            }>;
            edges: Array<{
                from: string;
                to: string;
                similarity: number;
            }>;
        };
    }>;
    /**
     * Batch process multiple memories with embeddings
     */
    batchProcessMemories(options: {
        memories: Array<{
            content: string;
            category: string;
            topic?: string;
            importance?: number;
        }>;
        userAddress: string;
        batchSize?: number;
        generateEmbeddings?: boolean;
    }): Promise<{
        results: Array<{
            success: boolean;
            memoryId?: string;
            error?: string;
        }>;
        batchStats: {
            totalProcessed: number;
            successful: number;
            failed: number;
            totalTime: number;
            averageTimePerMemory: number;
        };
    }>;
}
//# sourceMappingURL=MemoryService.d.ts.map