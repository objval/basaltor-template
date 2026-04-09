import { boolean, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { paymentProviderEnum } from "@/lib/db/schema/payments";

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  siteName: text("site_name").notNull(),
  siteDescription: text("site_description").notNull(),
  supportEmail: text("support_email").notNull(),
  defaultCurrency: text("default_currency").notNull().default("USD"),
  defaultPaymentProvider: paymentProviderEnum("default_payment_provider").notNull().default("stripe"),
  heroBadge: text("hero_badge"),
  heroHeadline: text("hero_headline"),
  heroDescription: text("hero_description"),
  metadata: jsonb("metadata").$type<Record<string, string | number | boolean>>().notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const legalDocuments = pgTable(
  "legal_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    isPublished: boolean("is_published").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("legal_documents_slug_unique").on(table.slug)],
);
