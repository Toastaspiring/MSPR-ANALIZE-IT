import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocalizationDataDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ example: 1, description: 'ID of the localization' })
    localizationId: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ example: 1000000, description: 'Number of inhabitants' })
    inhabitantsNumber: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ example: 60, description: 'Population concentration' })
    populationConcentration: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ example: 75, description: 'Vaccination rate' })
    vaccinationRate: number;
}
