import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FilterConditionDto } from './FilterCondition.dto';

export class FilterConditionGroupDto {
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

    @ApiProperty({
        description: 'An array of conditions which can be either FilterConditionDto or nested FilterConditionGroupDto',
        type: [FilterConditionDto],
    })
    @IsArray()
    @IsNotEmpty()
    @IsOptional()
    conditions: (FilterConditionDto | FilterConditionGroupDto)[];
}