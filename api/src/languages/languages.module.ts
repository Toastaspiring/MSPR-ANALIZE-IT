import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Language } from './language.entity';
import { LanguageService } from './languages.service';
import { LanguageController } from './languages.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Language]),
    forwardRef(() => UsersModule),
  ],
  controllers: [LanguageController],
  providers: [LanguageService],
  exports: [TypeOrmModule],
})
export class LanguageModule { }
