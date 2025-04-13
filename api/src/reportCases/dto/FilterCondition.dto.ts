import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDefined, IsOptional, IsIn } from 'class-validator';

export class FilterConditionDto {
    @ApiProperty({
        description: 'The logic operator ID used to combine conditions',
        example: 'AND',
        enum: ['AND', 'OR'],
    })
    @IsNotEmpty()
    @IsString()
    @IsIn(['AND', 'OR'])
    @IsOptional()
    logicOperator: string;

    @ApiProperty({ description: 'The field to filter on', example: 'totalConfirmed' })
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    field: string;

    @ApiProperty({
        description: 'The comparison operator to use',
        example: '=',
        enum: ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'NOT LIKE']
    })
    @IsNotEmpty()
    @IsString()
    @IsIn(['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'NOT LIKE'])
    @IsOptional()
    comparisonOperator: string;

    @ApiProperty({ description: 'The value to compare against', example: 100 })
    @IsDefined()
    @IsOptional()
    value: any;
}