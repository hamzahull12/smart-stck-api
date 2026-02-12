import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'admin_gudang',
    description: 'Username unik untuk login',
  })
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password minimal 6 karakter',
  })
  password: string;

  @ApiProperty({
    example: 'Budi Santoso',
    description: 'Nama lengkap pengguna',
  })
  fullname: string;

  @ApiProperty({
    example: 'admin',
    enum: ['admin', 'staff'],
    default: 'staff',
    description: 'Hak akses user',
  })
  role?: string;
}
