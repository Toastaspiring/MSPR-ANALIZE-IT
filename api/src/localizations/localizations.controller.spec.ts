import { Test, TestingModule } from '@nestjs/testing';
import { LocalizationController } from './localizations.controller';
import { LocalizationService } from './localizations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Localization } from './localization.entity';
import { Repository } from 'typeorm';
import { CreateLocalizationDto } from './dto/CreateLocalizationDto.dto';
import { UpdateLocalizationDto } from './dto/UpdateLocalizationDto.dto';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

describe('LocalizationController', () => {
    let controller: LocalizationController;
    let service: LocalizationService;
    let repo: Repository<Localization>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LocalizationController],
            providers: [
                LocalizationService,
                RolesGuard,
                Reflector,
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn().mockReturnValue({ role: 'admin' }),
                    },
                },
                {
                    provide: getRepositoryToken(Localization),
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

        controller = module.get<LocalizationController>(LocalizationController);
        service = module.get<LocalizationService>(LocalizationService);
        repo = module.get<Repository<Localization>>(getRepositoryToken(Localization));
    });

    describe('create', () => {
        it('should create a localization', async () => {
            const dto: CreateLocalizationDto = { country: 'France', continent: 'Europe' };
            jest.spyOn(service, 'create').mockResolvedValue(dto as any);

            expect(await controller.create(dto)).toEqual(dto);
        });

        it('should throw BadRequestException if DTO is invalid', async () => {
            const dto: CreateLocalizationDto = { country: '', continent: '' };
            jest.spyOn(service, 'create').mockImplementation(() => {
                throw new BadRequestException();
            });

            await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
        });

        it('should throw InternalServerErrorException if service fails', async () => {
            const dto: CreateLocalizationDto = { country: 'France', continent: 'Europe' };
            jest.spyOn(service, 'create').mockImplementation(() => {
                throw new InternalServerErrorException();
            });

            await expect(controller.create(dto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('update', () => {
        it('should update a localization', async () => {
            const dto: UpdateLocalizationDto = { country: 'Germany' };
            const id = 1;
            jest.spyOn(service, 'update').mockResolvedValue(dto as any);

            expect(await controller.update(id, dto)).toEqual(dto);
        });

        it('should throw NotFoundException if localization not found', async () => {
            const dto: UpdateLocalizationDto = { country: 'Germany' };
            const id = 1;
            jest.spyOn(service, 'update').mockImplementation(() => {
                throw new NotFoundException();
            });

            await expect(controller.update(id, dto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if id is invalid', async () => {
            const dto: UpdateLocalizationDto = { country: 'Germany' };
            const id = -1;
            jest.spyOn(service, 'update').mockImplementation(() => {
                throw new BadRequestException();
            });

            await expect(controller.update(id, dto)).rejects.toThrow(BadRequestException);
        });

        it('should throw InternalServerErrorException if service fails', async () => {
            const dto: UpdateLocalizationDto = { country: 'Germany' };
            const id = 1;
            jest.spyOn(service, 'update').mockImplementation(() => {
                throw new InternalServerErrorException();
            });

            await expect(controller.update(id, dto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('delete', () => {
        it('should delete a localization', async () => {
            const id = 1;
            jest.spyOn(service, 'delete').mockResolvedValue({ message: `Localization with id ${id} successfully deleted.` });

            expect(await controller.delete(id)).toEqual({ message: `Localization with id ${id} successfully deleted.` });
        });

        it('should throw NotFoundException if localization not found', async () => {
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
        it('should return a localization by id', async () => {
            const id = 1;
            const localization = { id, country: 'France', continent: 'Europe' };
            jest.spyOn(service, 'getById').mockResolvedValue(localization as any);

            expect(await controller.getById(id)).toEqual(localization);
        });

        it('should throw NotFoundException if localization not found', async () => {
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
        it('should return all localizations', async () => {
            const localizations = [{ id: 1, country: 'France', continent: 'Europe' }];
            jest.spyOn(service, 'getAll').mockResolvedValue(localizations as any);

            expect(await controller.getAll()).toEqual(localizations);
        });

        it('should throw InternalServerErrorException if service fails', async () => {
            jest.spyOn(service, 'getAll').mockImplementation(() => {
                throw new InternalServerErrorException();
            });

            await expect(controller.getAll()).rejects.toThrow(InternalServerErrorException);
        });
    });
});
