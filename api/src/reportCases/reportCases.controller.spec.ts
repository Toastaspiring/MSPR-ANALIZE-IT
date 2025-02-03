import { Test, TestingModule } from '@nestjs/testing';
import { ReportCaseController } from './reportCases.controller';
import { ReportCaseService } from './reportCases.service';
import { CreateReportCaseDto } from './dto/CreateReportCase.dto';
import { UpdateReportCaseDto } from './dto/UpdateReportCase.dto';

// TODO : tester les codes d'erreur

describe('ReportCaseController', () => {
  let controller: ReportCaseController;
  let service: ReportCaseService;

  const reportCase = {
    id: 1,
    totalConfirmed: 100,
    totalDeath: 5,
    totalActive: 80,
    localizationId: 10,
    diseaseId: 20,
    date: 1738491534000
  };

  const mockReportCaseService = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getFilteredReportCases: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportCaseController],
      providers: [
        {
          provide: ReportCaseService,
          useValue: mockReportCaseService,
        },
      ],
    }).compile();

    controller = module.get<ReportCaseController>(ReportCaseController);
    service = module.get<ReportCaseService>(ReportCaseService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('should create a new report case', async () => {
      const createDto: CreateReportCaseDto = {
        totalConfirmed: reportCase.totalConfirmed,
        totalDeath: reportCase.totalDeath,
        totalActive: reportCase.totalActive,
        localizationId: reportCase.localizationId,
        diseaseId: reportCase.diseaseId,
        date: reportCase.date,
      };
      const createdCase = { id: reportCase.id, ...createDto };

      mockReportCaseService.create.mockResolvedValue(createdCase);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(createdCase);
    });
  });

  describe('update', () => {
    it('should update an existing report case', async () => {
      const updateDto: UpdateReportCaseDto = {
        totalConfirmed: 150,
        totalActive: 120,
      };
      const updatedCase = { ...reportCase, ...updateDto };

      mockReportCaseService.update.mockResolvedValue(updatedCase);

      const result = await controller.update(reportCase.id, updateDto);

      expect(service.update).toHaveBeenCalledWith(reportCase.id, updateDto);
      expect(result).toEqual(updatedCase);
    });
  });

  describe('delete', () => {
    it('should delete a report case by id', async () => {
      const deleteResponse = { message: `Report case with id ${reportCase.id} successfully deleted.` };
      mockReportCaseService.delete.mockResolvedValue(deleteResponse);

      const result = await controller.delete(reportCase.id);

      expect(service.delete).toHaveBeenCalledWith(reportCase.id);
      expect(result).toEqual(deleteResponse);
    });
  });

  describe('getFilteredReportCases', () => {
    it('should retrieve filtered report cases with filter and count', async () => {
      const filter = 'totalConfirmed>50';
      const count = "10";
      const parsedCount = 10;
      const filteredCases = [reportCase];
      
      mockReportCaseService.getFilteredReportCases.mockResolvedValue(filteredCases);

      const result = await controller.getFilteredReportCases(filter, count);

      expect(service.getFilteredReportCases).toHaveBeenCalledWith(filter, parsedCount);
      expect(result).toEqual(filteredCases);
    });

    it('should retrieve filtered report cases with only filter', async () => {
      const filter = 'totalDeath<10';
      const filteredCases = [reportCase];
      
      mockReportCaseService.getFilteredReportCases.mockResolvedValue(filteredCases);

      const result = await controller.getFilteredReportCases(filter);

      expect(service.getFilteredReportCases).toHaveBeenCalledWith(filter, undefined);
      expect(result).toEqual(filteredCases);
    });
  });

  describe('getAll', () => {
    it('should retrieve all report cases with count', async () => {
      const count = "5";
      const parsedCount = 5;
      const cases = [reportCase];
      
      mockReportCaseService.getAll.mockResolvedValue(cases);

      const result = await controller.getAll(count);

      expect(service.getAll).toHaveBeenCalledWith(parsedCount);
      expect(result).toEqual(cases);
    });

    it('should retrieve all report cases without count', async () => {
      const cases = [reportCase];
      
      mockReportCaseService.getAll.mockResolvedValue(cases);

      const result = await controller.getAll();

      expect(service.getAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(cases);
    });
  });

  describe('getById', () => {
    it('should retrieve a report case by id', async () => {
      mockReportCaseService.getById.mockResolvedValue(reportCase);

      const result = await controller.getById(reportCase.id);

      expect(service.getById).toHaveBeenCalledWith(reportCase.id);
      expect(result).toEqual(reportCase);
    });
  });
});
