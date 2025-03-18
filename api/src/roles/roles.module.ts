import { Module, forwardRef } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    forwardRef(() => UsersModule),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [TypeOrmModule]
})
export class RolesModule { }
