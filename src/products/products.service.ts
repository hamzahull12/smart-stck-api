import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateProduct } from './schema/create-product.schema';
import { nanoid } from 'nanoid';
import { ErrorConflict } from 'src/commons/exceptions/ErrorConflict';
import { NotFoundError } from 'src/commons/exceptions/NotFoundError';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('DATABASE_POOL')
    private readonly pool: Pool,
  ) {}

  async addProduct(payload: CreateProduct) {
    const { category_id, name, sku, price, stock, description } = payload;
    const id = `prod-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO products (id, category_id, name, sku, price, stock, description) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      values: [id, category_id, name, sku, price, stock, description],
    };

    try {
      const result = await this.pool.query(query);
      return result.rows[0].id;
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ErrorConflict('SKU produk sudah terdaftar');
      }
      if (error.code === '23503') {
        throw new NotFoundError('Kategori tidak ditemukan');
      }
      throw error;
    }
  }
}
