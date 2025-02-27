import { Test, TestingModule } from '@nestjs/testing';
import { ReportCaseController } from './reportCases.controller';
import { ReportCaseService } from './reportCases.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportCase } from './reportCases.entity';
import { Repository } from 'typeorm';
import { CreateReportCaseDto } from './dto/CreateReportCase.dto';
import { UpdateReportCaseDto } from './dto/UpdateReportCase.dto';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

describe('ReportCaseController', () => {
    let controller: ReportCaseController;
    let service: ReportCaseService;
    let repo: Repository<ReportCase>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReportCaseController],
            providers: [
                ReportCaseService,
                RolesGuard,
                Reflector,
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn().mockReturnValue({ role: 'admin' }),
                    },
                },
                {
                    provide: getRepositoryToken(ReportCase),
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

        controller = module.get<ReportCaseController>(ReportCaseController);
        service = module.get<ReportCaseService>(ReportCaseService);
        repo = module.get<Repository<ReportCase>>(getRepositoryToken(ReportCase));
    });

    describe('create', () => {
        it('should create a report case', async () => {
            const dto: CreateReportCaseDto = {
                totalConfirmed: 100,
                totalDeath: 10,
                totalActive: 90,
                localizationId: 1,
                diseaseId: 1,
                date: Date.now(),
            };
            jest.spyOn(service, 'create').mockResolvedValue(dto as any);

            expect(await controller.create(dto)).toEqual(dto);
        });

        it('should throw BadRequestException if DTO is invalid', async () => {
            const dto: CreateReportCaseDto = {
                totalConfirmed: 0,
                totalDeath: 0,
                totalActive: 0,
                localizationId: 0,
                diseaseId: 0,
                date: 0,
            };
            jest.spyOn(service, 'create').mockImplementation(() => {
                throw new BadRequestException();
            });

            await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
        });

        it('should throw InternalServerErrorException if service fails', async () => {
            const dto: CreateReportCaseDto = {
                totalConfirmed: 100,
                totalDeath: 10,
                totalActive: 90,
                localizationId: 1,
                diseaseId: 1,
                date: Date.now(),
            };
            jest.spyOn(service, 'create').mockImplementation(() => {
                throw new InternalServerErrorException();
            });

            await expect(controller.create(dto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('update', () => {
        it('should update a report case', async () => {
            const dto: UpdateReportCaseDto = { totalConfirmed: 200 };
            const id = 1;
            jest.spyOn(service, 'update').mockResolvedValue(dto as any);

            expect(await controller.update(id, dto)).toEqual(dto);
        });

        it('should throw NotFoundException if report case not found', async () => {
            const dto: UpdateReportCaseDto = { totalConfirmed: 200 };
            const id = 1;
            jest.spyOn(service, 'update').mockImplementation(() => {
                throw new NotFoundException();
            });

            await expect(controller.update(id, dto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if id is invalid', async () => {
            const dto: UpdateReportCaseDto = { totalConfirmed: 200 };
            const id = -1;
            jest.spyOn(service, 'update').mockImplementation(() => {
                throw new BadRequestException();
            });

            await expect(controller.update(id, dto)).rejects.toThrow(BadRequestException);
        });

        it('should throw InternalServerErrorException if service fails', async () => {
            const dto: UpdateReportCaseDto = { totalConfirmed: 200 };
            const id = 1;
            jest.spyOn(service, 'update').mockImplementation(() => {
                throw new InternalServerErrorException();
            });

            await expect(controller.update(id, dto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('delete', () => {
        it('should delete a report case', async () => {
            const id = 1;
            jest.spyOn(service, 'delete').mockResolvedValue({ message: `Report Case with id ${id} successfully deleted.` });

            expect(await controller.delete(id)).toEqual({ message: `Report Case with id ${id} successfully deleted.` });
        });

        it('should throw NotFoundException if report case not found', async () => {
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
        it('should return a report case by id', async () => {
            const id = 1;
            const reportCase = { id, totalConfirmed: 100, totalDeath: 10, totalActive: 90, localizationId: 1, diseaseId: 1, date: new Date() };
            jest.spyOn(service, 'getById').mockResolvedValue(reportCase as any);

            expect(await controller.getById(id)).toEqual(reportCase);
        });

        it('should throw NotFoundException if report case not found', async () => {
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
        it('should return all report cases', async () => {
            const reportCases = [{ id: 1, totalConfirmed: 100, totalDeath: 10, totalActive: 90, localizationId: 1, diseaseId: 1, date: new Date() }];
            jest.spyOn(service, 'getAll').mockResolvedValue(reportCases as any);

            expect(await controller.getAll()).toEqual(reportCases);
        });

        it('should throw InternalServerErrorException if service fails', async () => {
            jest.spyOn(service, 'getAll').mockImplementation(() => {
                throw new InternalServerErrorException();
            });

            await expect(controller.getAll()).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('getFilteredReportCases', () => {
        it('should return filtered report cases', async () => {
            const filter = 'totalConfirmed>50';
            const count = 10;
            const reportCases = [{ id: 1, totalConfirmed: 100, totalDeath: 10, totalActive: 90, localizationId: 1, diseaseId: 1, date: new Date() }];
            jest.spyOn(service, 'getFilteredReportCases').mockResolvedValue(reportCases as any);

            expect(await controller.getFilteredReportCases(filter, count.toString())).toEqual(reportCases);
        });

        it('should throw InternalServerErrorException if service fails', async () => {
            const filter = 'totalConfirmed>50';
            const count = 10;
            jest.spyOn(service, 'getFilteredReportCases').mockImplementation(() => {
                throw new InternalServerErrorException();
            });

            await expect(controller.getFilteredReportCases(filter, count.toString())).rejects.toThrow(InternalServerErrorException);
        });
    });
});
