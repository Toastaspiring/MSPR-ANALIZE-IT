import { Body, Controller, Get } from '@nestjs/common';
import { ReportCaseService } from './reportCases.service';

@Controller('case')
export class ReportCaseController {
    constructor(
        private caseService: ReportCaseService,
    ){}

    @Get('/get')
    async getReportCases(@Body() body){
        if(body == null || !body.sort){
            console.log('No sort parameter provided');
            return null;
        }

        const reportCases = this.caseService.getSortedReportCases(body.sort);
        return reportCases
    }

}
