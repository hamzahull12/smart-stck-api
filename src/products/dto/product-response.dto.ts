import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'category-vuG3nOSY-x',
    description: 'ID Kategori dari tabel categories',
  })
  category_id: string;

  @ApiProperty({ example: 'Macbook Pro M3 14-inch' })
  name: string;

  @ApiProperty({ example: 'MAC-M3-14-2024', description: 'SKU harus unik' })
  sku: string;

  @ApiProperty({ example: 28500000 })
  price: number;

  @ApiPropertyOptional({ example: 'Chip M3, RAM 16GB, SSD 512GB' })
  description?: string;
}
