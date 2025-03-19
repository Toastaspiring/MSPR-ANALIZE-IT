import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { CommonApiResponses } from '../common/api-response.decorator';
import { Roles } from '../auth/decorator';
import { UserRole } from '../roles/userRole.enum';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.USER)
    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({ schema: { properties: { username: { example: 'username' }, password: { example: 'password' } } } })
    @ApiResponse({ status: 201, description: 'The user has been created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    @CommonApiResponses()
    async create(@Body() body: { username: string, password: string }) {
        return await this.usersService.create(body.username, body.password);
    }

    @Patch('password')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Update a user\'s password' })
    @ApiBody({ schema: { properties: { username: { example: 'username' }, newPassword: { example: 'newPassword' } } } })
    @ApiResponse({ status: 200, description: 'The user\'s password has been updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    @CommonApiResponses()
    async updatePassword(@Body() body: { username: string, newPassword: string }) {
        return await this.usersService.updatePassword(body.username, body.newPassword);
    }

    @Patch('username/:id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Update a user\'s username' })
    @ApiParam({ name: 'id', required: true, description: 'The id of the user', example: 1 })
    @ApiBody({ schema: { properties: { newUsername: { example: 'newUsername' } } } })
    @ApiResponse({ status: 200, description: 'The user\'s username has been updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    @CommonApiResponses()
    async updateUsername(@Param('id', ParseIntPipe) id: number, @Body() body: { newUsername: string }) {
        return await this.usersService.updateUsername(id, body.newUsername);
    }

    @Patch('role/:id')
    @ApiBearerAuth()
    @Roles(UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Update a user\'s role' })
    @ApiParam({ name: 'id', required: true, description: 'The id of the user', example: 1 })
    @ApiBody({ schema: { properties: { roleId: { example: '1' } } } })
    @ApiResponse({ status: 200, description: 'The user\'s role has been updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    @CommonApiResponses()
    async updateRole(@Param('id', ParseIntPipe) id: number, @Body() body: { roleId: number }) {
        return await this.usersService.updateRole(id, body.roleId);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Delete a user by id' })
    @ApiParam({ name: 'id', required: true, description: 'The id of user to delete', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted user has been deleted successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @CommonApiResponses()
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.usersService.delete(id);
    }

    @Get('id/:id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Retrieve a user by id' })
    @ApiParam({ name: 'id', required: true, description: 'The id of the wanted user', example: 1 })
    @ApiResponse({ status: 200, description: 'The wanted user has been retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @CommonApiResponses()
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.usersService.getById(id);
    }

    @Get()
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Retrieve all users' })
    @ApiResponse({ status: 200, description: 'The list of users has been retrieved successfully.' })
    @CommonApiResponses()
    async getAll() {
        return await this.usersService.getAll();
    }
}
