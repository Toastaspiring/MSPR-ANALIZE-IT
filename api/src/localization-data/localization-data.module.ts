import { Module } from '@nestjs/common';
import { LocalizationDataController } from './localization-data.controller';
import { LocalizationDataService } from './localization-data.service';
import { LocalizationData } from './localization-data.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([LocalizationData])],
  controllers: [LocalizationDataController],
  providers: [LocalizationDataService]
})
export class LocalizationDataModule { }