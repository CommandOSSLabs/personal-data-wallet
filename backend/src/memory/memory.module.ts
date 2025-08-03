import { Module } from '@nestjs/common';
import { MemoryController } from './memory.controller';
import { MemoryIngestionService } from './memory-ingestion/memory-ingestion.service';
import { MemoryQueryService } from './memory-query/memory-query.service';
import { ClassifierService } from './classifier/classifier.service';
import { EmbeddingService } from './embedding/embedding.service';
import { HnswIndexService } from './hnsw-index/hnsw-index.service';
import { GraphService } from './graph/graph.service';

@Module({
  controllers: [MemoryController],
  providers: [
    MemoryIngestionService,
    MemoryQueryService,
    ClassifierService,
    EmbeddingService,
    HnswIndexService,
    GraphService
  ],
  exports: [
    MemoryIngestionService,
    MemoryQueryService,
    ClassifierService,
    EmbeddingService,
    HnswIndexService,
    GraphService
  ]
})
export class MemoryModule {}