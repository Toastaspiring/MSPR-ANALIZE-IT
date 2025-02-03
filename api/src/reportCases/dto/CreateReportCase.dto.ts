import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateReportCaseDto{
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    @ApiProperty({ example: 100, description: 'Total confirmed cases' })
    totalConfirmed: number;

    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    @ApiProperty({ example: 100, description: 'Total deaths' })
    totalDeath: number;

    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    @ApiProperty({ example: 100, description: 'Total active cases' })
    totalActive: number;

    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    @ApiProperty({ example: 1, description: 'Localization id' })
    localizationId: number;

    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    @ApiProperty({ example: 1, description: 'Disease id' })
    diseaseId: number;
    
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    @ApiProperty({ example: '1738405852298', description: 'Report date in timestamp (milliseconds)' })
    date: number;
}