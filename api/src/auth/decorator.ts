import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/users.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);