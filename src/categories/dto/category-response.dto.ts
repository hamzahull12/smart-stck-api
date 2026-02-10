import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics', description: 'Nama kategori' })
  name: string;

  @ApiProperty({ example: 'Gadgets and electronic devices', required: false })
  description?: string;
}
