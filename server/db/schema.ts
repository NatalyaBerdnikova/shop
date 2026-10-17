import {
  bigint,
  boolean,
  char,
  check,
  customType,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn
} from 'drizzle-orm/pg-core'

import { sql } from 'drizzle-orm'

/** PostgreSQL CITEXT */
export const citext = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'citext'
  }
})

/** PostgreSQL INET */
export const inet = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'inet'
  }
})

const ts = (name: string) =>
  timestamp(name, { withTimezone: true, mode: 'date' })

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
])

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'succeeded',
  'failed',
  'refunded'
])

export const deliveryStatusEnum = pgEnum('delivery_status', [
  'created',
  'awaiting_pickup',
  'in_transit',
  'delivered',
  'cancelled'
])

export const deliveryTypeEnum = pgEnum('delivery_type', [
  'courier',
  'pickup_point'
])

// ---------------------------------------------------------------------------
// Users & auth
// ---------------------------------------------------------------------------
export const users = pgTable('users', {
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  email: citext('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  emailVerifiedAt: ts('email_verified_at'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: ts('created_at').notNull().defaultNow(),
  updatedAt: ts('updated_at').notNull().defaultNow()
})

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: bigint('id', { mode: 'number' })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    userAgent: text('user_agent'),
    ipAddress: inet('ip_address'),
    expiresAt: ts('expires_at').notNull(),
    revokedAt: ts('revoked_at'),
    createdAt: ts('created_at').notNull().defaultNow()
  },
  (t) => [
    index('idx_refresh_tokens_user').on(t.userId),
    index('idx_refresh_tokens_expires').on(t.expiresAt)
  ]
)

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------
export const categories = pgTable('categories', {
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  parentId: bigint('parent_id', { mode: 'number' }).references(
    (): AnyPgColumn => categories.id,
    { onDelete: 'set null' }
  ),
  name: varchar('name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: ts('created_at').notNull().defaultNow()
})

export const products = pgTable(
  'products',
  {
    id: bigint('id', { mode: 'number' })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    categoryId: bigint('category_id', { mode: 'number' }).references(
      () => categories.id,
      { onDelete: 'set null' }
    ),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    sku: varchar('sku', { length: 64 }).unique(),
    description: text('description'),
    price: numeric('price', { precision: 12, scale: 2 }).notNull(),
    oldPrice: numeric('old_price', { precision: 12, scale: 2 }),
    stockQuantity: integer('stock_quantity').notNull().default(0),
    weightGrams: integer('weight_grams'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: ts('created_at').notNull().defaultNow(),
    updatedAt: ts('updated_at').notNull().defaultNow()
  },
  (t) => [
    index('idx_products_category')
      .on(t.categoryId)
      .where(sql`${t.isActive}`),
    index('idx_products_active').on(t.isActive).where(sql`${t.isActive}`),
    check('products_price_check', sql`${t.price} >= 0`),
    check(
      'products_old_price_check',
      sql`${t.oldPrice} IS NULL OR ${t.oldPrice} >= 0`
    ),
    check('products_stock_check', sql`${t.stockQuantity} >= 0`)
  ]
)

export const productImages = pgTable(
  'product_images',
  {
    id: bigint('id', { mode: 'number' })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    productId: bigint('product_id', { mode: 'number' })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    alt: varchar('alt', { length: 255 }),
    sortOrder: integer('sort_order').notNull().default(0),
    isPrimary: boolean('is_primary').notNull().default(false)
  },
  (t) => [index('idx_product_images_product').on(t.productId)]
)

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------
export const favorites = pgTable(
  'favorites',
  {
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: bigint('product_id', { mode: 'number' })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    createdAt: ts('created_at').notNull().defaultNow()
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.productId] }),
    index('idx_favorites_user').on(t.userId)
  ]
)

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------
export const addresses = pgTable(
  'addresses',
  {
    id: bigint('id', { mode: 'number' })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fullName: varchar('full_name', { length: 150 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    country: varchar('country', { length: 100 }).notNull().default('Россия'),
    region: varchar('region', { length: 120 }),
    city: varchar('city', { length: 120 }).notNull(),
    street: varchar('street', { length: 200 }).notNull(),
    house: varchar('house', { length: 30 }).notNull(),
    apartment: varchar('apartment', { length: 30 }),
    postalCode: varchar('postal_code', { length: 10 }),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: ts('created_at').notNull().defaultNow()
  },
  (t) => [
    index('idx_addresses_user').on(t.userId),
    uniqueIndex('uniq_default_address')
      .on(t.userId)
      .where(sql`${t.isDefault}`)
  ]
)

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export const orders = pgTable(
  'orders',
  {
    id: bigint('id', { mode: 'number' })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    number: varchar('number', { length: 32 }).notNull().unique(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id, {
      onDelete: 'set null'
    }),
    status: orderStatusEnum('status').notNull().default('pending'),
    customerEmail: citext('customer_email').notNull(),
    customerPhone: varchar('customer_phone', { length: 20 }),
    customerName: varchar('customer_name', { length: 150 }).notNull(),
    deliveryCountry: varchar('delivery_country', { length: 100 })
      .notNull()
      .default('Россия'),
    deliveryRegion: varchar('delivery_region', { length: 120 }),
    deliveryCity: varchar('delivery_city', { length: 120 }).notNull(),
    deliveryStreet: varchar('delivery_street', { length: 200 }).notNull(),
    deliveryHouse: varchar('delivery_house', { length: 30 }).notNull(),
    deliveryApartment: varchar('delivery_apartment', { length: 30 }),
    deliveryPostalCode: varchar('delivery_postal_code', { length: 10 }),
    comment: text('comment'),
    subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
    deliveryCost: numeric('delivery_cost', { precision: 12, scale: 2 })
      .notNull()
      .default('0'),
    total: numeric('total', { precision: 12, scale: 2 }).notNull(),
    createdAt: ts('created_at').notNull().defaultNow(),
    updatedAt: ts('updated_at').notNull().defaultNow()
  },
  (t) => [
    index('idx_orders_user').on(t.userId),
    index('idx_orders_status').on(t.status),
    index('idx_orders_created').on(t.createdAt.desc()),
    index('idx_orders_customer_email').on(t.customerEmail),
    check('orders_subtotal_check', sql`${t.subtotal} >= 0`),
    check('orders_delivery_cost_check', sql`${t.deliveryCost} >= 0`),
    check('orders_total_check', sql`${t.total} >= 0`)
  ]
)

export const orderItems = pgTable(
  'order_items',
  {
    id: bigint('id', { mode: 'number' })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    orderId: bigint('order_id', { mode: 'number' })
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: bigint('product_id', { mode: 'number' }).references(
      () => products.id,
      { onDelete: 'set null' }
    ),
    productName: varchar('product_name', { length: 255 }).notNull(),
    productSku: varchar('product_sku', { length: 64 }),
    unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull(),
    lineTotal: numeric('line_total', { precision: 12, scale: 2 }).notNull()
  },
  (t) => [
    index('idx_order_items_order').on(t.orderId),
    index('idx_order_items_product').on(t.productId),
    check('order_items_unit_price_check', sql`${t.unitPrice} >= 0`),
    check('order_items_quantity_check', sql`${t.quantity} > 0`),
    check('order_items_line_total_check', sql`${t.lineTotal} >= 0`)
  ]
)

export const orderStatusHistory = pgTable(
  'order_status_history',
  {
    id: bigint('id', { mode: 'number' })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    orderId: bigint('order_id', { mode: 'number' })
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    status: orderStatusEnum('status').notNull(),
    comment: text('comment'),
    createdAt: ts('created_at').notNull().defaultNow()
  },
  (t) => [
    index('idx_order_history_order').on(t.orderId, t.createdAt)
  ]
)

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------
export const payments = pgTable(
  'payments',
  {
    id: bigint('id', { mode: 'number' })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    orderId: bigint('order_id', { mode: 'number' })
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 30 })
      .notNull()
      .default('yandex_pay'),
    providerPaymentId: varchar('provider_payment_id', { length: 128 }).unique(),
    status: paymentStatusEnum('status').notNull().default('pending'),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: char('currency', { length: 3 }).notNull().default('RUB'),
    idempotencyKey: uuid('idempotency_key').notNull().unique(),
    payload: jsonb('payload'),
    paidAt: ts('paid_at'),
    createdAt: ts('created_at').notNull().defaultNow(),
    updatedAt: ts('updated_at').notNull().defaultNow()
  },
  (t) => [
    index('idx_payments_order').on(t.orderId),
    index('idx_payments_status').on(t.status),
    check('payments_amount_check', sql`${t.amount} > 0`)
  ]
)

