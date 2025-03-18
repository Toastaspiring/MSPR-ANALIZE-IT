import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { isEmpty } from 'lodash';
import { CreateRoleDto } from './dto/CreateRoleDto.dto';
import { UpdateRoleDto } from './dto/UpdateRoleDto.dto';

@Injectable()
export class RolesService {
    constructor(@InjectRepository(Role) private repo: Repository<Role>) { }

    async create(createRoleDto: CreateRoleDto) {
        if (!createRoleDto || isEmpty(createRoleDto)) {
            throw new BadRequestException('Invalid data: DTO is required.');
        }

        try {
            const newRole = this.repo.create({ ...createRoleDto });
            return await this.repo.save(newRole);
        } catch (error) {
            console.error('Error creating role:', error);
            throw new InternalServerErrorException('Failed to create role.');
        }
    }

    async update(id: number, updateRoleDto: UpdateRoleDto) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        if (!updateRoleDto || isEmpty(updateRoleDto)) {
            throw new BadRequestException('Invalid data: DTO is required.');
        }

        const existingRole = await this.repo.findOneBy({ id });
        if (!existingRole) {
            throw new NotFoundException(`Role not found with id: ${id}`);
        }

        try {
            await this.repo.update(id, { ...updateRoleDto });
            return await this.repo.findOneBy({ id });
        } catch (error) {
            console.error('Error updating role:', error);
            throw new InternalServerErrorException('Failed to update role.');
        }
    }

    async delete(id: number) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        const role = await this.repo.findOneBy({ id });
        if (!role) {
            throw new NotFoundException(`Role not found with id: ${id}`);
        }

        try {
            const result = await this.repo.delete({ id });
            if (result.affected === 0) {
                throw new NotFoundException(`Role not found with id: ${id}`);
            }
            return { message: `Role with id ${id} successfully deleted.` };
        } catch (error) {
            console.error('Error deleting role:', error);
            throw new InternalServerErrorException('Failed to delete role.');
        }
    }

    async getById(id: number) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        return await this.repo.findOneBy({ id });
    }

    async getAll() {
        return await this.repo.find();
    }
}
