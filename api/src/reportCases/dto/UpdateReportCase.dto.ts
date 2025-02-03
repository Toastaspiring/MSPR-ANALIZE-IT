import { IsOptional, ValidateIf } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateReportCaseDto } from './CreateReportCase.dto';

export class UpdateReportCaseDto extends PartialType(CreateReportCaseDto) {
    // Must have at least one field 
    @IsOptional()
    @ValidateIf((o) => Object.values(o).some((value) => value !== undefined))
    _atLeastOneField?: boolean;
}