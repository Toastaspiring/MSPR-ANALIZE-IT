import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserRole } from '../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
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

            if (!requiredRoles.includes(decoded.role)) {
                throw new ForbiddenException('Access denied: Insufficient permissions');
            }

            return true;
        } catch (error) {
            throw new ForbiddenException('Access denied: Invalid token');
        }
    }
}