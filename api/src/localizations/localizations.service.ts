import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Localization } from './localization.entity';
import { CreateLocalizationDto } from './dto/CreateLocalizationDto.dto';
import { isEmpty } from 'lodash';
import { UpdateLocalizationDto } from './dto/UpdateLocalizationDto.dto';

@Injectable()
export class LocalizationService {
    constructor(@InjectRepository(Localization) private repo: Repository<Localization>) { }

    async create(createLocalizationDto: CreateLocalizationDto) {
        if (!createLocalizationDto || isEmpty(createLocalizationDto)) {
            throw new BadRequestException('Invalid data: DTO is required.');
        }

        try {
            const newLocalization = this.repo.create({ ...createLocalizationDto });
            return await this.repo.save(newLocalization);
        } catch (error) {
            console.error('Error creating localization:', error);
            throw new InternalServerErrorException('Failed to create localization.');
        }
    }

    async update(id: number, updateLocalizationDto: UpdateLocalizationDto) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        if (!updateLocalizationDto || isEmpty(updateLocalizationDto)) {
            throw new BadRequestException('Invalid data: DTO is required.');
        }

        const existingLocalization = await this.repo.findOneBy({ id });
        if (!existingLocalization) {
            throw new NotFoundException(`Localization not found with id: ${id}`);
        }

        try {
            await this.repo.update(id, { ...updateLocalizationDto });
            return await this.repo.findOneBy({ id });
        } catch (error) {
            console.error('Error updating localization:', error);
            throw new InternalServerErrorException('Failed to update localization.');
        }
    }

    async delete(id: number) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        const localization = await this.repo.findOneBy({ id });
        if (!localization) {
            throw new NotFoundException(`Localization not found with id: ${id}`);
        }

        try {
            const result = await this.repo.delete({ id });
            if (result.affected === 0) {
                throw new NotFoundException(`Localization not found with id: ${id}`);
            }
            return { message: `Localization with id ${id} successfully deleted.` };
        } catch (error) {
            console.error('Error deleting localization:', error);
            throw new InternalServerErrorException('Failed to delete localization.');
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
