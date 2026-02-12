import { JwtService } from '@nestjs/jwt';
import { AuthenticationError } from '../exceptions/AuthenticationError';

export class TokenManagerService {
  constructor(private jwtService: JwtService) {}

  generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
    });
  }
  async generateRefreshToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
    });
  }
  async verifyRefreshToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });
    } catch {
      throw new AuthenticationError('Refresh token tidak valid atau expired');
    }
  }
}
