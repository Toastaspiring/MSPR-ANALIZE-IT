import { Module } from '@nestjs/common';
import { LocalizationController } from './localizations.controller';
import { LocalizationService } from './localizations.service';
import { Localization } from './localization.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Localization]),
    UsersModule
  ],
  controllers: [LocalizationController],
  providers: [LocalizationService]
})
export class LocalizationModule { }
