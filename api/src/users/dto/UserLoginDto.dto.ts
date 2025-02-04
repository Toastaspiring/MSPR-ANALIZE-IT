import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: "user", description: 'User name' })
    username: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: "password", description: "User's password" })
    password: string;
}