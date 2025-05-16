import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ReportCaseService } from './reportCases.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateReportCaseDto } from './dto/CreateReportCase.dto';
import { UpdateReportCaseDto } from './dto/UpdateReportCase.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Public, Roles } from '../auth/decorator';
import { CommonApiResponses } from '../common/api-response.decorator';
import { UserRole } from '../roles/userRole.enum';
import { FilterConditionDto } from './dto/FilterCondition.dto';
import { FilterConditionGroupDto } from './dto/FilterConditionGroup.dto';

@Controller('case')
@UseGuards(RolesGuard)
export class ReportCaseController {
    constructor(
        private caseService: ReportCaseService,
    ) { }

    @Public()
    @Post('create')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Create a new report case' })
    @ApiBody({ type: CreateReportCaseDto })
    @ApiResponse({ status: 201, description: 'The report case have been created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @CommonApiResponses()
    async create(@Body() createReportCaseDto: CreateReportCaseDto) {
        return await this.caseService.create(createReportCaseDto);
    }

    @Public()
    @Patch(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
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

    @Public()
    @Delete(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Delete a report case by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of case to delete', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted report case have been deleted successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @ApiResponse({ status: 404, description: 'Report case not found.' })
    @CommonApiResponses()
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.caseService.delete(id);
    }

    @Public()
    @Post('filtered')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.USER, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Retrieve filtered report cases' })
    @ApiBody({ type: FilterConditionGroupDto, description: 'The filter as a JSON object', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page id to retrieve', example: 1 })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of elements in a page', example: 100 })
    @ApiResponse({ status: 201, description: 'The list of filtered report cases has been retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @CommonApiResponses()
    async getFilteredReportCases(@Body() filter?: FilterConditionGroupDto, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
        const parsedPage = page ? parseInt(page) : 1;
        const parsedPageSize = pageSize ? parseInt(pageSize) : 100;
        return await this.caseService.getFilteredReportCases(filter, parsedPage, parsedPageSize);
    }

    @Public()
    @Get()
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.USER, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Retrieve all cases with a limit' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page id to retrieve', example: 1 })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of elements in a page', example: 100 })
    @ApiResponse({ status: 200, description: 'The list of report cases has been retrieved successfully.' })
    @CommonApiResponses()
    async getAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
        const parsedPage = page ? parseInt(page) : 1;
        const parsedPageSize = pageSize ? parseInt(pageSize) : 100;
        return await this.caseService.getAll(parsedPage, parsedPageSize);
    }

    @Public()
    @Get(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.USER, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Retrieve a case by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the wanted case', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted report case have been retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @CommonApiResponses()
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.caseService.getById(id);
    }
}
