import { MemoryIngestionService } from './memory-ingestion/memory-ingestion.service';
import { MemoryQueryService } from './memory-query/memory-query.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { SearchMemoryDto } from './dto/search-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { MemoryContextDto } from './dto/memory-context.dto';
import { MemoryIndexDto } from './dto/memory-index.dto';
import { ProcessMemoryDto } from './dto/process-memory.dto';
import { Memory } from '../types/memory.types';
export declare class MemoryController {
    private readonly memoryIngestionService;
    private readonly memoryQueryService;
    constructor(memoryIngestionService: MemoryIngestionService, memoryQueryService: MemoryQueryService);
    getMemories(userAddress: string): Promise<{
        memories: Memory[];
        success: boolean;
    }>;
    createMemory(createMemoryDto: CreateMemoryDto): Promise<{
        success: boolean;
        memoryId?: string;
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
    }>;
}
