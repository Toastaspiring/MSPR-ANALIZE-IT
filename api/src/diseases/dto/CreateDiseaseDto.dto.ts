import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiseaseDto{
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: "Covid19", description: 'Name of the disease' })
    name: string;
}