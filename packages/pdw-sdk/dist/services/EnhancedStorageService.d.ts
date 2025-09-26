/**
 * Enhanced StorageService with HNSW-Based Metadata Retrieval
 *
 * This service integrates your existing StorageService with HNSW indexing
 * for sophisticated metadata-based search and retrieval capabilities.
 */
import { StorageService, type MemoryMetadata } from './StorageService';
import { HnswIndexService } from '../vector/HnswIndexService';
import { EmbeddingService } from '../embedding/EmbeddingService';
export interface MetadataSearchQuery {
    query?: string;
    vector?: number[];
    filters?: {
        category?: string | string[];
        topic?: string | string[];
        importance?: {
            min?: number;
            max?: number;
        };
        contentType?: string | string[];
        dateRange?: {
            start?: Date;
            end?: Date;
        };
        tags?: string[];
        contentSize?: {
            min?: number;
            max?: number;
        };
    };
    k?: number;
    threshold?: number;
    includeContent?: boolean;
    useCache?: boolean;
}
export interface MetadataSearchResult {
    blobId: string;
    content?: string | Uint8Array;
    metadata: MemoryMetadata;
    similarity: number;
    relevanceScore: number;
}
export interface IndexedMemoryEntry {
    blobId: string;
    vectorId: number;
    metadata: MemoryMetadata;
    vector: number[];
}
/**
 * Enhanced Storage Service with HNSW-based metadata search
 */
export declare class EnhancedStorageService extends StorageService {
    private hnswService;
    private embeddingService;
    private memoryIndex;
    private nextVectorId;
    constructor(storageService: StorageService, embeddingService: EmbeddingService, hnswService?: HnswIndexService);
    /**
     * Enhanced upload with automatic HNSW indexing
     */
    uploadWithIndexing(content: string | Uint8Array, metadata: MemoryMetadata, userAddress: string): Promise<StorageResult & {
        vectorId: number;
    }>;
    /**
     * Sophisticated metadata-based search using HNSW
     */
    searchByMetadata(userAddress: string, searchQuery: MetadataSearchQuery): Promise<MetadataSearchResult[]>;
    /**
     * Get all indexed memories for a user with optional filtering
     */
    getUserMemoriesWithMetadata(userAddress: string, filters?: MetadataSearchQuery['filters']): Promise<MetadataSearchResult[]>;
    /**
     * Search by category with advanced filtering
     */
    searchByCategory(userAddress: string, category: string, additionalFilters?: Omit<MetadataSearchQuery['filters'], 'category'>): Promise<MetadataSearchResult[]>;
    /**
     * Temporal search - find memories within time ranges
     */
    searchByTimeRange(userAddress: string, startDate: Date, endDate: Date, additionalFilters?: Omit<MetadataSearchQuery['filters'], 'dateRange'>): Promise<MetadataSearchResult[]>;
    /**
     * Get search statistics and analytics
     */
    getSearchAnalytics(userAddress: string): {
        totalMemories: number;
        categoryCounts: Record<string, number>;
        averageImportance: number;
        timeRange: {
            earliest: Date;
            latest: Date;
        } | null;
        topTags: Array<{
            tag: string;
            count: number;
        }>;
    };
    private createMetadataFilter;
    private matchesFilters;
    private calculateRelevanceScore;
}
export default EnhancedStorageService;
//# sourceMappingURL=EnhancedStorageService.d.ts.map