import { Module } from '@nestjs/common';
import { ReportCaseController } from './reportCases.controller';
import { CaseService } from './reportCases.service';
import { ReportCase } from './reportCases.entitiy';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ReportCase])],
  controllers: [ReportCaseController],
  providers: [CaseService]
})
export class ReportCaseModule {}
