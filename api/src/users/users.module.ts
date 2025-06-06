
import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { RolesModule } from '../roles/roles.module';
import { LocalizationModule } from 'src/localizations/localizations.module';
import { LanguageModule } from 'src/languages/languages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RolesModule,
    LanguageModule,
    forwardRef(() => LocalizationModule)
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule { }
