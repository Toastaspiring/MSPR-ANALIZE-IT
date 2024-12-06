import { Body, Controller, Get } from '@nestjs/common';
import { CaseService } from './reportCases.service';

@Controller('case')
export class ReportCaseController {
    constructor(
        private caseService: CaseService,
    ){}

    @Get('/get')
    async createReportCase(@Body() body){
        console.log(body.sort);
        // TODO : deconstruire parametre du body pour creer une requete sql de bz
    }
}
