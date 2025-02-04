
import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

export enum UserRole {
  ADMIN = 0,
  USER = 1,
}

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'admin',
      password: 'admin',
      roleId: UserRole.ADMIN
    },
    {
      userId: 2,
      username: 'user',
      password: 'user',
      roleId: UserRole.USER
    },
  ];

  async findOne(username: string, passwordHash: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username && user.password === passwordHash);
  }
}
