/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('stock_logs', {
    id: { type: 'VARCHAR(21)', primaryKey: true },
    product_id: {
      type: 'VARCHAR(30)',
      notNull: true,
      references: '"products"', // Relasi ke tabel produk
      onDelete: 'CASCADE',
    },
    type: { type: 'VARCHAR(10)', notNull: true }, // 'IN' atau 'OUT'
    amount: { type: 'INTEGER', notNull: true },
    balance_before: { type: 'INTEGER', notNull: true }, // Stok sebelum berubah
    balance_after: { type: 'INTEGER', notNull: true },  // Stok setelah berubah
    reason: { type: 'TEXT' },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('stock_logs');
};
