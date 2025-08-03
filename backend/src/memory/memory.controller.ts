import { Controller, Post, Body, Get, Query, Delete, Param, Put } from '@nestjs/common';
import { MemoryIngestionService } from './memory-ingestion/memory-ingestion.service';
import { MemoryQueryService } from './memory-query/memory-query.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { SearchMemoryDto } from './dto/search-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { MemoryContextDto } from './dto/memory-context.dto';
import { Memory } from '../types/memory.types';

@Controller('api/memories')
export class MemoryController {
  constructor(
    private readonly memoryIngestionService: MemoryIngestionService,
    private readonly memoryQueryService: MemoryQueryService
  ) {}

  @Get()
  async getMemories(@Query('user') userAddress: string): Promise<{ memories: Memory[], success: boolean }> {
    return this.memoryQueryService.getUserMemories(userAddress);
  }

  @Post()
  async createMemory(@Body() createMemoryDto: CreateMemoryDto) {
    return this.memoryIngestionService.processNewMemory(createMemoryDto);
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
}