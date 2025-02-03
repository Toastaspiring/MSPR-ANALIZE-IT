import { IsOptional, ValidateIf } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateDiseaseDto } from './CreateDiseaseDto.dto';

export class UpdateDiseaseDto extends PartialType(CreateDiseaseDto) {
    
    @ValidateIf((o) => Object.values(o).some((value) => value !== undefined))
        @IsOptional()
    _atLeastOneField?: boolean;
}