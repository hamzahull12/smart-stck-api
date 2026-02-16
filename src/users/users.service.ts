import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateUserDto, UserEntity } from './dto/register-dto';
import { nanoid } from 'nanoid';
import { ErrorConflict } from 'src/commons/exceptions/ErrorConflict';
import { DATABASE_POOL } from 'src/database/database.module';
import bcrypt from 'bcrypt';
import { AuthenticationError } from 'src/commons/exceptions/AuthenticationError';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_POOL)
    private readonly pool: Pool,
  ) {}

  async createUser(dto: CreateUserDto) {
    const { username, password, fullname, role = 'staf' } = dto;

    await this.findUsernameIfExist(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: `INSERT INTO users (id, username, password, fullname, role) 
             VALUES($1,$2,$3,$4,$5) RETURNING id`,
      values: [id, username, hashedPassword, fullname, role],
    };

    const result = await this.pool.query(query);
    return result.rows[0].id;
  }

  async findUsernameIfExist(username: string) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this.pool.query(query);
    if (result.rowCount) {
      throw new ErrorConflict('username sudah digunakan');
    }
  }

  async getUsername(username: string): Promise<UserEntity | undefined> {
    const query = {
      text: 'SELECT id, username, password, fullname, role FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async cekRefreshToken(token: string): Promise<UserEntity | undefined> {
    const query = {
      text: 'SELECT id, username, role FROM users WHERE refresh_token = $1',
      values: [token],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  // membuat refreshToken ketika login
  async updateRefreshToken(userId: string, token: string) {
    const query = {
      text: 'UPDATE users SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      values: [token, userId],
    };

    await this.pool.query(query);
  }

  //hapus refreshToken ketika login
  async deleteRefreshToken(userId: string) {
    const query = {
      // Kita set refresh_token jadi NULL untuk menghapus sesi login
      text: 'UPDATE users SET refresh_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      values: [userId],
    };
    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new AuthenticationError('credential anda tidak valid');
    }
  }
}
