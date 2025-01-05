import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ReportCaseService } from './reportCases.service';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('case')
export class ReportCaseController {
    constructor(
        private caseService: ReportCaseService,
    ){}

    @Get('/get/sorted')
    @ApiQuery({ name: 'sort', required: false, type: String, description: 'The filter to retrieve specific data' })
    @ApiQuery({ name: 'count', required: false, type: Number, description: 'The number of cases to retrieve', default: 1000 })
    @ApiResponse({ status: 200, description: 'The list of sorted report cases has been retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    async getSortedReportCases(@Query('sort') sort: string = "",@Query('count') count: number = 1000)
    {
        if (count <= 0) {
            throw new BadRequestException('Count must be a positive number.');
        }

        const reportCases = await this.caseService.getSortedReportCases(sort,count);
        return reportCases
    }
}
