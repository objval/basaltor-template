import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { orders } from "@/lib/db/schema/commerce";

export const paymentProviderEnum = pgEnum("payment_provider", ["stripe", "paddle"]);
export const paymentAttemptStatusEnum = pgEnum("payment_attempt_status", ["created", "pending", "paid", "failed", "cancelled"]);

export const paymentAttempts = pgTable(
  "payment_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicId: text("public_id").notNull(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: paymentProviderEnum("provider").notNull(),
    status: paymentAttemptStatusEnum("status").notNull().default("created"),
    amountMinor: integer("amount_minor").notNull(),
    currency: text("currency").notNull().default("USD"),
    checkoutUrl: text("checkout_url"),
    providerReference: text("provider_reference"),
    providerLabel: text("provider_label"),
    metadata: jsonb("metadata").$type<Record<string, string | number | boolean>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("payment_attempts_public_id_unique").on(table.publicId),
    index("payment_attempts_order_idx").on(table.orderId, table.createdAt),
    index("payment_attempts_provider_idx").on(table.provider, table.status),
  ],
);

export const paymentWebhookEvents = pgTable(
  "payment_webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: paymentProviderEnum("provider").notNull(),
    eventId: text("event_id").notNull(),
    paymentAttemptId: uuid("payment_attempt_id").references(() => paymentAttempts.id, { onDelete: "set null" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    eventType: text("event_type").notNull(),
    signatureValid: boolean("signature_valid").notNull().default(true),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("payment_webhook_events_provider_event_unique").on(table.provider, table.eventId), index("payment_webhook_events_order_idx").on(table.orderId)],
);
