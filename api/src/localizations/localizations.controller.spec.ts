import { Test, TestingModule } from '@nestjs/testing';
import { LocalizationController } from './localizations.controller';
import { LocalizationService } from './localizations.service';
import { RolesGuard } from '../auth/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('LocalizationController', () => {
    let controller: LocalizationController;
    let service: LocalizationService;

    const mockLocalizationService = {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        getById: jest.fn(),
        getAll: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LocalizationController],
            providers: [
                { provide: LocalizationService, useValue: mockLocalizationService },
                { provide: JwtService, useValue: {} },
            ],
        })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: jest.fn(() => true) }) // Mock RolesGuard to always allow access
            .compile();

        controller = module.get<LocalizationController>(LocalizationController);
        service = module.get<LocalizationService>(LocalizationService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a localization', async () => {
        const dto = { country: 'France', continent: 'Europe' };
        mockLocalizationService.create.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.create(dto);
        expect(result).toEqual({ id: 1, ...dto });
        expect(mockLocalizationService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException when creating a localization with invalid data', async () => {
        const dto = { country: '', continent: '' };
        mockLocalizationService.create.mockRejectedValue(new BadRequestException('Invalid data.'));

        await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
        expect(mockLocalizationService.create).toHaveBeenCalledWith(dto);
    });

    it('should update a localization', async () => {
        const dto = { country: 'Germany' };
        mockLocalizationService.update.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.update(1, dto);
        expect(result).toEqual({ id: 1, ...dto });
        expect(mockLocalizationService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw BadRequestException when updating a localization with invalid data', async () => {
        const dto = { country: '' };
        mockLocalizationService.update.mockRejectedValue(new BadRequestException('Invalid data.'));

        await expect(controller.update(1, dto)).rejects.toThrow(BadRequestException);
        expect(mockLocalizationService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw NotFoundException when updating a non-existent localization', async () => {
        const dto = { country: 'Germany' };
        mockLocalizationService.update.mockRejectedValue(new NotFoundException('Localization not found.'));

        await expect(controller.update(999, dto)).rejects.toThrow(NotFoundException);
        expect(mockLocalizationService.update).toHaveBeenCalledWith(999, dto);
    });

    it('should delete a localization', async () => {
        mockLocalizationService.delete.mockResolvedValue({ message: 'Localization deleted successfully' });

        const result = await controller.delete(1);
        expect(result).toEqual({ message: 'Localization deleted successfully' });
        expect(mockLocalizationService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when deleting a non-existent localization', async () => {
        mockLocalizationService.delete.mockRejectedValue(new NotFoundException('Localization not found.'));

        await expect(controller.delete(999)).rejects.toThrow(NotFoundException);
        expect(mockLocalizationService.delete).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when deleting a localization with invalid ID', async () => {
        mockLocalizationService.delete.mockRejectedValue(new BadRequestException('Invalid id.'));

        await expect(controller.delete(-1)).rejects.toThrow(BadRequestException);
        expect(mockLocalizationService.delete).toHaveBeenCalledWith(-1);
    });

    it('should retrieve a localization by ID', async () => {
        const localization = { id: 1, country: 'France', continent: 'Europe' };
        mockLocalizationService.getById.mockResolvedValue(localization);

        const result = await controller.getById(1);
        expect(result).toEqual(localization);
        expect(mockLocalizationService.getById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when retrieving a non-existent localization by ID', async () => {
        mockLocalizationService.getById.mockRejectedValue(new NotFoundException('Localization not found.'));

        await expect(controller.getById(999)).rejects.toThrow(NotFoundException);
        expect(mockLocalizationService.getById).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when retrieving a localization with invalid ID', async () => {
        mockLocalizationService.getById.mockRejectedValue(new BadRequestException('Invalid id.'));

        await expect(controller.getById(-1)).rejects.toThrow(BadRequestException);
        expect(mockLocalizationService.getById).toHaveBeenCalledWith(-1);
    });

    it('should retrieve all localizations', async () => {
        const localizations = [
            { id: 1, country: 'France', continent: 'Europe' },
            { id: 2, country: 'Germany', continent: 'Europe' },
        ];
        mockLocalizationService.getAll.mockResolvedValue(localizations);

        const result = await controller.getAll();
        expect(result).toEqual(localizations);
        expect(mockLocalizationService.getAll).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
        mockLocalizationService.create.mockRejectedValue(new InternalServerErrorException('Unexpected error.'));

        const dto = { country: 'France', continent: 'Europe' };
        await expect(controller.create(dto)).rejects.toThrow(InternalServerErrorException);
        expect(mockLocalizationService.create).toHaveBeenCalledWith(dto);
    });
});
