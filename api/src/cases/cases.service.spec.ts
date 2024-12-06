import { Test, TestingModule } from '@nestjs/testing';
import { CaseService } from './cases.service';

describe('CaseService', () => {
  let service: CaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaseService],
    }).compile();

    service = module.get<CaseService>(CaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
