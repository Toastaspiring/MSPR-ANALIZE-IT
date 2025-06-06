import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { LanguageService } from './languages.service';
import { Public, Roles } from '../auth/decorator';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateLanguageDto } from './dto/CreateLanguageDto.dto';
import { UserRole } from '../roles/userRole.enum';
import { CommonApiResponses } from '../common/api-response.decorator';

@Controller('languages')
@UseGuards(RolesGuard)
export class LanguageController {
    constructor(
        private languagesService: LanguageService,
    ) { }

    @Public()
    @Post('create')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Create a new language' })
    @ApiResponse({ status: 201, description: 'The language has been created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @CommonApiResponses()
    async create(@Body() createLanguageDto: CreateLanguageDto) {
        return await this.languagesService.create(createLanguageDto);
    }

    @Public()
    @Patch(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Update an existing language' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the language to update', example: 1 })
    @ApiResponse({ status: 200, description: 'The language has been updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @ApiResponse({ status: 404, description: 'Language not found.' })
    @CommonApiResponses()
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateLanguageDto: CreateLanguageDto) {
        return await this.languagesService.update(id, updateLanguageDto);
    }

    @Public()
    @Delete(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Delete a language by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of language to delete', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted language has been deleted successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @CommonApiResponses()
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.languagesService.delete(id);
    }

    @Public()
    @Get(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Get a language by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the language to get', example: 1 })
    @ApiResponse({ status: 200, description: 'The language has been retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @CommonApiResponses()
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.languagesService.getById(id);
    }

    @Public()
    @Get()
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Get all languages' })
    @ApiResponse({ status: 200, description: 'The languages have been retrieved successfully.' })
    @CommonApiResponses()
    async getAll() {
        return await this.languagesService.getAll();
    }
}
