import { Module } from '@nestjs/common';
import { DiseasesService } from './diseases.service';
import { DiseasesController } from './diseases.controller';
import { Disease } from './disease.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Disease]),
    UsersModule
  ],
  providers: [DiseasesService],
  controllers: [DiseasesController]
})
export class DiseasesModule { }
