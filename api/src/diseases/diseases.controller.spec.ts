import { Test, TestingModule } from '@nestjs/testing';
import { DiseasesController } from './diseases.controller';
import { DiseasesService } from './diseases.service';
import { RolesGuard } from '../auth/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('DiseasesController', () => {
    let controller: DiseasesController;
    let service: DiseasesService;

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
                { provide: DiseasesService, useValue: mockDiseasesService },
                { provide: JwtService, useValue: {} },
            ],
        })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: jest.fn(() => true) }) // Mock RolesGuard to always allow access
            .compile();

        controller = module.get<DiseasesController>(DiseasesController);
        service = module.get<DiseasesService>(DiseasesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a disease', async () => {
        const dto = { name: 'Covid19' };
        mockDiseasesService.create.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.create(dto);
        expect(result).toEqual({ id: 1, ...dto });
        expect(mockDiseasesService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException when creating a disease with invalid data', async () => {
        const dto = { name: '' };
        mockDiseasesService.create.mockRejectedValue(new BadRequestException('Invalid data.'));

        await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
        expect(mockDiseasesService.create).toHaveBeenCalledWith(dto);
    });

    it('should update a disease', async () => {
        const dto = { name: 'UpdatedDisease' };
        mockDiseasesService.update.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.update(1, dto);
        expect(result).toEqual({ id: 1, ...dto });
        expect(mockDiseasesService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw BadRequestException when updating a disease with invalid data', async () => {
        const dto = { name: '' };
        mockDiseasesService.update.mockRejectedValue(new BadRequestException('Invalid data.'));

        await expect(controller.update(1, dto)).rejects.toThrow(BadRequestException);
        expect(mockDiseasesService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw NotFoundException when updating a non-existent disease', async () => {
        const dto = { name: 'NonExistentDisease' };
        mockDiseasesService.update.mockRejectedValue(new NotFoundException('Disease not found.'));

        await expect(controller.update(999, dto)).rejects.toThrow(NotFoundException);
        expect(mockDiseasesService.update).toHaveBeenCalledWith(999, dto);
    });

    it('should delete a disease', async () => {
        mockDiseasesService.delete.mockResolvedValue({ message: 'Disease deleted successfully' });

        const result = await controller.delete(1);
        expect(result).toEqual({ message: 'Disease deleted successfully' });
        expect(mockDiseasesService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when deleting a non-existent disease', async () => {
        mockDiseasesService.delete.mockRejectedValue(new NotFoundException('Disease not found.'));

        await expect(controller.delete(999)).rejects.toThrow(NotFoundException);
        expect(mockDiseasesService.delete).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when deleting a disease with invalid ID', async () => {
        mockDiseasesService.delete.mockRejectedValue(new BadRequestException('Invalid id.'));

        await expect(controller.delete(-1)).rejects.toThrow(BadRequestException);
        expect(mockDiseasesService.delete).toHaveBeenCalledWith(-1);
    });

    it('should retrieve a disease by ID', async () => {
        const disease = { id: 1, name: 'Covid19' };
        mockDiseasesService.getById.mockResolvedValue(disease);

        const result = await controller.getById(1);
        expect(result).toEqual(disease);
        expect(mockDiseasesService.getById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when retrieving a non-existent disease by ID', async () => {
        mockDiseasesService.getById.mockRejectedValue(new NotFoundException('Disease not found.'));

        await expect(controller.getById(999)).rejects.toThrow(NotFoundException);
        expect(mockDiseasesService.getById).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when retrieving a disease with invalid ID', async () => {
        mockDiseasesService.getById.mockRejectedValue(new BadRequestException('Invalid id.'));

        await expect(controller.getById(-1)).rejects.toThrow(BadRequestException);
        expect(mockDiseasesService.getById).toHaveBeenCalledWith(-1);
    });

    it('should retrieve a disease by name', async () => {
        const disease = { id: 1, name: 'Covid19' };
        mockDiseasesService.getByName.mockResolvedValue(disease);

        const result = await controller.getByName('Covid19');
        expect(result).toEqual(disease);
        expect(mockDiseasesService.getByName).toHaveBeenCalledWith('Covid19');
    });

    it('should throw NotFoundException when retrieving a non-existent disease by name', async () => {
        mockDiseasesService.getByName.mockRejectedValue(new NotFoundException('Disease not found.'));

        await expect(controller.getByName('NonExistentDisease')).rejects.toThrow(NotFoundException);
        expect(mockDiseasesService.getByName).toHaveBeenCalledWith('NonExistentDisease');
    });

    it('should throw BadRequestException when retrieving a disease with invalid name', async () => {
        mockDiseasesService.getByName.mockRejectedValue(new BadRequestException('Invalid name.'));

        await expect(controller.getByName('')).rejects.toThrow(BadRequestException);
        expect(mockDiseasesService.getByName).toHaveBeenCalledWith('');
    });

    it('should retrieve all diseases', async () => {
        const diseases = [
            { id: 1, name: 'Covid19' },
            { id: 2, name: 'Monkeypox' },
        ];
        mockDiseasesService.getAll.mockResolvedValue(diseases);

        const result = await controller.getAll();
        expect(result).toEqual(diseases);
        expect(mockDiseasesService.getAll).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
        mockDiseasesService.create.mockRejectedValue(new InternalServerErrorException('Unexpected error.'));

        const dto = { name: 'Covid19' };
        await expect(controller.create(dto)).rejects.toThrow(InternalServerErrorException);
        expect(mockDiseasesService.create).toHaveBeenCalledWith(dto);
    });
});
