import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportCase } from './reportCases.entitiy';

@Injectable()
export class ReportCaseService {
    constructor(@InjectRepository(ReportCase) private repo: Repository<ReportCase>){}

    async createCase(totalConfirmed:number, totalDeath:number, totalRecoveries: number, totalActive: number, localizationId: number, date: Date){
        const newCase = this.repo.create(
            {
                totalConfirmed: totalConfirmed,
                totalDeath: totalDeath,
                totalRecoveries: totalRecoveries,
                totalActive: totalActive,
                localizationId: localizationId,
                date: date
            }
        )
        this.repo.save(newCase) 
    }

    getSortedReportCases(sort: string) {
        const replacements: Record<string, string> = {
            "&": " AND ",
            "|": " OR ",
            "[": "'",
            "]": "'",
            "{": "(",
            "}": ")",
            "CONFIRMED": "totalConfirmed",
            "DEATH": "totalDeath",
            "RECOVERIES": "totalRecoveries",
            "ACTIVE": "totalActive",
            "DATE": "date",
            "COUNTRY": "country",
            "CONTINENT": "continent"
        };

        let sql = "SELECT * FROM report_case INNER JOIN localization ON localization.id = report_case.localizationId WHERE ";

        Object.entries(replacements).forEach(([key, value]) => {
            sort = sort.replaceAll(key, value);
        });

        sql += sort;

        console.log("request : " + sql);
        return this.repo.query(sql);
    }
}
