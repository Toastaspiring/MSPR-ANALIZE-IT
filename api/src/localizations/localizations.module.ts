import { Module } from '@nestjs/common';
import { LocalizationController } from './localizations.controller';
import { LocalizationService } from './localizations.service';
import { Localization } from './localization.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Localization])],
  controllers: [LocalizationController],
  providers: [LocalizationService]
})
export class LocalizationModule {}
