import { Test, TestingModule } from '@nestjs/testing';
import { SummarizationService } from './summarization.service';

describe('SummarizationService', () => {
  let service: SummarizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SummarizationService],
    }).compile();

    service = module.get<SummarizationService>(SummarizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
