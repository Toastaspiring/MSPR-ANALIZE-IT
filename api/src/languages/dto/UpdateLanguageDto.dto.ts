import { IsOptional, IsString, ValidateIf } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateLanguageDto } from './CreateLanguageDto.dto';

export class UpdateLanguageDto extends PartialType(CreateLanguageDto) {
    @ValidateIf((o) => Object.values(o).some((value) => value !== undefined))
    @IsOptional()
    _atLeastOneField?: boolean;
}
