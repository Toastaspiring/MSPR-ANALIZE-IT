import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'Admin', description: 'Name of the role' })
    roleName: string;
}
