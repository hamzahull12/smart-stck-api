import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import {
  CreateProduct,
  ProductQueryFilter,
} from './schema/create-product.schema';
import { nanoid } from 'nanoid';
import { ErrorConflict } from 'src/commons/exceptions/ErrorConflict';
import { NotFoundError } from 'src/commons/exceptions/NotFoundError';
import { UpdateProductDto } from './dto/update-product.dto';
import { InvariantError } from 'src/commons/exceptions/InvariantError';

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

  async getAllproduct(filters: ProductQueryFilter) {
    const { search, category_id } = filters;

    let queryText = `SELECT p.id, p.name, p.sku, p.price, p.stock, c.name AS category_name FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL`;

    const values: any[] = [];

    if (search) {
      values.push(`%${search}%`);
      queryText += ` AND p.name ILIKE $${values.length}`;
    }
    if (category_id) {
      values.push(category_id);
      queryText += ` AND p.category_id = $${values.length}`;
    }

    queryText += ` ORDER BY p.created_at DESC`;
    const result = await this.pool.query(queryText, values);
    return result.rows;
  }

  async getProductByid(id: string) {
    const query = {
      text: `SELECT p.id, p.name, p.sku, p.price, p.stock, p.description,
      c.name AS category_name FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1 AND deleted_at IS NULL`,
      values: [id],
    };

    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError(`Produk dengan ID ${id} tidak ditemukan`);
    }
    return result.rows[0];
  }

  async softDeleteProduct(id: string) {
    const query = {
      text: 'UPDATE products SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Produk tidak ditemukan atau sudah dihapus');
    }
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.getProductByid(id);

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (fields.length === 0) {
      throw new InvariantError('Tidak ada data yang diubah');
    }

    values.push(id);
    const query = `
    UPDATE products 
    SET ${fields.join(', ')}, updated_at = NOW() 
    WHERE id = $${idx} AND deleted_at IS NULL
    RETURNING *
  `;
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }
}
