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
  pgm.createTable('products', {
    id: {
      type: 'VARCHAR(30)',
      primaryKey: true,
    },
    category_id: {
      type: 'varchar(30)',
      notNull: true,
      references: '"categories"',
      onDelete: 'CASCADE',
    },
    name: { type: 'varchar(255)', notNull: true },
    sku: { type: 'varchar(100)', notNull: true, unique: true }, // SKU wajib unik
    price: { type: 'numeric(12, 2)', notNull: true, default: 0 },
    stock: { type: 'integer', notNull: true, default: 0 },
    description: { type: 'text' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.createIndex('products', 'category_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('products');
};
