import { Test, TestingModule } from '@nestjs/testing';
import { LocalizationDataController } from './localization-data.controller';
import { LocalizationDataService } from './localization-data.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LocalizationData } from './localization-data.entity';
import { Repository } from 'typeorm';
import { CreateLocalizationDataDto } from './dto/CreateLocalizationDataDto.dto';
import { UpdateLocalizationDataDto } from './dto/UpdateLocalizationDataDto.dto';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

describe('LocalizationDataController', () => {
    let controller: LocalizationDataController;
    let service: LocalizationDataService;
    let repo: Repository<LocalizationData>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LocalizationDataController],
            providers: [
                LocalizationDataService,
                RolesGuard,
                Reflector,
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn().mockReturnValue({ role: 'admin' }),
                    },
                },
                {
                    provide: getRepositoryToken(LocalizationData),
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

        controller = module.get<LocalizationDataController>(LocalizationDataController);
        service = module.get<LocalizationDataService>(LocalizationDataService);
        repo = module.get<Repository<LocalizationData>>(getRepositoryToken(LocalizationData));
    });

    describe('create', () => {
        it('should create a localization data', async () => {
            const dto: CreateLocalizationDataDto = { localizationId: 1, inhabitantsNumber: 1000000, populationConcentration: 500, vaccinationRate: 75 };
            jest.spyOn(service, 'create').mockResolvedValue(dto as any);

            expect(await controller.create(dto)).toEqual(dto);
        });

        it('should throw BadRequestException if DTO is invalid', async () => {
            const dto: CreateLocalizationDataDto = { localizationId: 0, inhabitantsNumber: 0, populationConcentration: 0, vaccinationRate: 0 };
            jest.spyOn(service, 'create').mockImplementation(() => {
                throw new BadRequestException();
            });

            await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
        });

        it('should throw InternalServerErrorException if service fails', async () => {
            const dto: CreateLocalizationDataDto = { localizationId: 1, inhabitantsNumber: 1000000, populationConcentration: 500, vaccinationRate: 75 };
            jest.spyOn(service, 'create').mockImplementation(() => {
                throw new InternalServerErrorException();
            });

            await expect(controller.create(dto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('update', () => {
        it('should update a localization data', async () => {
            const dto: UpdateLocalizationDataDto = { inhabitantsNumber: 2000000 };
            const id = 1;
            jest.spyOn(service, 'update').mockResolvedValue(dto as any);

            expect(await controller.update(id, dto)).toEqual(dto);
        });

        it('should throw NotFoundException if localization data not found', async () => {
            const dto: UpdateLocalizationDataDto = { inhabitantsNumber: 2000000 };
            const id = 1;
            jest.spyOn(service, 'update').mockImplementation(() => {
                throw new NotFoundException();
            });

            await expect(controller.update(id, dto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if id is invalid', async () => {
            const dto: UpdateLocalizationDataDto = { inhabitantsNumber: 2000000 };
            const id = -1;
            jest.spyOn(service, 'update').mockImplementation(() => {
                throw new BadRequestException();
            });

            await expect(controller.update(id, dto)).rejects.toThrow(BadRequestException);
        });

        it('should throw InternalServerErrorException if service fails', async () => {
            const dto: UpdateLocalizationDataDto = { inhabitantsNumber: 2000000 };
            const id = 1;
            jest.spyOn(service, 'update').mockImplementation(() => {
                throw new InternalServerErrorException();
            });

            await expect(controller.update(id, dto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('delete', () => {
        it('should delete a localization data', async () => {
            const id = 1;
            jest.spyOn(service, 'delete').mockResolvedValue({ message: `Localization data with id ${id} successfully deleted.` });

            expect(await controller.delete(id)).toEqual({ message: `Localization data with id ${id} successfully deleted.` });
        });

        it('should throw NotFoundException if localization data not found', async () => {
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
        it('should return a localization data by id', async () => {
            const id = 1;
            const localizationData = { id, localizationId: 1, inhabitantsNumber: 1000000, populationConcentration: 500, vaccinationRate: 75 };
            jest.spyOn(service, 'getById').mockResolvedValue(localizationData as any);

            expect(await controller.getById(id)).toEqual(localizationData);
        });

        it('should throw NotFoundException if localization data not found', async () => {
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

    describe('getAll', () => {
        it('should return all localization data', async () => {
            const localizationData = [{ id: 1, localizationId: 1, inhabitantsNumber: 1000000, populationConcentration: 500, vaccinationRate: 75 }];
            jest.spyOn(service, 'getAll').mockResolvedValue(localizationData as any);

            expect(await controller.getAll()).toEqual(localizationData);
        });

        it('should throw InternalServerErrorException if service fails', async () => {
            jest.spyOn(service, 'getAll').mockImplementation(() => {
                throw new InternalServerErrorException();
            });

            await expect(controller.getAll()).rejects.toThrow(InternalServerErrorException);
        });
    });
});
