import { Controller, Get } from '@nestjs/common';
import { DiseasesService } from './diseases.service';

@Controller('diseases')
export class DiseasesController {
    constructor(
        private diseasesService: DiseasesService,
    ){}
}
