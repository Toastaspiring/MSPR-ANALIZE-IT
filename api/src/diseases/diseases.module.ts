import { Module } from '@nestjs/common';
import { DiseasesService } from './diseases.service';
import { DiseasesController } from './diseases.controller';
import { Disease } from './disease.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Disease])],
  providers: [DiseasesService],
  controllers: [DiseasesController]
})
export class DiseasesModule {}
