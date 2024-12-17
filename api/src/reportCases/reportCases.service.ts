import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportCase } from './reportCases.entitiy';

@Injectable()
export class ReportCaseService {
    constructor(@InjectRepository(ReportCase) private repo: Repository<ReportCase>){}

    async createCase(totalConfirmed:number, totalDeath:number, totalActive: number, localizationId: number, date: Date){
        const newCase = this.repo.create(
            {
                totalConfirmed: totalConfirmed,
                totalDeath: totalDeath,
                totalActive: totalActive,
                localizationId: localizationId,
                date: date
            }
        )
        this.repo.save(newCase) 
    }

    async findOne(id : number){
        const reportCase = await this.repo.findOneBy({ id })
        if(!reportCase){
            throw new Error('Report Case not found with id: ' + id)
        }
        return reportCase
    }

    async findAll(count = 100){
        const cases = await this.repo.find({ take: count })
        if(cases.length == 0){
            throw new Error('No report cases found')
        }
        return cases
    }

    async getSortedReportCases(sort: string, count = 100) {
        // Characters to replace to build a solid SQL query
        const replacements: Record<string, string> = {
            "&": " AND ",
            "|": " OR ",
            "[": "'",
            "]": "'",
            "{": "(",
            "}": ")",
            "CONFIRMED": "totalConfirmed",
            "DEATH": "totalDeath",
            "ACTIVE": "totalActive",
            "DATE": "date",
            "COUNTRY": "country",
            "CONTINENT": "continent"
        };

        Object.entries(replacements).forEach(([key, value]) => {
            sort = sort.replaceAll(key, value);
        });

        // Build the query joining all tables together
        const queryBuilder = this.repo.createQueryBuilder('ReportCase')
            .leftJoinAndSelect('ReportCase.localization', 'localization')
            .leftJoinAndSelect('ReportCase.disease', 'disease')
            .where(sort)
            .limit(count);

        console.log("Generated SQL Query: ", queryBuilder.getSql());

        return await queryBuilder.getMany();
    }

    async removeReportCase(id : number){
        const result = await this.repo.delete({ id })
        if(!result){
            throw new Error('Report Case not found with id: ' + id)
        }
        return result
    }
}
