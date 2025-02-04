import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function CommonApiResponses() {
    return applyDecorators(
        ApiResponse({ status: 401, description: 'Unauthorized.' }),
        ApiResponse({ status: 403, description: 'Invalid token.' }),
        ApiResponse({ status: 500, description: 'Internal server error.' }),
    );
}