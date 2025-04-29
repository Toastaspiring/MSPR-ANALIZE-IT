import { Test, TestingModule } from '@nestjs/testing';
import { ReportCaseController } from './reportCases.controller';
import { ReportCaseService } from './reportCases.service';
import { RolesGuard } from '../auth/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { FilterConditionGroupDto } from './dto/FilterConditionGroup.dto';

describe('ReportCaseController', () => {
    let controller: ReportCaseController;
    let service: ReportCaseService;

    const testFilter: FilterConditionGroupDto = {
        logicOperator: 'AND',
        conditions: [
            {
                logicOperator: 'AND',
                field: 'disease.name',
                comparisonOperator: '=',
                value: 'Monkeypox',
            },
            {
                logicOperator: 'OR',
                conditions: [
                    {
                        logicOperator: 'AND',
                        field: 'disease.name',
                        comparisonOperator: '=',
                        value: 'Coronavirus',
                    },
                    {
                        logicOperator: 'AND',
                        field: 'date',
                        comparisonOperator: '>=',
                        value: '2025-01-01',
                    },
                ],
            },
        ],
    };

    const mockReportCaseService = {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        getById: jest.fn(),
        getAll: jest.fn(),
        getFilteredReportCases: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReportCaseController],
            providers: [
                { provide: ReportCaseService, useValue: mockReportCaseService },
                { provide: JwtService, useValue: {} },
            ],
        })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: jest.fn(() => true) }) // Mock RolesGuard to always allow access
            .compile();

        controller = module.get<ReportCaseController>(ReportCaseController);
        service = module.get<ReportCaseService>(ReportCaseService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a report case', async () => {
        const dto = { totalConfirmed: 100, totalDeath: 10, totalActive: 90, localizationId: 1, diseaseId: 1, date: 1738405852298 };
        mockReportCaseService.create.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.create(dto);
        expect(result).toEqual({ id: 1, ...dto });
        expect(mockReportCaseService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException when creating a report case with invalid data', async () => {
        const dto = { totalConfirmed: -1, totalDeath: 10, totalActive: 90, localizationId: 1, diseaseId: 1, date: 1738405852298 };
        mockReportCaseService.create.mockRejectedValue(new BadRequestException('Invalid data.'));

        await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
        expect(mockReportCaseService.create).toHaveBeenCalledWith(dto);
    });

    it('should update a report case', async () => {
        const dto = { totalConfirmed: 200 };
        mockReportCaseService.update.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.update(1, dto);
        expect(result).toEqual({ id: 1, ...dto });
        expect(mockReportCaseService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw BadRequestException when updating a report case with invalid data', async () => {
        const dto = { totalConfirmed: -1 };
        mockReportCaseService.update.mockRejectedValue(new BadRequestException('Invalid data.'));

        await expect(controller.update(1, dto)).rejects.toThrow(BadRequestException);
        expect(mockReportCaseService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw NotFoundException when updating a non-existent report case', async () => {
        const dto = { totalConfirmed: 200 };
        mockReportCaseService.update.mockRejectedValue(new NotFoundException('Report case not found.'));

        await expect(controller.update(999, dto)).rejects.toThrow(NotFoundException);
        expect(mockReportCaseService.update).toHaveBeenCalledWith(999, dto);
    });

    it('should delete a report case', async () => {
        mockReportCaseService.delete.mockResolvedValue({ message: 'Report case deleted successfully' });

        const result = await controller.delete(1);
        expect(result).toEqual({ message: 'Report case deleted successfully' });
        expect(mockReportCaseService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when deleting a non-existent report case', async () => {
        mockReportCaseService.delete.mockRejectedValue(new NotFoundException('Report case not found.'));

        await expect(controller.delete(999)).rejects.toThrow(NotFoundException);
        expect(mockReportCaseService.delete).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when deleting a report case with invalid ID', async () => {
        mockReportCaseService.delete.mockRejectedValue(new BadRequestException('Invalid id.'));

        await expect(controller.delete(-1)).rejects.toThrow(BadRequestException);
        expect(mockReportCaseService.delete).toHaveBeenCalledWith(-1);
    });

    it('should retrieve a report case by ID', async () => {
        const reportCase = { id: 1, totalConfirmed: 100, totalDeath: 10, totalActive: 90 };
        mockReportCaseService.getById.mockResolvedValue(reportCase);

        const result = await controller.getById(1);
        expect(result).toEqual(reportCase);
        expect(mockReportCaseService.getById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when retrieving a non-existent report case by ID', async () => {
        mockReportCaseService.getById.mockRejectedValue(new NotFoundException('Report case not found.'));

        await expect(controller.getById(999)).rejects.toThrow(NotFoundException);
        expect(mockReportCaseService.getById).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when retrieving a report case with invalid ID', async () => {
        mockReportCaseService.getById.mockRejectedValue(new BadRequestException('Invalid id.'));

        await expect(controller.getById(-1)).rejects.toThrow(BadRequestException);
        expect(mockReportCaseService.getById).toHaveBeenCalledWith(-1);
    });

    it('should retrieve all report cases', async () => {
        const reportCases = [
            { id: 1, totalConfirmed: 100, totalDeath: 10, totalActive: 90 },
            { id: 2, totalConfirmed: 200, totalDeath: 20, totalActive: 180 },
        ];
        mockReportCaseService.getAll.mockResolvedValue(reportCases);

        const result = await controller.getAll();
        expect(result).toEqual(reportCases);
        expect(mockReportCaseService.getAll).toHaveBeenCalled();
    });

    it('should retrieve filtered report cases', async () => {
        const page = 1;
        const pageSize = 10;
        const filteredCases = [
            { id: 1, totalConfirmed: 100, totalDeath: 10, totalActive: 90 },
        ];
        mockReportCaseService.getFilteredReportCases.mockResolvedValue(filteredCases);

        const result = await controller.getFilteredReportCases(testFilter, page.toString(), pageSize.toString());
        expect(result).toEqual(filteredCases);
        expect(mockReportCaseService.getFilteredReportCases).toHaveBeenCalledWith(testFilter, page, pageSize);
    });

    it('should throw BadRequestException when filter is invalid', async () => {
        const invalidFilter = {
            logicOperator: 'INVALID_OPERATOR',
            conditions: [],
        };
        const page = 1;
        const pageSize = 10;
        mockReportCaseService.getFilteredReportCases.mockRejectedValue(new BadRequestException('Invalid filter.'));

        await expect(controller.getFilteredReportCases(invalidFilter, page.toString(), pageSize.toString())).rejects.toThrow(BadRequestException);
        expect(mockReportCaseService.getFilteredReportCases).toHaveBeenCalledWith(invalidFilter, page, pageSize);
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
        const page = 1;
        const pageSize = 10;
        mockReportCaseService.getFilteredReportCases.mockRejectedValue(new InternalServerErrorException('Unexpected error.'));

        await expect(controller.getFilteredReportCases(testFilter, page.toString(), pageSize.toString())).rejects.toThrow(InternalServerErrorException);
        expect(mockReportCaseService.getFilteredReportCases).toHaveBeenCalledWith(testFilter, page, pageSize);
    });

    it('should retrieve all cases when filter is null', async () => {
        const page = 1;
        const pageSize = 10;
        const allCases = [
            { id: 1, totalConfirmed: 100, totalDeath: 10, totalActive: 90 },
            { id: 2, totalConfirmed: 200, totalDeath: 20, totalActive: 180 },
        ];
        mockReportCaseService.getFilteredReportCases.mockResolvedValue(allCases);

        const result = await controller.getFilteredReportCases(null, page.toString(), pageSize.toString());
        expect(result).toEqual(allCases);
        expect(mockReportCaseService.getFilteredReportCases).toHaveBeenCalledWith(null, page, pageSize);
    });
});
