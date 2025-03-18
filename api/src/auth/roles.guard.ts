import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
        private usersService: UsersService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<number[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new ForbiddenException('Access denied: No token provided');
        }

        try {
            const token = authHeader.split(' ')[1];
            const decoded = this.jwtService.verify(token);

            const user = await this.usersService.getById(decoded.sub);
            if (!user || !requiredRoles.includes(user.role.id)) {
                throw new ForbiddenException('Access denied: Insufficient permissions');
            }

            return true;
        } catch (error) {
            throw new ForbiddenException('Access denied: Invalid token');
        }
    }
}