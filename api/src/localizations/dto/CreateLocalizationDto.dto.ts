import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocalizationDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: "France", description: 'Name of the country' })
    country: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: "Europe", description: 'Name of the continent' })
    continent: string;
}
