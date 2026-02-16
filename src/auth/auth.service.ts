import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from 'src/commons/exceptions/NotFoundError';
import { TokenManagerService } from 'src/commons/security/Token-Manager.service';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { AuthenticationError } from 'src/commons/exceptions/AuthenticationError';
import { DATABASE_POOL } from 'src/database/database.module';
import { Pool } from 'pg';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_POOL)
    private readonly pool: Pool,
    private readonly usersService: UsersService,
    private readonly tokenManager: TokenManagerService,
  ) {}

  async login(dto: LoginDto) {
    try {
      const user = await this.usersService.getUsername(dto.username);
      if (!user) {
        throw new NotFoundError('Username tidak ditemukan');
      }

      // 2. Validasi Keberadaan User & Password
      // TypeScript sekarang tahu user.password adalah string karena UserEntity
      if (!user || !(await bcrypt.compare(dto.password, user.password))) {
        throw new AuthenticationError('credential anda salah');
      }

      const payload = {
        sub: user.id,
        username: user.username,
        role: user.role,
      };

      // 3.cetakk token
      const accessToken = await this.tokenManager.generateAccessToken(payload);
      const refreshToken =
        await this.tokenManager.generateRefreshToken(payload);

      await this.usersService.updateRefreshToken(user.id, refreshToken);

      return {
        status: 'success',
        message: 'Login berhasil',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
        },
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    await this.tokenManager.verifyRefreshToken(refreshToken);

    const user = await this.usersService.cekRefreshToken(refreshToken);
    if (!user) {
      throw new AuthenticationError(
        'Refresh token tidak valid atau sudah tidak digunakan',
      );
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    const accessToken = await this.tokenManager.generateAccessToken(payload);
    return {
      status: 'success',
      message: 'Access token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  async logout(userId: string, refreshToken: string) {
    const query = {
      text: 'SELECT id FROM users WHERE id = $1 AND refresh_token = $2',
      values: [userId, refreshToken],
    };
    const res = await this.pool.query(query);

    if (res.rowCount === 0) {
      throw new AuthenticationError('Token tidak valid atau sudah tidak aktif');
    }

    await this.usersService.deleteRefreshToken(userId);
    return {
      status: 'success',
      message: 'berhasil logout',
    };
  }
}
