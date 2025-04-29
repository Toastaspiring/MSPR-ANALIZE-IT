import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './decorator';
import { UserLoginDto } from '../users/dto/UserLoginDto.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) { }

  // @Public()
  // @Post('login')
  // @ApiBody({ type: UserLoginDto })
  // @ApiResponse({ status: 201, description: 'User logged in successfully.' })
  // @ApiResponse({ status: 400, description: 'Invalid body parameters.' })
  // @ApiResponse({ status: 401, description: 'Unauthorized.' })
  // @ApiResponse({ status: 500, description: 'Internal server error occurred while logging in.' })
  // async signIn(@Body() createUserDto: UserLoginDto) {
  //   return await this.authService.signIn(createUserDto);
  // }
}
