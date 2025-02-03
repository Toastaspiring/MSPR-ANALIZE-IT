import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ReportCaseService } from './reportCases.service';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateReportCaseDto } from './dto/CreateReportCase.dto';
import { UpdateReportCaseDto } from './dto/UpdateReportCase.dto';
import { Public } from 'src/auth/auth.module';

@Controller('case')
export class ReportCaseController {
    constructor(
        private caseService: ReportCaseService,
    ) { }

    @Public()
    @Post('create')
    @ApiOperation({ summary: 'Create a new report case' })
    @ApiBody({ type: CreateReportCaseDto })
    @ApiResponse({ status: 201, description: 'The report case have been created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @ApiResponse({ status: 500, description: 'Internal server error occurred while creating the report case.' })
    async create(@Body() createReportCaseDto: CreateReportCaseDto) {
        return await this.caseService.create(createReportCaseDto);
    }

    @Public()
    @Patch(':id')
    @ApiOperation({ summary: 'Update an existing report case' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the case to update', example: 1 })
    @ApiBody({ type: UpdateReportCaseDto })
    @ApiResponse({ status: 200, description: 'The report case has been updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @ApiResponse({ status: 404, description: 'Report case not found.' })
    @ApiResponse({ status: 500, description: 'Internal server error occurred while updating the report case.' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateReportCaseDto: UpdateReportCaseDto) {
        return await this.caseService.update(id, updateReportCaseDto);
    }

    @Public()
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a report case by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of case to delete', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted report case have been deleted successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @ApiResponse({ status: 404, description: 'Report case not found.' })
    @ApiResponse({ status: 500, description: 'Internal server error occurred while deleting the report case.' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.caseService.delete(id);
    }

    @Public()
    @Get('filtered')
    @ApiOperation({ summary: 'Retrieve filtered report cases' })
    @ApiQuery({ name: 'filter', required: false, type: String, description: 'The filter to retrieve specific data' })
    @ApiQuery({ name: 'count', required: false, type: Number, description: 'The number of cases to retrieve', example: 1000 })
    @ApiResponse({ status: 200, description: 'The list of filtered report cases has been retrieved successfully.' })
    @ApiResponse({ status: 500, description: 'Internal server error occurred while retrieving the filtered report cases.' })
    async getFilteredReportCases(@Query('filter') filter?: string, @Query('count') count?: string) {
        const parsedCount = count ? parseInt(count) : undefined;
        return await this.caseService.getFilteredReportCases(filter,parsedCount);
    }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Retrieve all cases with a limit' })
    @ApiQuery({ name: 'count', required: false, type: Number, description: 'The number of cases to retrieve', example: 1000 })
    @ApiResponse({ status: 200, description: 'The list of report cases has been retrieved successfully.' })
    @ApiResponse({ status: 500, description: 'Internal server error occurred while retrieving the report cases.' })
    async getAll(@Query('count') count?: string) {
        const parsedCount = count ? parseInt(count) : undefined;
        return await this.caseService.getAll(parsedCount);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Retrieve a case by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the wanted case', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted report case have been retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @ApiResponse({ status: 500, description: 'Internal server error occurred while retrieving the report case.' })
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.caseService.getById(id);
    }
}
