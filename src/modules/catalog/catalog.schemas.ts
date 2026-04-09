import { z } from "zod";

export const categoryInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(80),
  description: z.string().trim().max(240).optional().default(""),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const productInputSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120),
  shortDescription: z.string().trim().max(180).optional().default(""),
  description: z.string().trim().min(1).max(4000),
  features: z.array(z.string().trim().min(1).max(120)).default([]),
  gallery: z.array(z.string().url()).default([]),
  heroImageUrl: z.string().url().optional().or(z.literal("")),
  badge: z.string().trim().max(40).optional().default(""),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  isFeatured: z.boolean().default(false),
});

export const variantInputSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  slug: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(240).optional().default(""),
  durationDays: z.number().int().positive().nullable().optional(),
  priceMinor: z.number().int().min(0),
  compareAtPriceMinor: z.number().int().min(0).nullable().optional(),
  currency: z.string().trim().min(3).max(3).default("USD"),
  stockMode: z.enum(["finite", "unlimited"]).default("finite"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
});

export const bulkLicenseKeysInputSchema = z.object({
  variantId: z.string().uuid(),
  poolName: z.string().trim().min(1).max(80).default("Default Pool"),
  keys: z.array(z.string().trim().min(1)).min(1),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type VariantInput = z.infer<typeof variantInputSchema>;
export type BulkLicenseKeysInput = z.infer<typeof bulkLicenseKeysInputSchema>;
