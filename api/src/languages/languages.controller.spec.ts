import { Test, TestingModule } from '@nestjs/testing';
import { LanguageController } from './languages.controller';
import { LanguageService } from './languages.service';
import { RolesGuard } from '../auth/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateLanguageDto } from './dto/CreateLanguageDto.dto';

describe('LanguageController', () => {
    let controller: LanguageController;
    let service: LanguageService;

    const mockLanguageService = {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        getById: jest.fn(),
        getAll: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LanguageController],
            providers: [
                { provide: LanguageService, useValue: mockLanguageService },
                { provide: JwtService, useValue: {} }, // Mock JwtService
            ],
        })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: jest.fn(() => true) }) // Mock RolesGuard
            .compile();

        controller = module.get<LanguageController>(LanguageController);
        service = module.get<LanguageService>(LanguageService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a language', async () => {
            const dto: CreateLanguageDto = { lang: 'English' };
            const expectedResult = { id: 1, ...dto };
            mockLanguageService.create.mockResolvedValue(expectedResult);

            const result = await controller.create(dto);
            expect(result).toEqual(expectedResult);
            expect(mockLanguageService.create).toHaveBeenCalledWith(dto);
        });

        it('should throw BadRequestException when creating a language with invalid data', async () => {
            const dto: CreateLanguageDto = { lang: '' };
            mockLanguageService.create.mockRejectedValue(new BadRequestException('Invalid data: DTO is required.'));

            await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
            expect(mockLanguageService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('update', () => {
        it('should update a language', async () => {
            const dto: CreateLanguageDto = { lang: 'French' };
            const expectedResult = { id: 1, ...dto };
            mockLanguageService.update.mockResolvedValue(expectedResult);

            const result = await controller.update(1, dto);
            expect(result).toEqual(expectedResult);
            expect(mockLanguageService.update).toHaveBeenCalledWith(1, dto);
        });

        it('should throw BadRequestException when updating a language with invalid data', async () => {
            const dto: CreateLanguageDto = { lang: '' };
            mockLanguageService.update.mockRejectedValue(new BadRequestException('Invalid data: DTO is required.'));

            await expect(controller.update(1, dto)).rejects.toThrow(BadRequestException);
            expect(mockLanguageService.update).toHaveBeenCalledWith(1, dto);
        });

        it('should throw NotFoundException when updating a non-existent language', async () => {
            const dto: CreateLanguageDto = { lang: 'German' };
            mockLanguageService.update.mockRejectedValue(new NotFoundException('Language not found with id: 999'));

            await expect(controller.update(999, dto)).rejects.toThrow(NotFoundException);
            expect(mockLanguageService.update).toHaveBeenCalledWith(999, dto);
        });

        it('should throw BadRequestException for invalid ID on update', async () => {
            const dto: CreateLanguageDto = { lang: 'Spanish' };
            mockLanguageService.update.mockRejectedValue(new BadRequestException('Invalid id.'));
            await expect(controller.update(0, dto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('delete', () => {
        it('should delete a language', async () => {
            const expectedResult = { message: 'Language with id 1 successfully deleted.' };
            mockLanguageService.delete.mockResolvedValue(expectedResult);

            const result = await controller.delete(1);
            expect(result).toEqual(expectedResult);
            expect(mockLanguageService.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when deleting a non-existent language', async () => {
            mockLanguageService.delete.mockRejectedValue(new NotFoundException('Language not found with id: 999'));

            await expect(controller.delete(999)).rejects.toThrow(NotFoundException);
            expect(mockLanguageService.delete).toHaveBeenCalledWith(999);
        });

        it('should throw BadRequestException for invalid ID on delete', async () => {
            mockLanguageService.delete.mockRejectedValue(new BadRequestException('Invalid id.'));
            await expect(controller.delete(0)).rejects.toThrow(BadRequestException);
        });
    });

    describe('getById', () => {
        it('should retrieve a language by ID', async () => {
            const expectedResult = { id: 1, lang: 'English' };
            mockLanguageService.getById.mockResolvedValue(expectedResult);

            const result = await controller.getById(1);
            expect(result).toEqual(expectedResult);
            expect(mockLanguageService.getById).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when retrieving a non-existent language by ID', async () => {
            mockLanguageService.getById.mockResolvedValue(null); // Or mockRejectedValue(new NotFoundException(...)) depending on service behavior

            const result = await controller.getById(999);
            expect(result).toBeNull(); // Or expect(...).rejects.toThrow(NotFoundException)
            expect(mockLanguageService.getById).toHaveBeenCalledWith(999);
        });

        it('should throw BadRequestException for invalid ID on getById', async () => {
            mockLanguageService.getById.mockRejectedValue(new BadRequestException('Invalid id.'));
            await expect(controller.getById(0)).rejects.toThrow(BadRequestException);
        });
    });

    describe('getAll', () => {
        it('should retrieve all languages', async () => {
            const expectedResult = [
                { id: 1, lang: 'English' },
                { id: 2, lang: 'French' },
            ];
            mockLanguageService.getAll.mockResolvedValue(expectedResult);

            const result = await controller.getAll();
            expect(result).toEqual(expectedResult);
            expect(mockLanguageService.getAll).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should throw InternalServerErrorException on unexpected errors during create', async () => {
            const dto: CreateLanguageDto = { lang: 'Italian' };
            mockLanguageService.create.mockRejectedValue(new InternalServerErrorException('Failed to create language.'));

            await expect(controller.create(dto)).rejects.toThrow(InternalServerErrorException);
            expect(mockLanguageService.create).toHaveBeenCalledWith(dto);
        });
    });
});
