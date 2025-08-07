import { ClassifierService } from '../classifier/classifier.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { GraphService } from '../graph/graph.service';
import { HnswIndexService } from '../hnsw-index/hnsw-index.service';
import { MemoryIndexService } from '../memory-index/memory-index.service';
import { SealService } from '../../infrastructure/seal/seal.service';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';
import { ConfigService } from '@nestjs/config';
export interface CreateMemoryDto {
    content: string;
    category: string;
    userAddress: string;
    userSignature?: string;
}
export interface ProcessMemoryDto {
    content: string;
    userAddress: string;
    category?: string;
}
export interface MemoryIndexDto {
    memoryId: string;
    userAddress: string;
    category?: string;
    walrusHash?: string;
}
export interface SaveMemoryDto {
    content: string;
    category: string;
    userAddress: string;
    suiObjectId?: string;
}
export declare class MemoryIngestionService {
    private classifierService;
    private embeddingService;
    private graphService;
    private hnswIndexService;
    private memoryIndexService;
    private sealService;
    private suiService;
    private storageService;
    private geminiService;
    private configService;
    private readonly logger;
    private entityToVectorMap;
    private nextVectorId;
    constructor(classifierService: ClassifierService, embeddingService: EmbeddingService, graphService: GraphService, hnswIndexService: HnswIndexService, memoryIndexService: MemoryIndexService, sealService: SealService, suiService: SuiService, storageService: StorageService, geminiService: GeminiService, configService: ConfigService);
    private isDemoMode;
    getNextVectorId(userAddress: string): number;
    getEntityToVectorMap(userAddress: string): Record<string, number>;
    processConversation(userMessage: string, assistantResponse: string, userAddress: string): Promise<{
        memoryStored: boolean;
        memoryId?: string;
    }>;
    processNewMemory(memoryDto: CreateMemoryDto): Promise<{
        success: boolean;
        memoryId?: string;
        blobId?: string;
        vectorId?: number;
        message?: string;
        requiresIndexCreation?: boolean;
        indexBlobId?: string;
        graphBlobId?: string;
    }>;
    processMemory(processDto: ProcessMemoryDto): Promise<{
        success: boolean;
        vectorId?: number;
        blobId?: string;
        message?: string;
        requiresIndexCreation?: boolean;
        indexBlobId?: string;
        graphBlobId?: string;
    }>;
    indexMemory(indexDto: MemoryIndexDto): Promise<{
        success: boolean;
        message?: string;
    }>;
    updateMemory(memoryId: string, content: string, userAddress: string): Promise<{
        success: boolean;
        memory?: any;
        message?: string;
    }>;
    processApprovedMemory(saveMemoryDto: SaveMemoryDto): Promise<{
        success: boolean;
        memoryId?: string;
        blobId?: string;
        vectorId?: number;
        message?: string;
    }>;
    private ensureIndexInCache;
    getBatchStats(): {
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
    forceFlushUser(userAddress: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
