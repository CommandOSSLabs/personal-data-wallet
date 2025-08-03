import { Test, TestingModule } from '@nestjs/testing';
import { SuiService } from './sui.service';

describe('SuiService', () => {
  let service: SuiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuiService],
    }).compile();

    service = module.get<SuiService>(SuiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
