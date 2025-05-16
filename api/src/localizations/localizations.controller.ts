import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { LocalizationService } from './localizations.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateLocalizationDto } from './dto/CreateLocalizationDto.dto';
import { Public, Roles } from '../auth/decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CommonApiResponses } from '../common/api-response.decorator';
import { UpdateLocalizationDto } from './dto/UpdateLocalizationDto.dto';
import { UserRole } from '../roles/userRole.enum';

@Controller('localization')
@UseGuards(RolesGuard)
export class LocalizationController {
    constructor(
        private localizationService: LocalizationService,
    ) { }

    @Public()
    @Post('create')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Create a new localization' })
    @ApiBody({ type: CreateLocalizationDto })
    @ApiResponse({ status: 201, description: 'The localization has been created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @CommonApiResponses()
    async create(@Body() createLocalizationDto: CreateLocalizationDto) {
        return await this.localizationService.create(createLocalizationDto);
    }

    @Public()
    @Patch(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Update an existing localization' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the localization to update', example: 1 })
    @ApiBody({ type: UpdateLocalizationDto })
    @ApiResponse({ status: 200, description: 'The localization has been updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @ApiResponse({ status: 404, description: 'Localization not found.' })
    @CommonApiResponses()
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateLocalizationDto: UpdateLocalizationDto) {
        return await this.localizationService.update(id, updateLocalizationDto);
    }

    @Public()
    @Delete(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Delete a localization by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of localization to delete', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted localization has been deleted successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @CommonApiResponses()
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.localizationService.delete(id);
    }

    @Public()
    @Get('id/:id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Retrieve a localization by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the wanted localization', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted localization has been retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @CommonApiResponses()
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.localizationService.getById(id);
    }

    @Public()
    @Get()
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Retrieve all localizations' })
    @ApiResponse({ status: 200, description: 'The list of sorted localizations has been retrieved successfully.' })
    @CommonApiResponses()
    async getAll() {
        return await this.localizationService.getAll();
    }
}
