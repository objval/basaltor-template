import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import { siteConfig } from "@/config/site";
import { db } from "@/lib/db/client";
import { categories, licenseKeys, licensePools, productVariants, products } from "@/lib/db/schema";
import { deriveProductAvailability, getVariantState } from "@/modules/catalog/catalog.view";

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function groupBy<T extends { id: string }>(items: Array<T>) {
  return new Map(items.map((item) => [item.id, item]));
}

async function getAvailableKeyCounts() {
  const rows = await db
    .select({
      variantId: licensePools.variantId,
      availableKeys: sql<number>`cast(sum(case when ${licenseKeys.status} = 'available' then 1 else 0 end) as integer)`,
    })
    .from(licensePools)
    .leftJoin(licenseKeys, eq(licenseKeys.poolId, licensePools.id))
    .groupBy(licensePools.variantId);

  return new Map(rows.map((row) => [row.variantId, Number(row.availableKeys)]));
}

function buildVariantRecord(
  variant: typeof productVariants.$inferSelect,
  availableKeys: number,
) {
  const variantState = getVariantState({
    id: variant.id,
    isDefault: variant.isDefault,
    stockMode: variant.stockMode,
    availableKeys,
    priceMinor: variant.priceMinor,
  });

  return {
    ...variant,
    availableKeys,
    isPurchasable: variantState.isPurchasable,
    isLowStock: variantState.isLowStock,
    priceLabel: new Intl.NumberFormat(siteConfig.locale, {
      style: 'currency',
      currency: variant.currency,
      minimumFractionDigits: 2,
    }).format(variant.priceMinor / 100),
  };
}

export async function getStorefrontData() {
  const [categoryRows, productRows, variantRows, availableCounts] = await Promise.all([
    db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db
      .select()
      .from(products)
      .where(eq(products.status, 'active'))
      .orderBy(desc(products.isFeatured), asc(products.name)),
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.isActive, true))
      .orderBy(asc(productVariants.displayOrder), asc(productVariants.name)),
    getAvailableKeyCounts(),
  ]);

  const categoryMap = groupBy(categoryRows);
  const variantsByProduct = new Map<string, Array<ReturnType<typeof buildVariantRecord>>>();

  for (const variant of variantRows) {
    const bucket = variantsByProduct.get(variant.productId) ?? [];
    bucket.push(buildVariantRecord(variant, availableCounts.get(variant.id) ?? 0));
    variantsByProduct.set(variant.productId, bucket);
  }

  const productsWithVariants = productRows.map((product) => {
    const variants = variantsByProduct.get(product.id) ?? [];
    const availability = deriveProductAvailability(variants);

    return {
      ...product,
      category: product.categoryId ? categoryMap.get(product.categoryId) ?? null : null,
      variants,
      hasPurchasableVariants: availability.hasPurchasableVariants,
      cheapestPriceMinor: availability.lowestPurchasablePriceMinor,
    };
  });

  return {
    categories: categoryRows,
    products: productsWithVariants,
  };
}

export async function getProductDetailBySlug(slug: string) {
  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.status, 'active')),
  });

  if (!product) {
    return null;
  }

  const [category, variantRows, availableCounts, relatedProducts] = await Promise.all([
    product.categoryId ? db.query.categories.findFirst({ where: eq(categories.id, product.categoryId) }) : null,
    db
      .select()
      .from(productVariants)
      .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true)))
      .orderBy(asc(productVariants.displayOrder), asc(productVariants.name)),
    getAvailableKeyCounts(),
    product.categoryId
      ? db
          .select()
          .from(products)
          .where(and(eq(products.categoryId, product.categoryId), eq(products.status, 'active')))
          .orderBy(desc(products.isFeatured), asc(products.name))
      : Promise.resolve([] as Array<typeof products.$inferSelect>),
  ]);

  const variants = variantRows.map((variant) => buildVariantRecord(variant, availableCounts.get(variant.id) ?? 0));

  return {
    product,
    category,
    variants,
    relatedProducts: relatedProducts.filter((entry) => entry.id !== product.id).slice(0, 3),
  };
}

export async function getAdminCatalogData() {
  const [categoryRows, productRows, variantRows, availableCounts] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db.select().from(products).orderBy(desc(products.updatedAt), asc(products.name)),
    db.select().from(productVariants).orderBy(asc(productVariants.displayOrder), asc(productVariants.name)),
    getAvailableKeyCounts(),
  ]);

  const categoryMap = groupBy(categoryRows);
  const variantsByProduct = new Map<string, Array<ReturnType<typeof buildVariantRecord>>>();

  for (const variant of variantRows) {
    const bucket = variantsByProduct.get(variant.productId) ?? [];
    bucket.push(buildVariantRecord(variant, availableCounts.get(variant.id) ?? 0));
    variantsByProduct.set(variant.productId, bucket);
  }

  return {
    categories: categoryRows,
    products: productRows.map((product) => ({
      ...product,
      category: product.categoryId ? categoryMap.get(product.categoryId) ?? null : null,
      variants: variantsByProduct.get(product.id) ?? [],
    })),
  };
}

export async function getVariantAvailability(variantIds: Array<string>) {
  if (!variantIds.length) {
    return new Map<string, number>();
  }

  const rows = await db
    .select({
      variantId: licensePools.variantId,
      availableKeys: sql<number>`cast(sum(case when ${licenseKeys.status} = 'available' then 1 else 0 end) as integer)`,
    })
    .from(licensePools)
    .leftJoin(licenseKeys, eq(licenseKeys.poolId, licensePools.id))
    .where(inArray(licensePools.variantId, variantIds))
    .groupBy(licensePools.variantId);

  return new Map(rows.map((row) => [row.variantId, Number(row.availableKeys)]));
}

export function parseLinesInput(value: string) {
  return splitLines(value);
}
