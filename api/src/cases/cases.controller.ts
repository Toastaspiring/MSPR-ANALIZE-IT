import { Body, Controller, Get } from '@nestjs/common';
import { CaseService } from './cases.service';

@Controller('case')
export class CaseController {
    constructor(
        private caseService: CaseService,
    ){}

    @Get('/get')
    async createBook(@Body() body){
        console.log(body);
    }
}