// ---------------------------------------------------------------------------
// Deliveries
// ---------------------------------------------------------------------------
export const deliveries = pgTable(
  'deliveries',
  {
    id: bigint('id', { mode: 'number' })
      .generatedAlwaysAsIdentity()
      .primaryKey(),
    orderId: bigint('order_id', { mode: 'number' })
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 30 }).notNull().default('ozon'),
    providerOrderId: varchar('provider_order_id', { length: 128 }).unique(),
    trackingNumber: varchar('tracking_number', { length: 128 }),
    type: deliveryTypeEnum('type').notNull().default('courier'),
    pickupPointId: varchar('pickup_point_id', { length: 64 }),
    status: deliveryStatusEnum('status').notNull().default('created'),
    cost: numeric('cost', { precision: 12, scale: 2 }).notNull().default('0'),
    estimatedDeliveryAt: date('estimated_delivery_at', { mode: 'string' }),
    deliveredAt: ts('delivered_at'),
    payload: jsonb('payload'),
    createdAt: ts('created_at').notNull().defaultNow(),
    updatedAt: ts('updated_at').notNull().defaultNow()
  },
  (t) => [
    index('idx_deliveries_order').on(t.orderId),
    index('idx_deliveries_status').on(t.status),
    check('deliveries_cost_check', sql`${t.cost} >= 0`)
  ]
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
