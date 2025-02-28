import { IsOptional, IsNumber, ValidateIf } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateLocalizationDataDto } from './CreateLocalizationDataDto.dto';

export class UpdateLocalizationDataDto extends PartialType(CreateLocalizationDataDto) {
    @ValidateIf((o) => Object.values(o).some((value) => value !== undefined))
    @IsOptional()
    _atLeastOneField?: boolean;
}
