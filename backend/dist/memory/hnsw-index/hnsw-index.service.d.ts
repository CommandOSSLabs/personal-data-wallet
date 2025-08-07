import * as hnswlib from 'hnswlib-node';
import { CachedWalrusService } from '../../infrastructure/walrus/cached-walrus.service';
import { DemoStorageService } from '../../infrastructure/demo-storage/demo-storage.service';
import { ConfigService } from '@nestjs/config';
export declare class HnswIndexService {
    private walrusService;
    private demoStorageService;
    private configService;
    private logger;
    private readonly indexCache;
    private readonly batchJobs;
    private readonly BATCH_DELAY_MS;
    private readonly MAX_BATCH_SIZE;
    private readonly CACHE_TTL_MS;
    private readonly DEFAULT_VECTOR_DIMENSIONS;
    constructor(walrusService: CachedWalrusService, demoStorageService: DemoStorageService, configService: ConfigService);
    private getStorageService;
    private startBatchProcessor;
    private startCacheCleanup;
    private cleanupCache;
    private processBatchJobs;
    private flushPendingVectors;
    private onIndexUpdated?;
    private saveIndexToWalrus;
    getOrLoadIndexCached(userAddress: string, indexBlobId?: string): Promise<hnswlib.HierarchicalNSW | null>;
    addIndexToCache(userAddress: string, index: hnswlib.HierarchicalNSW, version?: number): void;
    private loadIndexFromWalrus;
    createIndex(dimensions?: number, maxElements?: number): Promise<{
        index: hnswlib.HierarchicalNSW;
        serialized: Buffer;
    }>;
    addVectorToIndexBatched(userAddress: string, id: number, vector: number[]): void;
    addVectorToIndex(index: hnswlib.HierarchicalNSW, id: number, vector: number[]): void;
    forceFlush(userAddress: string): Promise<void>;
    searchVectors(userAddress: string, queryVector: number[], k?: number): Promise<{
        ids: number[];
        distances: number[];
    }>;
    private cloneIndex;
    clearUserIndex(userAddress: string): void;
    getCacheStats(): {
        totalUsers: number;
        totalPendingVectors: number;
        activeBatchJobs: number;
        cacheEntries: Array<{
            userAddress: string;
            pendingVectors: number;
            lastModified: Date;
            isDirty: boolean;
            indexDimensions: number | string;
        }>;
    };
    searchIndex(index: hnswlib.HierarchicalNSW, vector: number[], k: number): {
        ids: number[];
        distances: number[];
    };
    saveIndex(index: hnswlib.HierarchicalNSW, userAddress: string): Promise<string>;
    loadIndex(blobId: string, userAddress?: string): Promise<{
        index: hnswlib.HierarchicalNSW;
        serialized: Buffer;
    }>;
    getIndexSize(index: hnswlib.HierarchicalNSW): number;
    removeVectorFromIndex(index: hnswlib.HierarchicalNSW, id: number): void;
}
