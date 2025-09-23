/**
 * Core types for PDW vector storage functionality
 */
export interface PDWMemory {
    id: string;
    content: string;
    category: string;
    userId: string;
    createdAt: Date;
    metadata?: Record<string, any>;
}
export interface ProcessedMemory extends PDWMemory {
    embedding?: number[];
    embeddingModel?: string;
    vectorId?: number;
    processedAt: Date;
    blobId?: string;
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
export interface VectorConfig {
    dimensions?: number;
    maxElements?: number;
    efConstruction?: number;
    m?: number;
    enablePersistence?: boolean;
}
export interface VectorSearchOptions {
    k?: number;
    threshold?: number;
    efSearch?: number;
    includeEmbeddings?: boolean;
    includeMetadata?: boolean;
}
export interface VectorSearchResult {
    results: VectorSearchMatch[];
    totalResults: number;
    stats?: {
        searchTime: number;
        embeddingTime: number;
        indexSearchTime: number;
        totalResults: number;
        cacheHits: number;
        indexSize: number;
    };
}
export interface VectorSearchMatch {
    memoryId: string;
    vectorId: number;
    similarity: number;
    distance: number;
    metadata?: any;
    embedding?: {
        vector: number[];
        dimension: number;
        model: string;
    };
}
export interface VectorSearchStats {
    searchTime: number;
    embeddingTime: number;
    indexSearchTime: number;
    totalResults: number;
    cacheHits: number;
    indexSize: number;
}
export interface WalrusConfig {
    network?: 'testnet' | 'mainnet';
    enableEncryption?: boolean;
    enableBatching?: boolean;
    batchSize?: number;
    batchDelayMs?: number;
}
export interface WalrusUploadResult {
    blobId: string;
    isEncrypted: boolean;
    uploadTimeMs: number;
    metadata: PDWMemoryMetadata;
}
export interface WalrusRetrievalResult {
    content: string | Uint8Array;
    metadata: PDWMemoryMetadata;
    retrievalTimeMs: number;
    isFromCache: boolean;
}
export interface PDWMemoryMetadata {
    owner: string;
    contentType: string;
    contentSize: number;
    contentHash: string;
    category: string;
    topic?: string;
    importance: number;
    createdAt: number;
    updatedAt: number;
    additionalTags?: Record<string, string>;
}
export interface HNSWIndexConfig {
    dimensions: number;
    maxElements: number;
    efConstruction?: number;
    m?: number;
}
export interface PDWConfig {
    embedding: EmbeddingConfig;
    vector?: VectorConfig;
    walrus?: WalrusConfig;
    sui?: {
        network?: 'testnet' | 'mainnet';
        packageId?: string;
    };
}
export interface OperationResult {
    success: boolean;
    error?: string;
    processingTime: number;
}
export interface VectorStorageResult extends OperationResult {
    vectorId?: number;
    blobId?: string;
    embedding?: number[];
}
export interface BatchOperationResult {
    successful: VectorStorageResult[];
    failed: Array<{
        memory: PDWMemory;
        error: string;
    }>;
    totalProcessingTime: number;
    averageProcessingTime: number;
}
export interface VectorStorageConfig extends PDWConfig {
}
export interface OperationResult {
    success: boolean;
    error?: string;
    processingTime: number;
}
//# sourceMappingURL=types.d.ts.map