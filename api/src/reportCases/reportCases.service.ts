import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportCase } from './reportCases.entity';
import { CreateReportCaseDto } from './dto/CreateReportCase.dto';
import { UpdateReportCaseDto } from './dto/UpdateReportCase.dto';
import { isEmpty } from 'lodash';
import { FilterConditionDto } from './dto/FilterCondition.dto';
import { FilterConditionGroupDto } from './dto/FilterConditionGroup.dto';

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

    async getFilteredReportCases(filter: FilterConditionGroupDto, count: number) {
        if (!count || count <= 0) {
            count = 1000;
        }

        // Build the query
        const queryBuilder = this.repo.createQueryBuilder('ReportCase')
            .leftJoinAndSelect('ReportCase.localization', 'localization')
            .leftJoinAndSelect('ReportCase.disease', 'disease');

        if (filter && !isEmpty(filter)) {
            // Parse the condition recursively
            const parseConditions = (
                conditions: (FilterConditionDto | FilterConditionGroupDto)[],
            ): { expression: string; parameters: Record<string, any> } => {
                const expressions: string[] = [];
                const parameters: Record<string, any> = {};

                // Iterate through the conditions
                conditions.forEach((condition, index) => {
                    // Check if the condition is a group or an individual condition
                    if ('conditions' in condition && Array.isArray(condition.conditions)) {
                        // Handle nested groups
                        const nestedResult = parseConditions(condition.conditions);
                        if (nestedResult.expression) {
                            let expression = "";
                            // Add the logic operator for the group
                            if (index != 0) {
                                expression += `${condition.logicOperator} `;
                            }
                            expression += `(${nestedResult.expression})`;
                            expressions.push(expression);
                            Object.assign(parameters, nestedResult.parameters);
                        }
                    } else if ('field' in condition) {
                        // Handle individual conditions
                        const paramKey = `${condition.field}_${index}`;
                        let expression = "";
                        // Add the logic operator for the condition
                        if (index != 0) {
                            expression += `${condition.logicOperator} `;
                        }
                        expression += `${condition.field} ${condition.comparisonOperator} :${paramKey}`;
                        expressions.push(expression);
                        parameters[paramKey] = condition.value;
                    }
                });

                return {
                    expression: expressions.join(` `),
                    parameters,
                };
            };

            const parsedFilter = parseConditions(filter.conditions);

            console.log("Parsed Filter: ", parsedFilter.expression);

            queryBuilder.where(parsedFilter.expression, parsedFilter.parameters);
        }

        queryBuilder.limit(count);

        console.log("Generated SQL Query: ", queryBuilder.getSql());
        try {
            return await queryBuilder.getMany();
        }
        catch (error) {
            console.error('Error fetching filtered report cases:', error);
            throw new InternalServerErrorException('Failed to fetch filtered report cases.');
        }
    }
}
