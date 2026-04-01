import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface JwtUser {
  email: string;
  id: string;
  githubId: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(user: JwtUser) {
    const payload = {
      email: user.email,
      sub: user.id,
      githubId: user.githubId,
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
