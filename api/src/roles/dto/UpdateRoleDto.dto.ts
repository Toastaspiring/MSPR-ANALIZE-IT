import { IsOptional, IsString, ValidateIf } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './CreateRoleDto.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
    @ValidateIf((o) => Object.values(o).some((value) => value !== undefined))
    @IsOptional()
    _atLeastOneField?: boolean;
}
