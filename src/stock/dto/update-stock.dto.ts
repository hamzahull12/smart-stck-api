import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class UpdateStockDto {
  @ApiProperty({
    example: 'prod-V1StG_64CKLOfAt9rk_f0',
    description: 'ID produk',
  })
  productId: string;

  @ApiProperty({ example: 10, description: 'Jumlah barang' })
  amount: number;

  @ApiProperty({
    example: 'IN',
    enum: ['IN', 'OUT'],
    description: 'Tipe mutasi',
  })
  type: 'IN' | 'OUT';

  @ApiProperty({ example: 'Restock supplier', required: false })
  reason?: string;
}

export const UpdateStockSchema = Joi.object({
  productId: Joi.string().required(),
  amount: Joi.number().integer().min(1).required(),
  type: Joi.string().valid('IN', 'OUT').required(),
  reason: Joi.string().max(255).allow('', null).optional(),
});
