import { MemoryIngestionService } from './memory-ingestion/memory-ingestion.service';
import { MemoryQueryService } from './memory-query/memory-query.service';
import { MemoryIndexService } from './memory-index/memory-index.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { SearchMemoryDto } from './dto/search-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { MemoryContextDto } from './dto/memory-context.dto';
import { MemoryIndexDto } from './dto/memory-index.dto';
import { ProcessMemoryDto } from './dto/process-memory.dto';
import { SaveMemoryDto } from './dto/save-memory.dto';
import { PrepareIndexDto } from './dto/prepare-index.dto';
import { RegisterIndexDto } from './dto/register-index.dto';
import { Memory } from '../types/memory.types';
export declare class MemoryController {
    private readonly memoryIngestionService;
    private readonly memoryQueryService;
    private readonly memoryIndexService;
    constructor(memoryIngestionService: MemoryIngestionService, memoryQueryService: MemoryQueryService, memoryIndexService: MemoryIndexService);
    getMemories(userAddress: string): Promise<{
        memories: Memory[];
        success: boolean;
    }>;
    createMemory(createMemoryDto: CreateMemoryDto): Promise<{
        success: boolean;
        memoryId?: string;
        message?: string;
        requiresIndexCreation?: boolean;
        indexBlobId?: string;
        graphBlobId?: string;
    }>;
    saveApprovedMemory(saveMemoryDto: SaveMemoryDto): Promise<{
        success: boolean;
        memoryId?: string;
        blobId?: string;
        vectorId?: number;
        message?: string;
    }>;
    searchMemories(searchMemoryDto: SearchMemoryDto): Promise<{
        results: Memory[];
    }>;
    deleteMemory(memoryId: string, userAddress: string): Promise<{
        message: string;
        success: boolean;
    }>;
    updateMemory(memoryId: string, updateMemoryDto: UpdateMemoryDto): Promise<{
        success: boolean;
        memory?: any;
        message?: string;
    }>;
    getMemoryContext(memoryContextDto: MemoryContextDto): Promise<{
        context: string;
        relevant_memories: Memory[];
        query_metadata: {
            query_time_ms: number;
            memories_found: number;
            context_length: number;
        };
    }>;
    getMemoryStats(userAddress: string): Promise<{
        total_memories: number;
        categories: Record<string, number>;
        storage_used_bytes: number;
        last_updated: string;
        success: boolean;
    }>;
    getMemoryContent(hash: string): Promise<{
        content: string;
        success: boolean;
    }>;
    indexMemory(memoryIndexDto: MemoryIndexDto): Promise<{
        success: boolean;
        message?: string;
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
    prepareIndex(prepareIndexDto: PrepareIndexDto): Promise<import("./dto/prepare-index.dto").PrepareIndexResponseDto>;
    registerIndex(registerIndexDto: RegisterIndexDto): Promise<{
        success: boolean;
        message?: string;
    }>;
    getBatchStats(): Promise<{
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
    }>;
    forceFlush(userAddress: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
