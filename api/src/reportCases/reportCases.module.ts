import { Module } from '@nestjs/common';
import { ReportCaseController } from './reportCases.controller';
import { ReportCaseService } from './reportCases.service';
import { ReportCase } from './reportCases.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportCase]),
    UsersModule
  ],
  controllers: [ReportCaseController],
  providers: [ReportCaseService]
})
export class ReportCaseModule { }
