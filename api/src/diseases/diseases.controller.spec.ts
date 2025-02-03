import { Test, TestingModule } from '@nestjs/testing';
import { DiseasesController } from './diseases.controller';
import { DiseasesService } from './diseases.service';
import { CreateDiseaseDto } from './dto/CreateDiseaseDto.dto';
import { UpdateDiseaseDto } from './dto/UpdateDiseaseDto.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// TODO : tester les codes d'erreur

describe('DiseasesController', () => {
  let controller: DiseasesController;
  let service: DiseasesService;
  const disease = {
    id: 1,
    name: "Covid19"
  }

  const mockDiseasesService = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getById: jest.fn(),
    getByName: jest.fn(),
    getAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiseasesController],
      providers: [
        {
          provide: DiseasesService,
          useValue: mockDiseasesService,
        },
      ],
    }).compile();

    controller = module.get<DiseasesController>(DiseasesController);
    service = module.get<DiseasesService>(DiseasesService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('should return a bad request error', async () => { 
      // TODO
    })
    
    it('should create a new disease', async () => {
      const createDto: CreateDiseaseDto = { name: disease.name};
      const createdDisease = { id: disease.id, ...createDto };

      mockDiseasesService.create.mockResolvedValue(createdDisease);

      const result = await controller.create(createDto);
      expect(result).toEqual(createdDisease);
    });
  });

  describe('update', () => {
    it('should return a bad request error', async () => { 
      // TODO
    })

    it('should return a not found error', async () => { 
      // TODO
    })

    it('should call DiseasesService.update and return the updated disease', async () => {
      const updateDto: UpdateDiseaseDto = { name: 'Covid20' };
      const updatedDisease = { id: disease.id, ...updateDto };

      mockDiseasesService.update.mockResolvedValue(updatedDisease);

      const result = await controller.update(disease.id, updateDto);

      expect(service.update).toHaveBeenCalledWith(disease.id, updateDto);
      expect(result).toEqual(updatedDisease);
    });
  });

  describe('delete', () => {
    it('should return a bad request error', async () => { 
      // TODO
    })

    it('should return a not found error', async () => { 
      // TODO
    })

    it('should call DiseasesService.delete and return the delete message', async () => {
      const deleteResponse = { message: `Disease with id ${disease.id} successfully deleted.` };
      mockDiseasesService.delete.mockResolvedValue(deleteResponse);

      const result = await controller.delete(disease.id);

      expect(service.delete).toHaveBeenCalledWith(disease.id);
      expect(result).toEqual(deleteResponse);
    });
  });

  describe('getById', () => {
    it('should return a bad request error', async () => { 
      // TODO
    })

    it('should call DiseasesService.getById and return the disease', async () => {
      mockDiseasesService.getById.mockResolvedValue(disease);

      const result = await controller.getById(disease.id);

      expect(service.getById).toHaveBeenCalledWith(disease.id);
      expect(result).toEqual(disease);
    });
  });

  describe('getByName', () => {
    it('should return a bad request error', async () => { 
      // TODO
    })

    it('should call DiseasesService.getByName and return the disease', async () => {
      mockDiseasesService.getByName.mockResolvedValue(disease);

      const result = await controller.getByName(disease.name);

      expect(service.getByName).toHaveBeenCalledWith(disease.name);
      expect(result).toEqual(disease);
    });
  });

  describe('getAll', () => {
    it('should call DiseasesService.getAll and return an array of diseases', async () => {
      const diseases = [
        { id: 1, name: 'Grippe', symptoms: 'Fièvre, toux' },
        { id: 2, name: 'Covid-19', symptoms: 'Toux, perte du goût' },
      ];

      mockDiseasesService.getAll.mockResolvedValue(diseases);

      const result = await controller.getAll();

      expect(service.getAll).toHaveBeenCalled();
      expect(result).toEqual(diseases);
    });
  });
});
