import { index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { users } from "@/lib/db/schema/auth";
import { productVariants, products } from "@/lib/db/schema/catalog";

export const orderStatusEnum = pgEnum("order_status", ["pending_payment", "paid", "fulfilled", "failed", "cancelled"]);
export const orderCustomerModeEnum = pgEnum("order_customer_mode", ["account", "guest"]);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicId: text("public_id").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    customerMode: orderCustomerModeEnum("customer_mode").notNull().default("account"),
    customerName: text("customer_name").notNull().default(""),
    customerEmail: text("customer_email").notNull().default(""),
    customerContactHandle: text("customer_contact_handle"),
    customerCountry: text("customer_country"),
    customerNote: text("customer_note"),
    guestAccessTokenHash: text("guest_access_token_hash"),
    guestAccessTokenExpiresAt: timestamp("guest_access_token_expires_at", { withTimezone: true }),
    placedFromIp: text("placed_from_ip"),
    placedFromUserAgent: text("placed_from_user_agent"),
    placedFromReferrer: text("placed_from_referrer"),
    placedFromAcceptLanguage: text("placed_from_accept_language"),
    status: orderStatusEnum("status").notNull().default("pending_payment"),
    currency: text("currency").notNull().default("USD"),
    subtotalMinor: integer("subtotal_minor").notNull(),
    totalMinor: integer("total_minor").notNull(),
    itemCount: integer("item_count").notNull().default(0),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("orders_public_id_unique").on(table.publicId),
    index("orders_user_idx").on(table.userId, table.createdAt),
    index("orders_status_idx").on(table.status, table.createdAt),
    index("orders_customer_email_idx").on(table.customerEmail, table.createdAt),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    productName: text("product_name").notNull(),
    variantName: text("variant_name").notNull(),
    variantSlug: text("variant_slug").notNull(),
    durationDays: integer("duration_days"),
    quantity: integer("quantity").notNull().default(1),
    unitPriceMinor: integer("unit_price_minor").notNull(),
    totalPriceMinor: integer("total_price_minor").notNull(),
    currency: text("currency").notNull().default("USD"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId), index("order_items_variant_idx").on(table.variantId)],
);
