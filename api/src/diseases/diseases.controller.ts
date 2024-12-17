import { Controller, Get } from '@nestjs/common';
import { DiseasesService } from './diseases.service';

@Controller('diseases')
export class DiseasesController {
    constructor(
        private diseasesService: DiseasesService,
    ){}

    @Get('/get/all')
    async getAllDiseases(){
        const reportCases = await this.diseasesService.findAll();
        return reportCases
    }
}
