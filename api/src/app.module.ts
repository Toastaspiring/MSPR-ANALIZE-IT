import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LocalizationModule } from './localizations/localizations.module';
import { CaseModule } from './cases/cases.module';

@Module({
  imports: [LocalizationModule, CaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
