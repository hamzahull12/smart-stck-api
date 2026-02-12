// products/dto/update-product.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  sku?: string;

  @ApiPropertyOptional()
  price?: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  category_id?: string;
}
