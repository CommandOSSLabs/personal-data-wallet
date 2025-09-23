/**
 * Core Types for PDW Vector Storage
 */
export interface VectorEmbedding {
    vector: number[];
    dimension: number;
    model: string;
    metadata?: Record<string, any>;
}
export interface Memory {
    id: string;
    content: string;
    category: string;
    createdAt: Date;
    userId?: string;
    metadata?: Record<string, any>;
}
export interface ProcessedMemory extends Memory {
    embedding?: number[];
    embeddingModel?: string;
    vectorId?: number;
    blobId?: string;
    processedAt?: Date;
}
export interface EmbeddingConfig {
    apiKey: string;
    model?: string;
    dimensions?: number;
    requestsPerMinute?: number;
}
export interface EmbeddingResult {
    vector: number[];
    dimension: number;
    model: string;
    processingTime: number;
    tokenCount?: number;
}
export interface BatchEmbeddingResult {
    vectors: number[][];
    dimension: number;
    model: string;
    totalProcessingTime: number;
    averageProcessingTime: number;
    successCount: number;
    failedCount: number;
}
export interface HNSWIndexConfig {
    dimension: number;
    maxElements: number;
    efConstruction?: number;
    m?: number;
    seed?: number;
    enablePersistence?: boolean;
}
export interface VectorSearchOptions {
    k?: number;
    threshold?: number;
    efSearch?: number;
    includeMetadata?: boolean;
    includeEmbeddings?: boolean;
}
export interface VectorSearchMatch {
    memoryId: string;
    vectorId: number;
    similarity: number;
    distance: number;
    metadata?: any;
    embedding?: VectorEmbedding;
}
export interface VectorSearchResult {
    results: VectorSearchMatch[];
    queryTime: number;
    totalResults: number;
}
export interface WalrusUploadResult {
    blobId: string;
    uploadTimeMs: number;
    isEncrypted: boolean;
    metadata: MemoryMetadata;
}
export interface WalrusRetrievalResult {
    content: string | Uint8Array;
    metadata: MemoryMetadata;
    retrievalTimeMs: number;
    isFromCache: boolean;
}
export interface MemoryMetadata {
    contentType: string;
    contentSize: number;
    contentHash: string;
    category: string;
    topic?: string;
    importance: number;
    createdAt: number;
    updatedAt: number;
    customMetadata?: Record<string, string>;
}
export interface StorageResult {
    success: boolean;
    blobId?: string;
    metadata?: MemoryMetadata;
    error?: string;
    processingTimeMs: number;
    storageProvider: 'walrus' | 'local';
}
export interface VectorStorageConfig {
    embedding: {
        apiKey: string;
        model?: string;
        batchSize?: number;
    };
    vector: {
        dimensions?: number;
        maxElements?: number;
        efConstruction?: number;
        m?: number;
    };
    walrus: {
        network?: 'testnet' | 'mainnet';
        enableBatching?: boolean;
        batchSize?: number;
    };
}
//# sourceMappingURL=index.d.ts.map