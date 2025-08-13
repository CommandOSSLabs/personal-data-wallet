import { HnswIndexService } from '../hnsw-index/hnsw-index.service';
import { GraphService } from '../graph/graph.service';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { PrepareIndexResponseDto } from '../dto/prepare-index.dto';
export declare class MemoryIndexService {
    private hnswIndexService;
    private graphService;
    private suiService;
    private readonly logger;
    private userIndexMap;
    constructor(hnswIndexService: HnswIndexService, graphService: GraphService, suiService: SuiService);
    prepareIndexForCreation(userAddress: string): Promise<PrepareIndexResponseDto>;
    registerMemoryIndex(userAddress: string, indexId: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    getIndexId(userAddress: string): string | undefined;
    setIndexId(userAddress: string, indexId: string): void;
    clearIndexId(userAddress: string): void;
    getOrLoadIndex(userAddress: string): Promise<{
        index?: any;
        graph?: any;
        indexId?: string;
        indexBlobId?: string;
        graphBlobId?: string;
        version?: number;
        exists: boolean;
    }>;
}
