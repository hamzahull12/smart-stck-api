import { JwtService } from '@nestjs/jwt';
import { AuthenticationError } from '../exceptions/AuthenticationError';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenManagerService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(payload: any) {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
    });
  }
  async generateRefreshToken(payload: any) {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
    });
  }
  async verifyRefreshToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });
    } catch {
      throw new AuthenticationError('Refresh token Kadaluarsa');
    }
  }
}
