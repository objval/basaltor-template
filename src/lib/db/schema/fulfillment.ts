import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { users } from "@/lib/db/schema/auth";
import { productVariants } from "@/lib/db/schema/catalog";
import { orderItems, orders } from "@/lib/db/schema/commerce";

export const licenseKeyStatusEnum = pgEnum("license_key_status", ["available", "allocated", "revoked"]);
export const licenseDeliveryStatusEnum = pgEnum("license_delivery_status", ["delivered", "revoked"]);

export const licensePools = pgTable(
  "license_pools",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("license_pools_variant_name_unique").on(table.variantId, table.name), index("license_pools_variant_idx").on(table.variantId)],
);

export const licenseKeys = pgTable(
  "license_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    poolId: uuid("pool_id")
      .notNull()
      .references(() => licensePools.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    note: text("note"),
    status: licenseKeyStatusEnum("status").notNull().default("available"),
    allocatedToUserId: text("allocated_to_user_id").references(() => users.id, { onDelete: "set null" }),
    allocatedAt: timestamp("allocated_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("license_keys_value_unique").on(table.value), index("license_keys_pool_status_idx").on(table.poolId, table.status)],
);

export const licenseAllocations = pgTable(
  "license_allocations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    licenseKeyId: uuid("license_key_id")
      .notNull()
      .references(() => licenseKeys.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    deliveryStatus: licenseDeliveryStatusEnum("delivery_status").notNull().default("delivered"),
    deliveredKey: text("delivered_key").notNull(),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("license_allocations_license_key_unique").on(table.licenseKeyId), index("license_allocations_user_idx").on(table.userId, table.deliveredAt), index("license_allocations_order_idx").on(table.orderId)],
);
