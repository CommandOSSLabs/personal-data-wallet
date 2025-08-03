import { Test, TestingModule } from '@nestjs/testing';
import { ClassifierService } from './classifier.service';

describe('ClassifierService', () => {
  let service: ClassifierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassifierService],
    }).compile();

    service = module.get<ClassifierService>(ClassifierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
