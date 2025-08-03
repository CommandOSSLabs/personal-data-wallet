import { Test, TestingModule } from '@nestjs/testing';
import { WalrusService } from './walrus.service';

describe('WalrusService', () => {
  let service: WalrusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalrusService],
    }).compile();

    service = module.get<WalrusService>(WalrusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
