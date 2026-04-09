import { and, desc, eq, sql } from "drizzle-orm";

import type { BulkLicenseKeysInput, CategoryInput, ProductInput, VariantInput } from "@/modules/catalog/catalog.schemas";
import { db } from "@/lib/db/client";
import {
  categories,
  licenseAllocations,
  licenseKeys,
  licensePools,
  orders,
  paymentAttempts,
  productVariants,
  products,
} from "@/lib/db/schema";
import { requireServerAdmin } from "@/lib/auth-guards";
import { writeAuditLog } from "@/lib/audit";
import { getAdminCatalogData } from "@/modules/catalog/catalog.server";

export async function getAdminPageData() {
  await requireServerAdmin();

  const [catalog, recentOrders, attempts, allocationCounts] = await Promise.all([
    getAdminCatalogData(),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(20),
    db.select().from(paymentAttempts).orderBy(desc(paymentAttempts.createdAt)).limit(40),
    db
      .select({
        orderId: licenseAllocations.orderId,
        allocationCount: sql<number>`cast(count(*) as integer)`,
      })
      .from(licenseAllocations)
      .groupBy(licenseAllocations.orderId),
  ]);

  const attemptsByOrder = new Map<string, Array<typeof paymentAttempts.$inferSelect>>();
  for (const attempt of attempts) {
    const bucket = attemptsByOrder.get(attempt.orderId) ?? [];
    bucket.push(attempt);
    attemptsByOrder.set(attempt.orderId, bucket);
  }

  const allocationCountMap = new Map(allocationCounts.map((row) => [row.orderId, Number(row.allocationCount)]));

  return {
    ...catalog,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      publicId: order.publicId,
      status: order.status,
      currency: order.currency,
      totalMinor: order.totalMinor,
      createdAt: order.createdAt,
      customerMode: order.customerMode,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      placedFromIp: order.placedFromIp,
      paymentAttempt: (attemptsByOrder.get(order.id) ?? [])[0] ?? null,
      allocationCount: allocationCountMap.get(order.id) ?? 0,
    })),
  };
}

export async function saveCategory(input: CategoryInput) {
  const session = await requireServerAdmin();

  if (input.id) {
    await db
      .update(categories)
      .set({
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, input.id));
  } else {
    await db.insert(categories).values({
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    });
  }

  await writeAuditLog({
    actorUserId: session.user.id,
    action: input.id ? "category.updated" : "category.created",
    resource: "category",
    details: { slug: input.slug },
  });
}

export async function removeCategory(id: string) {
  const session = await requireServerAdmin();
  await db.delete(categories).where(eq(categories.id, id));
  await writeAuditLog({ actorUserId: session.user.id, action: "category.deleted", resource: "category", details: { id } });
}

export async function saveProduct(input: ProductInput) {
  const session = await requireServerAdmin();

  const payload = {
    categoryId: input.categoryId || null,
    name: input.name,
    slug: input.slug,
    shortDescription: input.shortDescription || null,
    description: input.description,
    features: input.features,
    gallery: input.gallery,
    heroImageUrl: input.heroImageUrl || null,
    badge: input.badge || null,
    status: input.status,
    isFeatured: input.isFeatured,
    updatedAt: new Date(),
  } as const;

  if (input.id) {
    await db.update(products).set(payload).where(eq(products.id, input.id));
  } else {
    await db.insert(products).values(payload);
  }

  await writeAuditLog({
    actorUserId: session.user.id,
    action: input.id ? "product.updated" : "product.created",
    resource: "product",
    details: { slug: input.slug },
  });
}

export async function removeProduct(id: string) {
  const session = await requireServerAdmin();
  await db.delete(products).where(eq(products.id, id));
  await writeAuditLog({ actorUserId: session.user.id, action: "product.deleted", resource: "product", details: { id } });
}

export async function saveVariant(input: VariantInput) {
  const session = await requireServerAdmin();

  const payload = {
    productId: input.productId,
    slug: input.slug,
    name: input.name,
    description: input.description || null,
    durationDays: input.durationDays ?? null,
    priceMinor: input.priceMinor,
    compareAtPriceMinor: input.compareAtPriceMinor ?? null,
    currency: input.currency,
    stockMode: input.stockMode,
    isDefault: input.isDefault,
    isActive: input.isActive,
    displayOrder: input.displayOrder,
    updatedAt: new Date(),
  } as const;

  if (input.id) {
    await db.update(productVariants).set(payload).where(eq(productVariants.id, input.id));
  } else {
    const [variant] = await db.insert(productVariants).values(payload).returning();
    await db.insert(licensePools).values({
      variantId: variant.id,
      name: `${variant.name} Pool`,
    });
  }

  await writeAuditLog({
    actorUserId: session.user.id,
    action: input.id ? "variant.updated" : "variant.created",
    resource: "variant",
    details: { productId: input.productId, slug: input.slug },
  });
}

export async function removeVariant(id: string) {
  const session = await requireServerAdmin();
  await db.delete(productVariants).where(eq(productVariants.id, id));
  await writeAuditLog({ actorUserId: session.user.id, action: "variant.deleted", resource: "variant", details: { id } });
}

export async function addLicenseKeysToVariant(input: BulkLicenseKeysInput) {
  const session = await requireServerAdmin();
  const existingPool = await db.query.licensePools.findFirst({
    where: and(eq(licensePools.variantId, input.variantId), eq(licensePools.name, input.poolName)),
  });

  const pool =
    existingPool ??
    (
      await db
        .insert(licensePools)
        .values({ variantId: input.variantId, name: input.poolName })
        .returning()
        .then((rows) => rows[0])
    );

  if (!pool) {
    throw new Error("Could not create or find a license pool for the selected variant.");
  }

  const existingKeys = await db.select({ value: licenseKeys.value }).from(licenseKeys).where(eq(licenseKeys.poolId, pool.id));
  const existingSet = new Set(existingKeys.map((entry) => entry.value));
  const uniqueKeys = Array.from(new Set(input.keys.map((key) => key.trim()).filter(Boolean))).filter((key) => !existingSet.has(key));

  if (uniqueKeys.length) {
    await db.insert(licenseKeys).values(uniqueKeys.map((key) => ({ poolId: pool.id, value: key })));
  }

  await writeAuditLog({
    actorUserId: session.user.id,
    action: "license_keys.added",
    resource: "license_pool",
    details: { variantId: input.variantId, added: uniqueKeys.length },
  });

  return {
    added: uniqueKeys.length,
    skipped: input.keys.length - uniqueKeys.length,
  };
}
