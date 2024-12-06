import { Test, TestingModule } from '@nestjs/testing';
import { ReportCaseService } from './reportCases.service';

describe('ReportCaseService', () => {
  let service: ReportCaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportCaseService],
    }).compile();

    service = module.get<ReportCaseService>(ReportCaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
