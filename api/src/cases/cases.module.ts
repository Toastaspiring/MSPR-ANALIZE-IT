import { Module } from '@nestjs/common';
import { CaseController } from './cases.controller';
import { CaseService } from './cases.service';
import { Case } from './case.entitiy';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Case])],
  controllers: [CaseController],
  providers: [CaseService]
})
export class CaseModule {}
