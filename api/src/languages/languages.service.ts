import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Language } from './language.entity';
import { Repository } from 'typeorm';
import { isEmpty } from 'lodash';
import { CreateLanguageDto } from './dto/CreateLanguageDto.dto';

@Injectable()
export class LanguageService {
    constructor(@InjectRepository(Language) private repo: Repository<Language>) { }

    async create(createLangageDto: CreateLanguageDto) {
        if (!createLangageDto || isEmpty(createLangageDto)) {
            throw new BadRequestException('Invalid data: DTO is required.');
        }

        try {
            const newLanguage = this.repo.create({ ...createLangageDto });
            return await this.repo.save(newLanguage);
        } catch (error) {
            console.error('Error creating language:', error);
            throw new InternalServerErrorException('Failed to create language.');
        }
    }

    async update(id: number, updateLanguageDto: CreateLanguageDto) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        if (!updateLanguageDto || isEmpty(updateLanguageDto)) {
            throw new BadRequestException('Invalid data: DTO is required.');
        }

        const existingLanguage = await this.repo.findOneBy({ id });
        if (!existingLanguage) {
            throw new NotFoundException(`Language not found with id: ${id}`); // Changed BadRequestException to NotFoundException
        }

        try {
            await this.repo.update(id, { ...updateLanguageDto });
            return await this.repo.findOneBy({ id });
        } catch (error) {
            console.error('Error updating language:', error);
            throw new InternalServerErrorException('Failed to update language.');
        }
    }

    async delete(id: number) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        const language = await this.repo.findOneBy({ id });
        if (!language) {
            throw new NotFoundException(`Language not found with id: ${id}`);
        }

        try {
            const result = await this.repo.delete(id);
            if (result.affected === 0) {
                throw new NotFoundException(`Language not found with id: ${id}`);
            }
            return { message: `Language with id ${id} successfully deleted.` };
        } catch (error) {
            console.error('Error deleting language:', error);
            throw new InternalServerErrorException('Failed to delete language.');
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
