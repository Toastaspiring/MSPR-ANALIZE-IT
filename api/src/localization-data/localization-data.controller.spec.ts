import { Test, TestingModule } from '@nestjs/testing';
import { LocalizationDataController } from './localization-data.controller';
import { LocalizationDataService } from './localization-data.service';
import { RolesGuard } from '../auth/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('LocalizationDataController', () => {
    let controller: LocalizationDataController;
    let service: LocalizationDataService;

    const mockLocalizationDataService = {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        getById: jest.fn(),
        getAll: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LocalizationDataController],
            providers: [
                { provide: LocalizationDataService, useValue: mockLocalizationDataService },
                { provide: JwtService, useValue: {} },
            ],
        })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: jest.fn(() => true) }) // Mock RolesGuard to always allow access
            .compile();

        controller = module.get<LocalizationDataController>(LocalizationDataController);
        service = module.get<LocalizationDataService>(LocalizationDataService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create localization data', async () => {
        const dto = { localizationId: 1, inhabitantsNumber: 1000000, vaccinationRate: 75 };
        mockLocalizationDataService.create.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.create(dto);
        expect(result).toEqual({ id: 1, ...dto });
        expect(mockLocalizationDataService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException when creating localization data with invalid data', async () => {
        const dto = { localizationId: -1, inhabitantsNumber: 1000000, vaccinationRate: 75 };
        mockLocalizationDataService.create.mockRejectedValue(new BadRequestException('Invalid data.'));

        await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
        expect(mockLocalizationDataService.create).toHaveBeenCalledWith(dto);
    });

    it('should update localization data', async () => {
        const dto = { inhabitantsNumber: 2000000 };
        mockLocalizationDataService.update.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.update(1, dto);
        expect(result).toEqual({ id: 1, ...dto });
        expect(mockLocalizationDataService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw BadRequestException when updating localization data with invalid data', async () => {
        const dto = { inhabitantsNumber: -1 };
        mockLocalizationDataService.update.mockRejectedValue(new BadRequestException('Invalid data.'));

        await expect(controller.update(1, dto)).rejects.toThrow(BadRequestException);
        expect(mockLocalizationDataService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw NotFoundException when updating non-existent localization data', async () => {
        const dto = { inhabitantsNumber: 2000000 };
        mockLocalizationDataService.update.mockRejectedValue(new NotFoundException('Localization data not found.'));

        await expect(controller.update(999, dto)).rejects.toThrow(NotFoundException);
        expect(mockLocalizationDataService.update).toHaveBeenCalledWith(999, dto);
    });

    it('should delete localization data', async () => {
        mockLocalizationDataService.delete.mockResolvedValue({ message: 'Localization data deleted successfully' });

        const result = await controller.delete(1);
        expect(result).toEqual({ message: 'Localization data deleted successfully' });
        expect(mockLocalizationDataService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when deleting non-existent localization data', async () => {
        mockLocalizationDataService.delete.mockRejectedValue(new NotFoundException('Localization data not found.'));

        await expect(controller.delete(999)).rejects.toThrow(NotFoundException);
        expect(mockLocalizationDataService.delete).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when deleting localization data with invalid ID', async () => {
        mockLocalizationDataService.delete.mockRejectedValue(new BadRequestException('Invalid id.'));

        await expect(controller.delete(-1)).rejects.toThrow(BadRequestException);
        expect(mockLocalizationDataService.delete).toHaveBeenCalledWith(-1);
    });

    it('should retrieve localization data by ID', async () => {
        const localizationData = { id: 1, localizationId: 1, inhabitantsNumber: 1000000, vaccinationRate: 75 };
        mockLocalizationDataService.getById.mockResolvedValue(localizationData);

        const result = await controller.getById(1);
        expect(result).toEqual(localizationData);
        expect(mockLocalizationDataService.getById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when retrieving non-existent localization data by ID', async () => {
        mockLocalizationDataService.getById.mockRejectedValue(new NotFoundException('Localization data not found.'));

        await expect(controller.getById(999)).rejects.toThrow(NotFoundException);
        expect(mockLocalizationDataService.getById).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when retrieving localization data with invalid ID', async () => {
        mockLocalizationDataService.getById.mockRejectedValue(new BadRequestException('Invalid id.'));

        await expect(controller.getById(-1)).rejects.toThrow(BadRequestException);
        expect(mockLocalizationDataService.getById).toHaveBeenCalledWith(-1);
    });

    it('should retrieve all localization data', async () => {
        const localizationDataList = [
            { id: 1, localizationId: 1, inhabitantsNumber: 1000000, vaccinationRate: 75 },
            { id: 2, localizationId: 2, inhabitantsNumber: 500000, vaccinationRate: 60 },
        ];
        mockLocalizationDataService.getAll.mockResolvedValue(localizationDataList);

        const result = await controller.getAll();
        expect(result).toEqual(localizationDataList);
        expect(mockLocalizationDataService.getAll).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
        mockLocalizationDataService.create.mockRejectedValue(new InternalServerErrorException('Unexpected error.'));

        const dto = { localizationId: 1, inhabitantsNumber: 1000000, vaccinationRate: 75 };
        await expect(controller.create(dto)).rejects.toThrow(InternalServerErrorException);
        expect(mockLocalizationDataService.create).toHaveBeenCalledWith(dto);
    });
});
