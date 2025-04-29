import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { DiseasesService } from './diseases.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateDiseaseDto } from './dto/CreateDiseaseDto.dto';
import { UpdateDiseaseDto } from './dto/UpdateDiseaseDto.dto';
import { Public, Roles } from '../auth/decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CommonApiResponses } from '../common/api-response.decorator';
import { UserRole } from '../roles/userRole.enum';

@Controller('disease')
@UseGuards(RolesGuard)
export class DiseasesController {
    constructor(
        private diseasesService: DiseasesService,
    ) { }

    @Public()
    @Post('create')
    // @ApiBearerAuth()
    // @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Create a new disease' })
    @ApiBody({ type: CreateDiseaseDto })
    @ApiResponse({ status: 201, description: 'The disease have been created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @CommonApiResponses()
    async create(@Body() createDiseaseDto: CreateDiseaseDto) {
        return await this.diseasesService.create(createDiseaseDto);
    }

    @Public()
    @Patch(':id')
    // @ApiBearerAuth()
    // @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Update an existing disease' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the disease to update', example: 1 })
    @ApiBody({ type: UpdateDiseaseDto })
    @ApiResponse({ status: 200, description: 'The disease has been updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @ApiResponse({ status: 404, description: 'Disease not found.' })
    @CommonApiResponses()
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateDiseaseDto: UpdateDiseaseDto) {
        return await this.diseasesService.update(id, updateDiseaseDto);
    }

    @Public()
    @Delete(':id')
    // @ApiBearerAuth()
    // @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Delete a disease by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of disease to delete', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted disease have been deleted successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @CommonApiResponses()
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.diseasesService.delete(id);
    }

    @Public()
    @Get('id/:id')
    // @ApiBearerAuth()
    // @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Retrieve a disease by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the wanted disease', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted disease have been retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @CommonApiResponses()
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.diseasesService.getById(id);
    }

    @Public()
    @Get('name/:name')
    // @ApiBearerAuth()
    // @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Retrieve a disease by name' })
    @ApiParam({ name: 'name', required: true, type: String, description: 'The name of the wanted disease', example: "Covid19" })
    @ApiResponse({ status: 200, description: 'The wanted disease have been retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @CommonApiResponses()
    async getByName(@Param('name') name: string) {
        return await this.diseasesService.getByName(name);
    }

    @Public()
    @Get()
    // @ApiBearerAuth()
    // @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Retrieve all diseases' })
    @ApiResponse({ status: 200, description: 'The list of sorted diseases has been retrieved successfully.' })
    @CommonApiResponses()
    async getAll() {
        return await this.diseasesService.getAll();
    }
}
