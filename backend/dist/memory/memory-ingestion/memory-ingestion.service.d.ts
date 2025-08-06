import { ClassifierService } from '../classifier/classifier.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { GraphService } from '../graph/graph.service';
import { HnswIndexService } from '../hnsw-index/hnsw-index.service';
import { MemoryIndexService } from '../memory-index/memory-index.service';
import { SealService } from '../../infrastructure/seal/seal.service';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { WalrusService } from '../../infrastructure/walrus/walrus.service';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';
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
    private walrusService;
    private geminiService;
    private readonly logger;
    private entityToVectorMap;
    private nextVectorId;
    constructor(classifierService: ClassifierService, embeddingService: EmbeddingService, graphService: GraphService, hnswIndexService: HnswIndexService, memoryIndexService: MemoryIndexService, sealService: SealService, suiService: SuiService, walrusService: WalrusService, geminiService: GeminiService);
    getNextVectorId(userAddress: string): number;
    getEntityToVectorMap(userAddress: string): Record<string, number>;
    processConversation(userMessage: string, assistantResponse: string, userAddress: string): Promise<{
        memoryStored: boolean;
        memoryId?: string;
    }>;
    processNewMemory(memoryDto: CreateMemoryDto): Promise<{
        success: boolean;
        memoryId?: string;
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
}
