import { EmbeddingService } from '../embedding/embedding.service';
import { GraphService } from '../graph/graph.service';
import { HnswIndexService } from '../hnsw-index/hnsw-index.service';
import { SealService } from '../../infrastructure/seal/seal.service';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { WalrusService } from '../../infrastructure/walrus/walrus.service';
import { CachedWalrusService } from '../../infrastructure/walrus/cached-walrus.service';
import { MemoryIngestionService } from '../memory-ingestion/memory-ingestion.service';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';
import { Memory } from '../../types/memory.types';
export declare class MemoryQueryService {
    private embeddingService;
    private graphService;
    private hnswIndexService;
    private sealService;
    private suiService;
    private walrusService;
    private cachedWalrusService;
    private memoryIngestionService;
    private geminiService;
    private readonly logger;
    constructor(embeddingService: EmbeddingService, graphService: GraphService, hnswIndexService: HnswIndexService, sealService: SealService, suiService: SuiService, walrusService: WalrusService, cachedWalrusService: CachedWalrusService, memoryIngestionService: MemoryIngestionService, geminiService: GeminiService);
    getUserMemories(userAddress: string): Promise<{
        memories: Memory[];
        success: boolean;
    }>;
    findRelevantMemories(query: string, userAddress: string, limit?: number): Promise<string[]>;
    searchMemories(query: string, userAddress: string, category?: string, k?: number): Promise<{
        results: Memory[];
    }>;
    deleteMemory(memoryId: string, userAddress: string): Promise<{
        message: string;
        success: boolean;
    }>;
    getMemoryContext(queryText: string, userAddress: string, userSignature: string, k?: number): Promise<{
        context: string;
        relevant_memories: Memory[];
        query_metadata: {
            query_time_ms: number;
            memories_found: number;
            context_length: number;
        };
    }>;
    getMemoryContentByHash(hash: string): Promise<{
        content: string;
        success: boolean;
    }>;
    getMemoryStats(userAddress: string): Promise<{
        total_memories: number;
        categories: Record<string, number>;
        storage_used_bytes: number;
        last_updated: string;
        success: boolean;
    }>;
}
