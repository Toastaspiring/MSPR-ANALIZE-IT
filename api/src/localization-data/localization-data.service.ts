import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalizationData } from './localization-data.entity';
import { isEmpty } from 'lodash';
import { CreateLocalizationDataDto } from './dto/CreateLocalizationDataDto.dto';
import { UpdateLocalizationDataDto } from './dto/UpdateLocalizationDataDto.dto';

@Injectable()
export class LocalizationDataService {
    constructor(@InjectRepository(LocalizationData) private repo: Repository<LocalizationData>) { }

    async create(createLocalizationDataDto: CreateLocalizationDataDto) {
        if (!createLocalizationDataDto || isEmpty(createLocalizationDataDto)) {
            throw new BadRequestException('Invalid data: DTO is required.');
        }

        try {
            const newLocalizationData = this.repo.create({ ...createLocalizationDataDto });
            return await this.repo.save(newLocalizationData);
        } catch (error) {
            console.error('Error creating localization data:', error);
            throw new InternalServerErrorException('Failed to create localization data.');
        }
    }

    async update(id: number, updateLocalizationDataDto: UpdateLocalizationDataDto) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        if (!updateLocalizationDataDto || isEmpty(updateLocalizationDataDto)) {
            throw new BadRequestException('Invalid data: DTO is required.');
        }

        const existingLocalizationData = await this.repo.findOneBy({ id });
        if (!existingLocalizationData) {
            throw new NotFoundException(`Localization data not found with id: ${id}`);
        }

        try {
            await this.repo.update(id, { ...updateLocalizationDataDto });
            return await this.repo.findOneBy({ id });
        } catch (error) {
            console.error('Error updating localization data:', error);
            throw new InternalServerErrorException('Failed to update localization data.');
        }
    }

    async delete(id: number) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        const localizationData = await this.repo.findOneBy({ id });
        if (!localizationData) {
            throw new NotFoundException(`Localization data not found with id: ${id}`);
        }

        try {
            const result = await this.repo.delete({ id });
            if (result.affected === 0) {
                throw new NotFoundException(`Localization data not found with id: ${id}`);
            }
            return { message: `Localization data with id ${id} successfully deleted.` };
        } catch (error) {
            console.error('Error deleting localization data:', error);
            throw new InternalServerErrorException('Failed to delete localization data.');
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
