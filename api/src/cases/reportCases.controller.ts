import { Body, Controller, Get } from '@nestjs/common';
import { CaseService } from './reportCases.service';

@Controller('case')
export class ReportCaseController {
    constructor(
        private caseService: CaseService,
    ){}

    @Get('/get')
    async createBook(@Body() body){
        console.log(body);
    }
}
