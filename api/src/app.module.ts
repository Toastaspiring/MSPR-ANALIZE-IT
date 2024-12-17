import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LocalizationModule } from './localizations/localizations.module';
import { ReportCaseModule } from './reportCases/reportCases.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Localization } from './localizations/localization.entity';
import { ReportCase } from './reportCases/reportCases.entitiy';
import { DiseasesModule } from './diseases/diseases.module';
import { Disease } from './diseases/disease.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'mspr_user',
      password: 'mspr_user',
      database: 'mspr_database',
      entities: [Localization,ReportCase,Disease],
    }),
    ReportCaseModule, 
    LocalizationModule, 
    DiseasesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
