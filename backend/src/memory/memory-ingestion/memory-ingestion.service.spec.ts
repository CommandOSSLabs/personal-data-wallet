import { Test, TestingModule } from '@nestjs/testing';
import { MemoryIngestionService } from './memory-ingestion.service';

describe('MemoryIngestionService', () => {
  let service: MemoryIngestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemoryIngestionService],
    }).compile();

    service = module.get<MemoryIngestionService>(MemoryIngestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
