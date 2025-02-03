
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/CreateUserDto.dto';
import { isEmpty, IsEmpty } from 'class-validator';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }

  async signIn(createUserDto: CreateUserDto): Promise<{ access_token: string }> {
    if (!createUserDto || isEmpty(createUserDto)) {
      throw new BadRequestException('Invalid data: DTO is required.');
    }

    const username = createUserDto.username;
    const password = createUserDto.password;

    if (!username?.trim() || !password?.trim()) {
      throw new BadRequestException('Invalid username or password.');
    }

    const user = await this.usersService.findOne(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = { sub: user.userId, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
