import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { LocalizationDataService } from './localization-data.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Public, Roles } from '../auth/decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CommonApiResponses } from '../common/api-response.decorator';
import { CreateLocalizationDataDto } from './dto/CreateLocalizationDataDto.dto';
import { UpdateLocalizationDataDto } from './dto/UpdateLocalizationDataDto.dto';
import { UserRole } from '../roles/userRole.enum';

@Controller('localization-data')
@UseGuards(RolesGuard)
export class LocalizationDataController {
    constructor(
        private localizationDataService: LocalizationDataService,
    ) { }

    @Public()
    @Post('create')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Create a new localization data' })
    @ApiBody({ type: CreateLocalizationDataDto })
    @ApiResponse({ status: 201, description: 'The localization data has been created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @CommonApiResponses()
    async create(@Body() createLocalizationDataDto: CreateLocalizationDataDto) {
        return await this.localizationDataService.create(createLocalizationDataDto);
    }

    @Public()
    @Patch(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Update an existing localization data' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the localization data to update', example: 1 })
    @ApiBody({ type: UpdateLocalizationDataDto })
    @ApiResponse({ status: 200, description: 'The localization data has been updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @ApiResponse({ status: 404, description: 'Localization data not found.' })
    @CommonApiResponses()
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateLocalizationDataDto: UpdateLocalizationDataDto) {
        return await this.localizationDataService.update(id, updateLocalizationDataDto);
    }

    @Public()
    @Delete(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Delete a localization data by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of localization data to delete', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted localization data has been deleted successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @CommonApiResponses()
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.localizationDataService.delete(id);
    }

    @Public()
    @Get('id/:id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Retrieve a localization data by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the wanted localization data', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted localization data has been retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @CommonApiResponses()
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.localizationDataService.getById(id);
    }

    @Public()
    @Get()
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Retrieve all localization data' })
    @ApiResponse({ status: 200, description: 'The list of sorted localization data has been retrieved successfully.' })
    @CommonApiResponses()
    async getAll() {
        return await this.localizationDataService.getAll();
    }
}
