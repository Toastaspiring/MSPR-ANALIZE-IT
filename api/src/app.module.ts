import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LocalizationModule } from './localizations/localizations.module';
import { ReportCaseModule } from './reportCases/reportCases.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Localization } from './localizations/localization.entity';
import { ReportCase } from './reportCases/reportCases.entitiy';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Localization,ReportCase],
      synchronize: true
    }),
    ReportCaseModule, LocalizationModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
