import { Body, Controller, Get } from '@nestjs/common';
import { ReportCaseService } from './reportCases.service';

@Controller('case')
export class ReportCaseController {
    constructor(
        private caseService: ReportCaseService,
    ){}

    @Get('/get/sorted')
    async getSortedReportCases(@Body() body){
        const count = body.count ? body.count : 1000
        const sort = body.sort ? body.sort : ""

        const reportCases = await this.caseService.getSortedReportCases(sort,count);
        return reportCases
    }
}
