import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLanguageDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: "fr", description: 'Language key' })
    lang: string;
}
