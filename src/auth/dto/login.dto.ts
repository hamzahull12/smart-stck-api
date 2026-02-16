import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class LoginDto {
  @ApiProperty({
    example: 'admin_gudang',
  })
  username: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1Ni...',
    description: 'Masukkan refresh token yang didapat saat login',
  })
  refreshToken: string;
}

export class LogoutDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token yang ingin dihapus dari database',
  })
  refreshToken: string;
}

export const LoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const RefreshToken = Joi.object({
  refreshToken: Joi.string().required(),
});
