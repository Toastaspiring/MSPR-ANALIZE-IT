import { Injectable } from '@nestjs/common';
import { Disease } from './disease.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DiseasesService {
    constructor(@InjectRepository(Disease) private repo: Repository<Disease>){}

    async createDisease(name:string){
        const newDisease = this.repo.create(
            {
                name: name
            }
        )
        this.repo.save(newDisease) 
    }

    async findOne(id: number) {
        const disease = await this.repo.findOneBy({ id })
        if(!disease){
            throw new Error('Disease not found with id: ' + id)
        }
        return disease
    }

    async findAll(count = 100){
        const diseases = await this.repo.find({ take: count })
        if(diseases.length == 0){
            throw new Error('No diseases found')
        }
        return diseases
    }

    async removeDisease(id: number) {
        const result = await this.repo.delete({ id })
        if(!result){
            throw new Error('Disease not found with id: ' + id)
        }
        return result
    }
}