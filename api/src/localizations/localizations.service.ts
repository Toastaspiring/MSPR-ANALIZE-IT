import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Localization } from './localization.entity';

@Injectable()
export class LocalizationService {
    constructor(@InjectRepository(Localization) private repo: Repository<Localization>){}

    async createLocalization(country:string, continent:string){
        const newLocalization = this.repo.create(
            {
                country: country,
                continent: continent,
            }
        )
        this.repo.save(newLocalization) 
    }

    async findOne(id: number) {
        const localization = await this.repo.findOneBy({ id })
        if(!localization){
            throw new Error('Localization not found with id: ' + id)
        }
        return localization
    }

    async findAll(count = 100){
        const localizations =  await this.repo.find({take : count})
        if(localizations.length == 0){
            throw new Error('No localizations found')
        }
        return localizations
    }

    async removeLocalization(id : number){
        const result = await this.repo.delete({ id })
        if(!result){
            throw new Error('Localization not found with id: ' + id)
        }
        return result
    }
}
