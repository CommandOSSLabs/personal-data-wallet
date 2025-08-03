import { Test, TestingModule } from '@nestjs/testing';
import { MemoryQueryService } from './memory-query.service';

describe('MemoryQueryService', () => {
  let service: MemoryQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemoryQueryService],
    }).compile();

    service = module.get<MemoryQueryService>(MemoryQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
