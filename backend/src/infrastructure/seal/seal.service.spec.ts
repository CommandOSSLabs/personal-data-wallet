import { Test, TestingModule } from '@nestjs/testing';
import { SealService } from './seal.service';

describe('SealService', () => {
  let service: SealService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SealService],
    }).compile();

    service = module.get<SealService>(SealService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
