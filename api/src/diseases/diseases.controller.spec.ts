import { Test, TestingModule } from '@nestjs/testing';
import { DiseasesController } from './diseases.controller';
import { DiseasesService } from './diseases.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Disease } from './disease.entity';
import { Repository } from 'typeorm';
import { CreateDiseaseDto } from './dto/CreateDiseaseDto.dto';
import { UpdateDiseaseDto } from './dto/UpdateDiseaseDto.dto';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

describe('DiseasesController', () => {
  let controller: DiseasesController;
  let service: DiseasesService;
  let repo: Repository<Disease>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiseasesController],
      providers: [
        DiseasesService,
        RolesGuard,
        Reflector,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn().mockReturnValue({ role: 'admin' }),
          },
        },
        {
          provide: getRepositoryToken(Disease),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DiseasesController>(DiseasesController);
    service = module.get<DiseasesService>(DiseasesService);
    repo = module.get<Repository<Disease>>(getRepositoryToken(Disease));
  });

  describe('create', () => {
    it('should create a disease', async () => {
      const dto: CreateDiseaseDto = { name: 'Covid19' };
      jest.spyOn(service, 'create').mockResolvedValue(dto as any);

      expect(await controller.create(dto)).toEqual(dto);
    });

    it('should throw BadRequestException if DTO is invalid', async () => {
      const dto: CreateDiseaseDto = { name: '' };
      jest.spyOn(service, 'create').mockImplementation(() => {
        throw new BadRequestException();
      });

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if service fails', async () => {
      const dto: CreateDiseaseDto = { name: 'Covid19' };
      jest.spyOn(service, 'create').mockImplementation(() => {
        throw new InternalServerErrorException();
      });

      await expect(controller.create(dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update a disease', async () => {
      const dto: UpdateDiseaseDto = { name: 'UpdatedName' };
      const id = 1;
      jest.spyOn(service, 'update').mockResolvedValue(dto as any);

      expect(await controller.update(id, dto)).toEqual(dto);
    });

    it('should throw NotFoundException if disease not found', async () => {
      const dto: UpdateDiseaseDto = { name: 'UpdatedName' };
      const id = 1;
      jest.spyOn(service, 'update').mockImplementation(() => {
        throw new NotFoundException();
      });

      await expect(controller.update(id, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if id is invalid', async () => {
      const dto: UpdateDiseaseDto = { name: 'UpdatedName' };
      const id = -1;
      jest.spyOn(service, 'update').mockImplementation(() => {
        throw new BadRequestException();
      });

      await expect(controller.update(id, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if service fails', async () => {
      const dto: UpdateDiseaseDto = { name: 'UpdatedName' };
      const id = 1;
      jest.spyOn(service, 'update').mockImplementation(() => {
        throw new InternalServerErrorException();
      });

      await expect(controller.update(id, dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete a disease', async () => {
      const id = 1;
      jest.spyOn(service, 'delete').mockResolvedValue({ message: `Disease with id ${id} successfully deleted.` });

      expect(await controller.delete(id)).toEqual({ message: `Disease with id ${id} successfully deleted.` });
    });

    it('should throw NotFoundException if disease not found', async () => {
      const id = 1;
      jest.spyOn(service, 'delete').mockImplementation(() => {
        throw new NotFoundException();
      });

      await expect(controller.delete(id)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if id is invalid', async () => {
      const id = -1;
      jest.spyOn(service, 'delete').mockImplementation(() => {
        throw new BadRequestException();
      });

      await expect(controller.delete(id)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if service fails', async () => {
      const id = 1;
      jest.spyOn(service, 'delete').mockImplementation(() => {
        throw new InternalServerErrorException();
      });

      await expect(controller.delete(id)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getById', () => {
    it('should return a disease by id', async () => {
      const id = 1;
      const disease = { id, name: 'Covid19' };
      jest.spyOn(service, 'getById').mockResolvedValue(disease as any);

      expect(await controller.getById(id)).toEqual(disease);
    });

    it('should throw NotFoundException if disease not found', async () => {
      const id = 1;
      jest.spyOn(service, 'getById').mockImplementation(() => {
        throw new NotFoundException();
      });

      await expect(controller.getById(id)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if id is invalid', async () => {
      const id = -1;
      jest.spyOn(service, 'getById').mockImplementation(() => {
        throw new BadRequestException();
      });

      await expect(controller.getById(id)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if service fails', async () => {
      const id = 1;
      jest.spyOn(service, 'getById').mockImplementation(() => {
        throw new InternalServerErrorException();
      });

      await expect(controller.getById(id)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getByName', () => {
    it('should return a disease by name', async () => {
      const name = 'Covid19';
      const disease = { id: 1, name };
      jest.spyOn(service, 'getByName').mockResolvedValue(disease as any);

      expect(await controller.getByName(name)).toEqual(disease);
    });

    it('should throw NotFoundException if disease not found', async () => {
      const name = 'Unknown';
      jest.spyOn(service, 'getByName').mockImplementation(() => {
        throw new NotFoundException();
      });

      await expect(controller.getByName(name)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if name is invalid', async () => {
      const name = '';
      jest.spyOn(service, 'getByName').mockImplementation(() => {
        throw new BadRequestException();
      });

      await expect(controller.getByName(name)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if service fails', async () => {
      const name = 'Covid19';
      jest.spyOn(service, 'getByName').mockImplementation(() => {
        throw new InternalServerErrorException();
      });

      await expect(controller.getByName(name)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getAll', () => {
    it('should return all diseases', async () => {
      const diseases = [{ id: 1, name: 'Covid19' }];
      jest.spyOn(service, 'getAll').mockResolvedValue(diseases as any);

      expect(await controller.getAll()).toEqual(diseases);
    });

    it('should throw InternalServerErrorException if service fails', async () => {
      jest.spyOn(service, 'getAll').mockImplementation(() => {
        throw new InternalServerErrorException();
      });

      await expect(controller.getAll()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
