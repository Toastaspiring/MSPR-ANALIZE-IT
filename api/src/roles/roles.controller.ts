import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Public, Roles } from '../auth/decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CommonApiResponses } from '../common/api-response.decorator';
import { CreateRoleDto } from './dto/CreateRoleDto.dto';
import { UpdateRoleDto } from './dto/UpdateRoleDto.dto';
import { UserRole } from './userRole.enum';

@Controller('roles')
@UseGuards(RolesGuard)
export class RolesController {
    constructor(
        private rolesService: RolesService,
    ) { }

    @Public()
    @Post('create')
    @ApiBearerAuth()
    @Roles(UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Create a new role' })
    @ApiBody({ type: CreateRoleDto })
    @ApiResponse({ status: 201, description: 'The role has been created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @CommonApiResponses()
    async create(@Body() createRoleDto: CreateRoleDto) {
        return await this.rolesService.create(createRoleDto);
    }

    @Public()
    @Patch(':id')
    @ApiBearerAuth()
    @Roles(UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Update an existing role' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the role to update', example: 1 })
    @ApiBody({ type: UpdateRoleDto })
    @ApiResponse({ status: 200, description: 'The role has been updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
    @ApiResponse({ status: 404, description: 'Role not found.' })
    @CommonApiResponses()
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
        return await this.rolesService.update(id, updateRoleDto);
    }

    @Public()
    @Delete(':id')
    @ApiBearerAuth()
    @Roles(UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Delete a role by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the role to delete', example: 1 })
    @ApiResponse({ status: 200, description: 'The role has been deleted successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @CommonApiResponses()
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.rolesService.delete(id);
    }

    @Public()
    @Get('id/:id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Retrieve a role by id' })
    @ApiParam({ name: 'id', required: true, type: Number, description: 'The id of the wanted role', example: 1 })
    @ApiResponse({ status: 200, description: 'The role has been retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @CommonApiResponses()
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.rolesService.getById(id);
    }

    @Public()
    @Get()
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Retrieve all roles' })
    @ApiResponse({ status: 200, description: 'The list of roles has been retrieved successfully.' })
    @CommonApiResponses()
    async getAll() {
        return await this.rolesService.getAll();
    }
}
