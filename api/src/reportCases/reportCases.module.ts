import { Module } from '@nestjs/common';
import { ReportCaseController } from './reportCases.controller';
import { ReportCaseService } from './reportCases.service';
import { ReportCase } from './reportCases.entitiy';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ReportCase])],
  controllers: [ReportCaseController],
  providers: [ReportCaseService]
})
export class ReportCaseModule {}
