import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import type { Profile } from 'passport-github2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOrCreate(githubProfile: Profile): Promise<User> {
    const githubId = String(githubProfile.id);
    let user = await this.usersRepository.findOne({ where: { githubId } });

    if (!user) {
      user = this.usersRepository.create({
        githubId,
        email: (githubProfile.emails as { value: string }[] | undefined)?.[0]
          ?.value,
        displayName:
          githubProfile.displayName ||
          (githubProfile as Profile & { username?: string }).username,
        avatarUrl: (
          githubProfile.photos as { value: string }[] | undefined
        )?.[0]?.value,
      });
      await this.usersRepository.save(user);
    }

    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
