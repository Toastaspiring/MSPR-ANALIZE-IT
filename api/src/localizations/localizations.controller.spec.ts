import { Test, TestingModule } from '@nestjs/testing';
import { LocalizationController } from './localizations.controller';
import { LocalizationService } from './localizations.service';

describe('DiseasesController', () => {
  let controller: LocalizationController;
  let service: LocalizationService;

  const mockDiseasesService = {
    
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalizationController],
      providers: [
        {
          provide: LocalizationService,
          useValue: mockDiseasesService,
        },
      ],
    }).compile();

    controller = module.get<LocalizationController>(LocalizationController);
    service = module.get<LocalizationService>(LocalizationService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
