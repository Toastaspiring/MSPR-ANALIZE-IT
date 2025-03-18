import { Module } from '@nestjs/common';
import { LocalizationDataController } from './localization-data.controller';
import { LocalizationDataService } from './localization-data.service';
import { LocalizationData } from './localization-data.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocalizationData]),
    UsersModule
  ],
  controllers: [LocalizationDataController],
  providers: [LocalizationDataService]
})
export class LocalizationDataModule { }