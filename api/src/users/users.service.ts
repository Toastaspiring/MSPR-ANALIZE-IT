
import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'admin',
      password: 'admin',
    },
    {
      userId: 2,
      username: 'user',
      password: 'user',
    },
  ];

  async findOne(username: string, passwordHash: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username && user.password === passwordHash);
  }
}
