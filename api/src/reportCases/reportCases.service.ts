import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportCase } from './reportCases.entity';
import { CreateReportCaseDto } from './dto/CreateReportCase.dto';
import { UpdateReportCaseDto } from './dto/UpdateReportCase.dto';
import { isEmpty } from 'lodash';

@Injectable()
export class ReportCaseService {
    constructor(@InjectRepository(ReportCase) private repo: Repository<ReportCase>) { }

    async create(createReportCaseDto: CreateReportCaseDto) {
        if (!createReportCaseDto || isEmpty(createReportCaseDto)) {
            throw new BadRequestException('Invalid data: DTO is required.');
        }

        try {
            const newCase = this.repo.create(
                {
                    ...createReportCaseDto,
                    date: new Date(createReportCaseDto.date)
                }
            )
            return await this.repo.save(newCase)
        }
        catch (error) {
            console.error('Error creating report case:', error);
            throw new InternalServerErrorException('Failed to create report case.');
        }
    }

    async update(id: number, updateReportCaseDto: UpdateReportCaseDto) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        if (!updateReportCaseDto || isEmpty(updateReportCaseDto)) {
            throw new BadRequestException('Invalid data: At least one field is required.');
        }

        const existingCase = await this.repo.findOneBy({ id });
        if (!existingCase) {
            throw new NotFoundException(`Report Case not found with id: ${id}`);
        }

        try {
            await this.repo.update(id, {
                ...updateReportCaseDto,
                date: updateReportCaseDto.date ? new Date(updateReportCaseDto.date) : existingCase.date
            });

            return await this.repo.findOneBy({ id });
        }
        catch (error) {
            console.error('Error updating report case:', error);
            throw new InternalServerErrorException('Failed to update report case.');
        }
    }

    async delete(id: number) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        const reportCase = await this.repo.findOneBy({ id });
        if (!reportCase) {
            throw new NotFoundException(`Report Case not found with id: ${id}`);
        }

        try {
            const result = await this.repo.delete({ id });
            if (result.affected === 0) {
                throw new NotFoundException(`Report Case not found with id: ${id}`);
            }
            return { message: `Report Case with id ${id} successfully deleted.` };
        }
        catch (error) {
            console.error('Error deleting report case:', error);
            throw new InternalServerErrorException('Failed to delete report case.');
        }
    }

    async getById(id: number) {
        if (!id || id <= 0) {
            throw new BadRequestException('Invalid id.');
        }

        return await this.repo.findOneBy({ id });
    }

    async getAll(count: number) {
        if (!count || count <= 0) {
            count = 1000;
        }

        return await this.repo.find({ take: count });
    }

    async getFilteredReportCases(filter: string, count: number) {
        // TODO : regex to test if the query sent is ok
        const queryRegex = "^$"

        if (!filter) {
            filter = "";
        }

        if (!count || count <= 0) {
            count = 1000;
        }

        try {
            // Characters to replace to build a solid SQL query
            const replacements: Record<string, string> = {
                "&": " AND ",
                "|": " OR ",
                "[": "'",
                "]": "'",
                "{": "(",
                "}": ")",
                "DISEASE": "name",
                "CONFIRMED": "totalConfirmed",
                "DEATH": "totalDeath",
                "ACTIVE": "totalActive",
                "DATE": "date",
                "COUNTRY": "country",
                "CONTINENT": "continent"
            };

            Object.entries(replacements).forEach(([key, value]) => {
                filter = filter.replaceAll(key, value);
            });

            // Build the query joining all tables together
            const queryBuilder = this.repo.createQueryBuilder('ReportCase')
                .leftJoinAndSelect('ReportCase.localization', 'localization')
                .leftJoinAndSelect('ReportCase.disease', 'disease')
                .where(filter)
                .limit(count);

            console.log("Generated SQL Query: ", queryBuilder.getSql());

            return await queryBuilder.getMany();
        }
        catch (error) {
            console.error('Error fetching filtered report cases:', error);
            throw new InternalServerErrorException('Failed to fetch filtered report cases.');
        }

    }
}
