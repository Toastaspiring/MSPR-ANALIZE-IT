import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import { UserRole } from '../roles/userRole.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
  ) { }

  // TODO - Verification valid password with regex
  // TODO - Hash password

  async create(login: string, password: string) {
    if (!login || !password) {
      throw new BadRequestException('Invalid login or password.');
    }

    if (await this.repo.findOneBy({ username: login })) {
      throw new BadRequestException('Login already exists.');
    }

    try {
      // Set default role to USER
      const role = await this.roleRepo.findOneBy({ id: UserRole.USER });
      if (!role) {
        throw new NotFoundException('Role not found.');
      }

      const newUser = this.repo.create({ username: login, password: password, role: role });
      return await this.repo.save(newUser);
    }
    catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async updatePassword(login: string, newPassword: string) {
    if (!login || !newPassword) {
      throw new BadRequestException('Invalid login or password.');
    }

    const user = await this.repo.findOneBy({ username: login });
    if (!user) {
      throw new NotFoundException(`User not found with login: ${login}`);
    }

    try {
      user.password = newPassword;
      return await this.repo.save(user);
    } catch (error) {
      console.error('Error updating password:', error);
      throw new InternalServerErrorException('Failed to update password.');
    }
  }

  async updateUserName(id: number, newUsername: string) {
    if (!id || id <= 0) {
      throw new BadRequestException('Invalid id.');
    }

    if (!newUsername) {
      throw new BadRequestException('Invalid username.');
    }

    const user = await this.repo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }

    if (user.username === newUsername) {
      throw new BadRequestException('New username is the same as the old one.');
    }

    if (await this.repo.findOneBy({ username: newUsername })) {
      throw new BadRequestException('Username already exists.');
    }

    try {
      await this.repo.update(user.id, { username: newUsername });
      return await this.repo.findOneBy({ id });
    } catch (error) {
      console.error('Error updating username:', error);
      throw new InternalServerErrorException('Failed to update username.');
    }
  }

  async updateRole(id: number, roleId: number) {
    if (!id || id <= 0) {
      throw new BadRequestException('Invalid id.');
    }

    if (!roleId || roleId <= 0) {
      throw new BadRequestException('Invalid role id.');
    }

    const user = await this.repo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }

    const role = await this.roleRepo.findOneBy({ id: roleId }); // Vérification de l'existence du rôle
    if (!role) {
      throw new NotFoundException(`Role not found with id: ${roleId}`);
    }

    try {
      await this.repo.update(user.id, { role: role });
      return await this.repo.findOneBy({ id });
    } catch (error) {
      console.error('Error updating role:', error);
      throw new InternalServerErrorException('Failed to update role.');
    }
  }

  async delete(id: number) {
    if (!id || id <= 0) {
      throw new BadRequestException('Invalid id.');
    }

    const user = await this.repo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }

    try {
      const result = await this.repo.delete({ id });
      if (result.affected === 0) {
        throw new NotFoundException(`User not found with id: ${id}`);
      }
      return { message: `User with id ${id} successfully deleted.` };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new InternalServerErrorException('Failed to delete user.');
    }
  }

  async getById(id: number) {
    if (!id || id <= 0) {
      throw new BadRequestException('Invalid id.');
    }

    return await this.repo.findOneBy({ id });
  }

  async findByLogin(username: string, passwordHash: string) {
    if (!username || !passwordHash) {
      throw new BadRequestException('Invalid username or password.');
    }

    return await this.repo.findOneBy({ username: username, password: passwordHash });
  }

  async getAll() {
    return await this.repo.find();
  }
}
