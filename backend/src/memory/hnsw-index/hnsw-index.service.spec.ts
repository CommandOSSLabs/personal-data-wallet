import { Test, TestingModule } from '@nestjs/testing';
import { HnswIndexService } from './hnsw-index.service';

describe('HnswIndexService', () => {
  let service: HnswIndexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnswIndexService],
    }).compile();

    service = module.get<HnswIndexService>(HnswIndexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
