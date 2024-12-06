import { Test, TestingModule } from '@nestjs/testing';
import { LocalizationController } from './localizations.controller';

describe('LocalizationController', () => {
  let controller: LocalizationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalizationController],
    }).compile();

    controller = module.get<LocalizationController>(LocalizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
