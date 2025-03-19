import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    const mockUsersService = {
        create: jest.fn(),
        updatePassword: jest.fn(),
        updateUsername: jest.fn(),
        updateRole: jest.fn(),
        delete: jest.fn(),
        getById: jest.fn(),
        getAll: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: {} },
            ],
        })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: jest.fn(() => true) }) // Mock RolesGuard to always allow access
            .compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a user', async () => {
        const dto = { username: 'testuser', password: 'Test@1234' };
        mockUsersService.create.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.create(dto);
        expect(result).toEqual({ id: 1, ...dto });
        expect(mockUsersService.create).toHaveBeenCalledWith(dto.username, dto.password);
    });

    it('should throw BadRequestException when creating a user with invalid data', async () => {
        const dto = { username: '', password: '' };
        mockUsersService.create.mockRejectedValue(new BadRequestException('Invalid username or password.'));

        await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
        expect(mockUsersService.create).toHaveBeenCalledWith(dto.username, dto.password);
    });

    it('should throw BadRequestException when creating a user with an invalid username', async () => {
        const dto = { username: 'invalid username', password: 'Test@1234' };
        mockUsersService.create.mockRejectedValue(new BadRequestException('Invalid username.'));

        await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
        expect(mockUsersService.create).toHaveBeenCalledWith(dto.username, dto.password);
    });

    it('should throw BadRequestException when creating a user with an invalid password', async () => {
        const dto = { username: 'testuser', password: 'short' };
        mockUsersService.create.mockRejectedValue(new BadRequestException('Invalid password.'));

        await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
        expect(mockUsersService.create).toHaveBeenCalledWith(dto.username, dto.password);
    });

    it('should update a user password', async () => {
        const dto = { username: 'testuser', newPassword: 'NewPass@1234' };
        mockUsersService.updatePassword.mockResolvedValue({ message: 'Password updated successfully' });

        const result = await controller.updatePassword(dto);
        expect(result).toEqual({ message: 'Password updated successfully' });
        expect(mockUsersService.updatePassword).toHaveBeenCalledWith(dto.username, dto.newPassword);
    });

    it('should throw BadRequestException when updating password with invalid data', async () => {
        const dto = { username: '', newPassword: '' };
        mockUsersService.updatePassword.mockRejectedValue(new BadRequestException('Invalid username or password.'));

        await expect(controller.updatePassword(dto)).rejects.toThrow(BadRequestException);
        expect(mockUsersService.updatePassword).toHaveBeenCalledWith(dto.username, dto.newPassword);
    });

    it('should throw BadRequestException when updating username with invalid data', async () => {
        const dto = { id: 1, newUsername: '' };
        mockUsersService.updateUsername.mockRejectedValue(new BadRequestException('Invalid username.'));

        await expect(controller.updateUsername(dto.id, { newUsername: dto.newUsername })).rejects.toThrow(BadRequestException);
        expect(mockUsersService.updateUsername).toHaveBeenCalledWith(dto.id, dto.newUsername);
    });

    it('should throw NotFoundException when updating username for a non-existent user', async () => {
        const dto = { id: 999, newUsername: 'newUsername' };
        mockUsersService.updateUsername.mockRejectedValue(new NotFoundException('User not found.'));

        await expect(controller.updateUsername(dto.id, { newUsername: dto.newUsername })).rejects.toThrow(NotFoundException);
        expect(mockUsersService.updateUsername).toHaveBeenCalledWith(dto.id, dto.newUsername);
    });

    it('should throw BadRequestException when updating role with invalid role ID', async () => {
        const dto = { id: 1, roleId: -1 };
        mockUsersService.updateRole.mockRejectedValue(new BadRequestException('Invalid role id.'));

        await expect(controller.updateRole(dto.id, { roleId: dto.roleId })).rejects.toThrow(BadRequestException);
        expect(mockUsersService.updateRole).toHaveBeenCalledWith(dto.id, dto.roleId);
    });

    it('should throw NotFoundException when updating role for a non-existent user', async () => {
        const dto = { id: 999, roleId: 1 };
        mockUsersService.updateRole.mockRejectedValue(new NotFoundException('User not found.'));

        await expect(controller.updateRole(dto.id, { roleId: dto.roleId })).rejects.toThrow(NotFoundException);
        expect(mockUsersService.updateRole).toHaveBeenCalledWith(dto.id, dto.roleId);
    });

    it('should throw NotFoundException when updating role with a non-existent role ID', async () => {
        const dto = { id: 1, roleId: 999 };
        mockUsersService.updateRole.mockRejectedValue(new NotFoundException('Role not found.'));

        await expect(controller.updateRole(dto.id, { roleId: dto.roleId })).rejects.toThrow(NotFoundException);
        expect(mockUsersService.updateRole).toHaveBeenCalledWith(dto.id, dto.roleId);
    });

    it('should retrieve a user by ID', async () => {
        const user = { id: 1, username: 'testuser', password: 'hashedpassword' };
        mockUsersService.getById.mockResolvedValue(user);

        const result = await controller.getById(1);
        expect(result).toEqual(user);
        expect(mockUsersService.getById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when retrieving a user by invalid ID', async () => {
        mockUsersService.getById.mockRejectedValue(new NotFoundException('User not found.'));

        await expect(controller.getById(999)).rejects.toThrow(NotFoundException);
        expect(mockUsersService.getById).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when retrieving a user with invalid ID', async () => {
        mockUsersService.getById.mockRejectedValue(new BadRequestException('Invalid id.'));

        await expect(controller.getById(-1)).rejects.toThrow(BadRequestException);
        expect(mockUsersService.getById).toHaveBeenCalledWith(-1);
    });

    it('should delete a user', async () => {
        mockUsersService.delete.mockResolvedValue({ message: 'User deleted successfully' });

        const result = await controller.delete(1);
        expect(result).toEqual({ message: 'User deleted successfully' });
        expect(mockUsersService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when deleting a user with invalid ID', async () => {
        mockUsersService.delete.mockRejectedValue(new NotFoundException('User not found.'));

        await expect(controller.delete(999)).rejects.toThrow(NotFoundException);
        expect(mockUsersService.delete).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when deleting a user with invalid ID', async () => {
        mockUsersService.delete.mockRejectedValue(new BadRequestException('Invalid id.'));

        await expect(controller.delete(-1)).rejects.toThrow(BadRequestException);
        expect(mockUsersService.delete).toHaveBeenCalledWith(-1);
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
        mockUsersService.create.mockRejectedValue(new InternalServerErrorException('Unexpected error.'));

        const dto = { username: 'testuser', password: 'Test@1234' };
        await expect(controller.create(dto)).rejects.toThrow(InternalServerErrorException);
        expect(mockUsersService.create).toHaveBeenCalledWith(dto.username, dto.password);
    });

    it('should throw NotFoundException when retrieving a user by non-existent ID', async () => {
        mockUsersService.getById.mockRejectedValue(new NotFoundException('User not found.'));

        await expect(controller.getById(999)).rejects.toThrow(NotFoundException);
        expect(mockUsersService.getById).toHaveBeenCalledWith(999);
    });
});
