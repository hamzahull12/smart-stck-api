import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateUserDto } from './dto/register-dto';
import { nanoid } from 'nanoid';
import { ErrorConflict } from 'src/commons/exceptions/ErrorConflict';
import { DATABASE_POOL } from 'src/database/database.module';
import bcrypt from 'bcrypt';

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
}
