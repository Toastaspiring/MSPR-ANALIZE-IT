import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/CreateUserDto.dto';
import { Public } from './decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) { }

  // TODO doc

  @Public()
  @Post('login')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User logged in successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal server error occurred while logging in.' })
  async signIn(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signIn(createUserDto);
  }
}
