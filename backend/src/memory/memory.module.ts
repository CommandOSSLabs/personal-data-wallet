import { Module, forwardRef } from '@nestjs/common';
import { MemoryController } from './memory.controller';
import { MemoryIngestionService } from './memory-ingestion/memory-ingestion.service';
import { MemoryQueryService } from './memory-query/memory-query.service';
import { MemoryIndexService } from './memory-index/memory-index.service';
import { ClassifierService } from './classifier/classifier.service';
import { EmbeddingService } from './embedding/embedding.service';
import { GraphService } from './graph/graph.service';
import { HnswIndexService } from './hnsw-index/hnsw-index.service';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
@Module({
  imports: [forwardRef(() => InfrastructureModule)],
  controllers: [MemoryController],
  providers: [
    MemoryIngestionService,
    MemoryQueryService,
    MemoryIndexService,
    ClassifierService,
    EmbeddingService,
    GraphService,
    HnswIndexService
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