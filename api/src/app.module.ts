import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LocalizationModule } from './localizations/localizations.module';
import { ReportCaseModule } from './cases/reportCases.module';

@Module({
  imports: [LocalizationModule, ReportCaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
