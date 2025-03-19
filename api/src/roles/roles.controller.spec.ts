import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesGuard } from '../auth/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('RolesController', () => {
    let controller: RolesController;
    let service: RolesService;

    const mockRolesService = {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        getById: jest.fn(),
        getAll: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RolesController],
            providers: [
                { provide: RolesService, useValue: mockRolesService },
                { provide: JwtService, useValue: {} },
            ],
        })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: jest.fn(() => true) }) // Mock RolesGuard to always allow access
            .compile();

        controller = module.get<RolesController>(RolesController);
        service = module.get<RolesService>(RolesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a role', async () => {
        const dto = { roleName: 'Admin' };
        mockRolesService.create.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.create(dto);
        expect(result).toEqual({ id: 1, ...dto });
        expect(mockRolesService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException when creating a role with invalid data', async () => {
        const dto = { roleName: '' };
        mockRolesService.create.mockRejectedValue(new BadRequestException('Invalid role name.'));

        await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
        expect(mockRolesService.create).toHaveBeenCalledWith(dto);
    });

    it('should update a role', async () => {
        const dto = { roleName: 'UpdatedRole' };
        mockRolesService.update.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.update(1, dto);
        expect(result).toEqual({ id: 1, ...dto });
        expect(mockRolesService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw BadRequestException when updating a role with invalid data', async () => {
        const dto = { roleName: '' };
        mockRolesService.update.mockRejectedValue(new BadRequestException('Invalid role name.'));

        await expect(controller.update(1, dto)).rejects.toThrow(BadRequestException);
        expect(mockRolesService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw NotFoundException when updating a non-existent role', async () => {
        const dto = { roleName: 'NonExistentRole' };
        mockRolesService.update.mockRejectedValue(new NotFoundException('Role not found.'));

        await expect(controller.update(999, dto)).rejects.toThrow(NotFoundException);
        expect(mockRolesService.update).toHaveBeenCalledWith(999, dto);
    });

    it('should delete a role', async () => {
        mockRolesService.delete.mockResolvedValue({ message: 'Role deleted successfully' });

        const result = await controller.delete(1);
        expect(result).toEqual({ message: 'Role deleted successfully' });
        expect(mockRolesService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when deleting a non-existent role', async () => {
        mockRolesService.delete.mockRejectedValue(new NotFoundException('Role not found.'));

        await expect(controller.delete(999)).rejects.toThrow(NotFoundException);
        expect(mockRolesService.delete).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when deleting a role with invalid ID', async () => {
        mockRolesService.delete.mockRejectedValue(new BadRequestException('Invalid id.'));

        await expect(controller.delete(-1)).rejects.toThrow(BadRequestException);
        expect(mockRolesService.delete).toHaveBeenCalledWith(-1);
    });

    it('should retrieve a role by ID', async () => {
        const role = { id: 1, roleName: 'Admin' };
        mockRolesService.getById.mockResolvedValue(role);

        const result = await controller.getById(1);
        expect(result).toEqual(role);
        expect(mockRolesService.getById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when retrieving a non-existent role by ID', async () => {
        mockRolesService.getById.mockRejectedValue(new NotFoundException('Role not found.'));

        await expect(controller.getById(999)).rejects.toThrow(NotFoundException);
        expect(mockRolesService.getById).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when retrieving a role with invalid ID', async () => {
        mockRolesService.getById.mockRejectedValue(new BadRequestException('Invalid id.'));

        await expect(controller.getById(-1)).rejects.toThrow(BadRequestException);
        expect(mockRolesService.getById).toHaveBeenCalledWith(-1);
    });

    it('should retrieve all roles', async () => {
        const roles = [
            { id: 1, roleName: 'Admin' },
            { id: 2, roleName: 'User' },
        ];
        mockRolesService.getAll.mockResolvedValue(roles);

        const result = await controller.getAll();
        expect(result).toEqual(roles);
        expect(mockRolesService.getAll).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
        mockRolesService.create.mockRejectedValue(new InternalServerErrorException('Unexpected error.'));

        const dto = { roleName: 'Admin' };
        await expect(controller.create(dto)).rejects.toThrow(InternalServerErrorException);
        expect(mockRolesService.create).toHaveBeenCalledWith(dto);
    });
});
