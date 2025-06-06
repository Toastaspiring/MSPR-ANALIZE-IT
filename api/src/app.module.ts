import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LocalizationModule } from './localizations/localizations.module';
import { ReportCaseModule } from './reportCases/reportCases.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Localization } from './localizations/localization.entity';
import { ReportCase } from './reportCases/reportCases.entity';
import { DiseasesModule } from './diseases/diseases.module';
import { Disease } from './diseases/disease.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LocalizationDataModule } from './localization-data/localization-data.module';
import { LocalizationData } from './localization-data/localization-data.entity';
import { Role } from './roles/role.entity';
import { RolesModule } from './roles/roles.module';
import { User } from './users/user.entity';
import { LanguageModule } from './languages/languages.module';
import { Language } from './languages/language.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost', // should use 'host.docker.internal'
      port: 3306,
      username: 'mspr_user',
      password: 'mspr_user',
      database: 'mspr_database',
      entities: [
        Localization,
        LocalizationData,
        Language,
        ReportCase,
        Disease,
        User,
        Role
      ],
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    ReportCaseModule,
    LocalizationModule,
    LocalizationDataModule,
    LanguageModule,
    DiseasesModule,
    LanguageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
