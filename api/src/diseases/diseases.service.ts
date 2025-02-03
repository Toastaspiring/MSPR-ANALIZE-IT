import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Disease } from './disease.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDiseaseDto } from './dto/CreateDiseaseDto.dto';
import { UpdateDiseaseDto } from './dto/UpdateDiseaseDto.dto';
import { isEmpty } from 'lodash';

@Injectable()
export class DiseasesService {
    constructor(@InjectRepository(Disease) private repo: Repository<Disease>){}

    async create(createDiseaseDto: CreateDiseaseDto) {
        if (!createDiseaseDto || isEmpty(createDiseaseDto)) {
            throw new BadRequestException('Invalid data: DTO is required.');
        }

        try {
            const newDisease = this.repo.create(
                {
                    ...createDiseaseDto
                }
            )
            return await this.repo.save(newDisease) 
        }
        catch (error) {
            console.error('Error creating disease:', error);
            throw new InternalServerErrorException('Failed to create disease.');
        }
    }

    async update(id: number, updateDiseaseDto: UpdateDiseaseDto) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        if (!updateDiseaseDto || isEmpty(updateDiseaseDto)) {
            throw new BadRequestException('Invalid data: DTO is required.');
        }

        const existingDisease = await this.repo.findOneBy({ id });
        if (!existingDisease) {
            throw new NotFoundException(`Disease not found with id: ${id}`);
        }

        try {
            await this.repo.update(id, {
                ...updateDiseaseDto
            });

            return await this.repo.findOneBy({ id });
        }
        catch (error) {
            console.error('Error updating disease:', error);
            throw new InternalServerErrorException('Failed to update disease.');
        }
    }

    async delete(id: number) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        const disease = await this.repo.findOneBy({ id });
        if (!disease) {
            throw new NotFoundException(`Disease not found with id: ${id}`);
        }

        try {
            const result = await this.repo.delete({ id });
            if (result.affected === 0) {
                throw new NotFoundException(`Disease not found with id: ${id}`);
            }
            return { message: `Disease with id ${id} successfully deleted.` };
        }
        catch (error) {
            console.error('Error deleting disease:', error);
            throw new InternalServerErrorException('Failed to delete disease.');
        }
    }

    async getById(id: number) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        return await this.repo.findOneBy({ id });
    }

    async getByName(name: string) {
        if (!name || name == "") {
            throw new BadRequestException('Invalid name.');
        }

        return await this.repo.findOneBy({ name });
    }

    async getAll() {
        return await this.repo.find();
    }
}
