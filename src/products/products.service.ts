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
import { UpdateStockDto } from 'src/stock/dto/update-stock.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('DATABASE_POOL')
    private readonly pool: Pool,
  ) {}

  async addProduct(payload: CreateProduct) {
    const { category_id, name, sku, price, description } = payload;
    // 1. Cek keberadaan SKU (termasuk yang di-soft delete)
    const existing = await this.pool.query(
      'SELECT id, deleted_at FROM products WHERE sku = $1',
      [sku],
    );

    if (existing.rows.length > 0) {
      const p = existing.rows[0];

      // Jika produk masih aktif, ya error
      if (!p.deleted_at) throw new ErrorConflict('SKU masih aktif di katalog');

      // Jika produk sudah di-soft delete, kita RESTORE (Hidupkan lagi)
      const restoreQuery = {
        text: `UPDATE products 
             SET name = $1, category_id = $2, price = $3, description = $4, 
                 deleted_at = NULL, updated_at = NOW() 
             WHERE id = $5 RETURNING id`,
        values: [name, category_id, price, description, p.id],
      };
      const res = await this.pool.query(restoreQuery);
      return res.rows[0].id; // Mengembalikan ID lama yang sekarang sudah aktif lagi
    }

    const id = `prod-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO products (id, category_id, name, sku, price, description) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      values: [id, category_id, name, sku, price, description],
    };

    try {
      const result = await this.pool.query(query);
      return result.rows[0].id;
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ErrorConflict('SKU produk sudah terdaftar');
      }
      throw error;
    }
  }

  async getAllproduct(filters: ProductQueryFilter) {
    const { search, category_id } = filters;

    let queryText = `SELECT p.id, p.name, p.sku, p.description, c.name AS category_name FROM products p
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

  async updateStock(dto: UpdateStockDto) {
    const { productId, amount, type, reason } = dto;
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Lock row dan cek soft delete
      const productQuery = {
        text: 'SELECT stock FROM products WHERE id = $1 AND deleted_at IS NULL FOR UPDATE',
        values: [productId],
      };

      const productRes = await client.query(productQuery);
      if (!productRes.rowCount) {
        throw new NotFoundError('Produk tidak ditemukan atau sudah dihapus');
      }

      const before = Number(productRes.rows[0].stock);
      let after: number;

      if (type === 'IN') {
        // kalo IN tambahkan jumlah stok sebelumnya + jumlah
        after = before + amount;
      } else {
        if (before < amount) {
          throw new InvariantError(
            `Stok tidak mencukupi. Stok saat ini: ${before}`,
          );
        }
        // kalo OUT jumlah stok sebelumnya - amount
        after = before - amount;
      }

      // 2. Update stok si products
      const updateQuery = {
        text: 'UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2',
        values: [after, productId],
      };
      await client.query(updateQuery);

      // bikin history dari aksi update produk
      const logId = `ls-${nanoid(16)}`;
      const logQuery = {
        text: `INSERT INTO stock_logs (id, product_id, type, amount, balance_before, balance_after, reason)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        values: [
          logId,
          productId,
          type,
          amount,
          before,
          after,
          reason || 'manual update',
        ],
      };
      await client.query(logQuery);

      await client.query('COMMIT');
      return {
        log_id: logId,
        previous_stock: before,
        current_stock: after,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getALlStockLog() {
    const query = {
      text: `
      SELECT 
        sl.id as log_id,
        sl.type,
        sl.amount,
        sl.balance_before,
        sl.balance_after,
        sl.reason,
        sl.created_at,
        p.id as product_id,
        p.name as product_name,
        p.sku as product_sku,
        (p.deleted_at IS NOT NULL) as is_product_archived
      FROM stock_logs sl
      LEFT JOIN products p ON sl.product_id = p.id
      ORDER BY sl.created_at DESC
    `,
    };
    const res = await this.pool.query(query);
    // Mapping data agar lebih bersih dan tipe datanya benar
    return res.rows.map((log) => ({
      id: log.log_id,
      productId: log.product_id,
      productName: log.product_name || 'Produk Tidak Diketahui',
      sku: log.product_sku,
      type: log.type,
      amount: Number(log.amount),
      before: Number(log.balance_before),
      after: Number(log.balance_after),
      reason: log.reason,
      isArchived: log.is_product_archived,
      createdAt: log.created_at,
    }));
  }
}
