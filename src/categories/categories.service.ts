import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { ErrorConflict } from 'src/commons/exceptions/ErrorConflict';
import { isPostgresError } from 'src/commons/utils/is-postgres-error';
import { Category } from './entities/category.entity';
import { NotFoundError } from 'src/commons/exceptions/NotFoundError';
import { nanoid } from 'nanoid';
import { CreateCategory } from './interfaces/category.interface';

type InsertCategory = {
  id: string;
};

@Injectable()
export class CategoriesService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async addCategory(payload: CreateCategory): Promise<string> {
    const { name, description } = payload;
    const id = `category-${nanoid(10)}`;
    const query = {
      text: 'INSERT INTO categories (id, name, description) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, description],
    };

    try {
      const result = await this.pool.query<InsertCategory>(query);
      return result.rows[0].id;
    } catch (error: unknown) {
      if (isPostgresError(error) && error.code === '23505') {
        throw new ErrorConflict('Username sudah digunakan');
      }
      throw error;
    }
  }

  async getAllCategories(): Promise<Category[]> {
    const query = 'SELECT id, name FROM categories ORDER BY name ASC';

    const result = await this.pool.query<Category>(query);

    return result.rows.map((row) => new Category(row));
  }

  async getAllByid(id: number): Promise<Category> {
    const query = {
      text: 'SELECT id, name, description FROM categories WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query<Category>(query);
    if (!result.rowCount) {
      throw new NotFoundError(`Kategori dengan ID ${id} tidak ditemukan`);
    }
    return new Category(result.rows[0]);
  }

  async getProductByCategoriey(id: string) {
    const query = {
      text: 'SELECT id, name, description FROM categories WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError(`Kategori dengan ID ${id} tidak ditemukan`);
    }

    const productsQuery = `
    SELECT id, name, sku, price, stock 
    FROM products 
    WHERE category_id = $1 
    ORDER BY created_at DESC`;

    const productsResult = await this.pool.query(productsQuery, [id]);
    return {
      ...result.rows[0],
      products: productsResult.rows,
    };
  }
}
