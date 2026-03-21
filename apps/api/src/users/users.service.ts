import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOrCreate(githubProfile: any): Promise<User> {
    const githubId = githubProfile.id;
    let user = await this.usersRepository.findOne({ where: { githubId } });

    if (!user) {
      user = this.usersRepository.create({
        githubId,
        email: githubProfile.emails?.[0]?.value,
        displayName: githubProfile.displayName || githubProfile.username,
        avatarUrl: githubProfile.photos?.[0]?.value,
      });
      await this.usersRepository.save(user);
    }

    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
