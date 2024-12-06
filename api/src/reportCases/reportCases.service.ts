import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportCase } from './reportCases.entitiy';

@Injectable()
export class CaseService {
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

    findOne(id: number) {
        const reportCase = this.repo.findOneBy({ id })
        if(!reportCase){
            throw new Error('case not found with id: ' + id)
        }
        return reportCase
    }

    findAll() {
        const reportCases = this.repo.find({take:100})
        if(!reportCases){
            throw new Error('No cases found')
        }
        return reportCases
    }
}
