import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ReportCaseService } from './reportCases.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateReportCaseDto } from './dto/CreateReportCase.dto';
import { UpdateReportCaseDto } from './dto/UpdateReportCase.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorator';
import { UserRole } from 'src/users/users.service';
import { CommonApiResponses } from 'src/common/api-response.decorator';

@Controller('case')
@UseGuards(RolesGuard)
export class ReportCaseController {
    constructor(
        private caseService: ReportCaseService,
    ) { }

    @Post('create')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new report case' })
    @ApiBody({ type: CreateReportCaseDto })
    @ApiResponse({ status: 201, description: 'The report case have been created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @CommonApiResponses()
    async create(@Body() createReportCaseDto: CreateReportCaseDto) {
        return await this.caseService.create(createReportCaseDto);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update an existing report case' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the case to update', example: 1 })
    @ApiBody({ type: UpdateReportCaseDto })
    @ApiResponse({ status: 200, description: 'The report case has been updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @ApiResponse({ status: 404, description: 'Report case not found.' })
    @CommonApiResponses()
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateReportCaseDto: UpdateReportCaseDto) {
        return await this.caseService.update(id, updateReportCaseDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a report case by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of case to delete', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted report case have been deleted successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @ApiResponse({ status: 404, description: 'Report case not found.' })
    @CommonApiResponses()
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.caseService.delete(id);
    }

    @Get('filtered')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.USER)
    @ApiOperation({ summary: 'Retrieve filtered report cases' })
    @ApiQuery({ name: 'filter', required: false, type: String, description: 'The filter to retrieve specific data' })
    @ApiQuery({ name: 'count', required: false, type: Number, description: 'The number of cases to retrieve', example: 1000 })
    @ApiResponse({ status: 200, description: 'The list of filtered report cases has been retrieved successfully.' })
    @CommonApiResponses()
    async getFilteredReportCases(@Query('filter') filter?: string, @Query('count') count?: string) {
        const parsedCount = count ? parseInt(count) : undefined;
        return await this.caseService.getFilteredReportCases(filter, parsedCount);
    }

    @Get()
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.USER)
    @ApiOperation({ summary: 'Retrieve all cases with a limit' })
    @ApiQuery({ name: 'count', required: false, type: Number, description: 'The number of cases to retrieve', example: 1000 })
    @ApiResponse({ status: 200, description: 'The list of report cases has been retrieved successfully.' })
    @CommonApiResponses()
    async getAll(@Query('count') count?: string) {
        const parsedCount = count ? parseInt(count) : undefined;
        return await this.caseService.getAll(parsedCount);
    }

    @Get(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.USER)
    @ApiOperation({ summary: 'Retrieve a case by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the wanted case', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted report case have been retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @CommonApiResponses()
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.caseService.getById(id);
    }
}
