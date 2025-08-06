import { Controller, Post, Body, Get, Query, Delete, Param, Put } from '@nestjs/common';
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

@Controller('memories')
export class MemoryController {
  constructor(
    private readonly memoryIngestionService: MemoryIngestionService,
    private readonly memoryQueryService: MemoryQueryService,
    private readonly memoryIndexService: MemoryIndexService
  ) {}

  @Get()
  async getMemories(@Query('user') userAddress: string): Promise<{ memories: Memory[], success: boolean }> {
    return this.memoryQueryService.getUserMemories(userAddress);
  }

  @Post()
  async createMemory(@Body() createMemoryDto: CreateMemoryDto) {
    return this.memoryIngestionService.processNewMemory(createMemoryDto);
  }

  @Post('save-approved')
  async saveApprovedMemory(@Body() saveMemoryDto: SaveMemoryDto) {
    // Process the approved memory without blockchain operations
    // Frontend handles blockchain, backend handles indexing and storage preparation
    return this.memoryIngestionService.processApprovedMemory(saveMemoryDto);
  }

  @Post('search')
  async searchMemories(@Body() searchMemoryDto: SearchMemoryDto): Promise<{ results: Memory[] }> {
    return this.memoryQueryService.searchMemories(
      searchMemoryDto.query, 
      searchMemoryDto.userAddress, 
      searchMemoryDto.category,
      searchMemoryDto.k
    );
  }

  @Delete(':memoryId')
  async deleteMemory(
    @Param('memoryId') memoryId: string,
    @Body('userAddress') userAddress: string
  ) {
    return this.memoryQueryService.deleteMemory(memoryId, userAddress);
  }

  @Put(':memoryId')
  async updateMemory(
    @Param('memoryId') memoryId: string,
    @Body() updateMemoryDto: UpdateMemoryDto
  ) {
    return this.memoryIngestionService.updateMemory(
      memoryId,
      updateMemoryDto.content,
      updateMemoryDto.userAddress
    );
  }

  @Post('context')
  async getMemoryContext(@Body() memoryContextDto: MemoryContextDto): Promise<{
    context: string,
    relevant_memories: Memory[],
    query_metadata: {
      query_time_ms: number,
      memories_found: number,
      context_length: number
    }
  }> {
    return this.memoryQueryService.getMemoryContext(
      memoryContextDto.query_text,
      memoryContextDto.user_address,
      memoryContextDto.user_signature,
      memoryContextDto.k
    );
  }

  @Get('stats')
  async getMemoryStats(@Query('userAddress') userAddress: string) {
    return this.memoryQueryService.getMemoryStats(userAddress);
  }
  
  @Get('content/:hash')
  async getMemoryContent(@Param('hash') hash: string) {
    return this.memoryQueryService.getMemoryContentByHash(hash);
  }
  
  @Post('index')
  async indexMemory(@Body() memoryIndexDto: MemoryIndexDto) {
    return this.memoryIngestionService.indexMemory(memoryIndexDto);
  }

  @Post('process')
  async processMemory(@Body() processDto: ProcessMemoryDto) {
    return this.memoryIngestionService.processMemory(processDto);
  }
  
  @Post('prepare-index')
  async prepareIndex(@Body() prepareIndexDto: PrepareIndexDto) {
    return this.memoryIndexService.prepareIndexForCreation(prepareIndexDto.userAddress);
  }
  
  @Post('register-index')
  async registerIndex(@Body() registerIndexDto: RegisterIndexDto) {
    return this.memoryIndexService.registerMemoryIndex(
      registerIndexDto.userAddress, 
      registerIndexDto.indexId
    );
  }
}
