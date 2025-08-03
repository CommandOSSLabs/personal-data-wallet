import { ClassifierService } from '../classifier/classifier.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { GraphService } from '../graph/graph.service';
import { HnswIndexService } from '../hnsw-index/hnsw-index.service';
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
export declare class MemoryIngestionService {
    private classifierService;
    private embeddingService;
    private graphService;
    private hnswIndexService;
    private sealService;
    private suiService;
    private walrusService;
    private geminiService;
    private readonly logger;
    private entityToVectorMap;
    private nextVectorId;
    constructor(classifierService: ClassifierService, embeddingService: EmbeddingService, graphService: GraphService, hnswIndexService: HnswIndexService, sealService: SealService, suiService: SuiService, walrusService: WalrusService, geminiService: GeminiService);
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
    }>;
    updateMemory(memoryId: string, content: string, userAddress: string): Promise<{
        success: boolean;
        memory?: any;
        message?: string;
    }>;
}
