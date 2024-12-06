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

    findOne(id: number) {
        const gettedLocalization = this.repo.findOneBy({ id })
        if(!gettedLocalization){
            throw new Error('localization not found with id: ' + id)
        }
        return gettedLocalization
    }
}
