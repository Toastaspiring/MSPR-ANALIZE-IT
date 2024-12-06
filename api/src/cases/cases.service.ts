import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from './case.entitiy';

@Injectable()
export class CaseService {
    constructor(@InjectRepository(Case) private repo: Repository<Case>){}

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
        const gettedCase = this.repo.findOneBy({ id })
        if(!gettedCase){
            throw new Error('case not found with id: ' + id)
        }
        return gettedCase
    }

    findAll() {
        const gettedCases = this.repo.find({take:100})
        if(!gettedCases){
            throw new Error('No cases found')
        }
        return gettedCases
    }
}
