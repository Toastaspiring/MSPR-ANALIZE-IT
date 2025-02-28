import { IsOptional, IsString, ValidateIf } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateLocalizationDto } from './CreateLocalizationDto.dto';

export class UpdateLocalizationDto extends PartialType(CreateLocalizationDto) {
    @ValidateIf((o) => Object.values(o).some((value) => value !== undefined))
    @IsOptional()
    _atLeastOneField?: boolean;
}
