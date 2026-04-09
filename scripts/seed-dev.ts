import { and, eq, inArray } from "drizzle-orm";

import { brandConfig } from "@/config/brand";
import { paymentConfig } from "@/config/payments";
import { siteConfig } from "@/config/site";
import { templateConfig } from "@/config/template";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { createTopUpLicenseKeys } from "@/lib/license-key-seeding";
import {
  categories,
  legalDocuments,
  licenseKeys,
  licensePools,
  productVariants,
  products,
  siteSettings,
  users,
} from "@/lib/db/schema";
import { getServerEnv } from "@/lib/env";

const DEV_ADMIN = templateConfig.devAdmin;

async function ensureAdminUser() {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, DEV_ADMIN.email),
  });

  if (existing && existing.name !== DEV_ADMIN.name) {
    throw new Error(`Refusing to promote unexpected existing user ${DEV_ADMIN.email}. Reset the dev database first.`);
  }

  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        name: DEV_ADMIN.name,
        email: DEV_ADMIN.email,
        password: DEV_ADMIN.password,
        callbackURL: "/dashboard",
      },
    });
  }

  await db
    .update(users)
    .set({ role: "admin", emailVerified: true, name: DEV_ADMIN.name })
    .where(eq(users.email, DEV_ADMIN.email));
}

async function ensureCategory(input: { slug: string; name: string; description: string; sortOrder: number }) {
  const existing = await db.query.categories.findFirst({ where: eq(categories.slug, input.slug) });
  if (existing) {
    await db
      .update(categories)
      .set({ name: input.name, description: input.description, sortOrder: input.sortOrder, isActive: true, updatedAt: new Date() })
      .where(eq(categories.id, existing.id));
    return existing.id;
  }

  const [created] = await db.insert(categories).values({ ...input, isActive: true }).returning();
  return created.id;
}

async function ensureProduct(input: {
  slug: string;
  categoryId: string;
  name: string;
  shortDescription: string;
  description: string;
  features: Array<string>;
  badge?: string;
  legacySlugs?: Array<string>;
}) {
  const lookupSlugs = [input.slug, ...(input.legacySlugs ?? [])];
  const existing = await db.query.products.findFirst({ where: inArray(products.slug, lookupSlugs) });
  const payload = {
    categoryId: input.categoryId,
    name: input.name,
    slug: input.slug,
    shortDescription: input.shortDescription,
    description: input.description,
    features: input.features,
    gallery: [],
    badge: input.badge ?? null,
    status: "active" as const,
    isFeatured: true,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(products).set(payload).where(eq(products.id, existing.id));
    return existing.id;
  }

  const [created] = await db.insert(products).values(payload).returning();
  return created.id;
}

async function ensureVariant(input: {
  productId: string;
  slug: string;
  name: string;
  durationDays: number;
  priceMinor: number;
  compareAtPriceMinor?: number;
  displayOrder: number;
  seedKeys: Array<string>;
  keyPrefix: string;
  minimumAvailableKeys?: number;
}) {
  const existing = await db.query.productVariants.findFirst({
    where: and(eq(productVariants.productId, input.productId), eq(productVariants.slug, input.slug)),
  });

  const payload = {
    productId: input.productId,
    slug: input.slug,
    name: input.name,
    description: `${input.durationDays} day license access`,
    durationDays: input.durationDays,
    priceMinor: input.priceMinor,
    compareAtPriceMinor: input.compareAtPriceMinor ?? null,
    currency: "USD",
    stockMode: "finite" as const,
    isDefault: input.displayOrder === 0,
    isActive: true,
    displayOrder: input.displayOrder,
    updatedAt: new Date(),
  };

  const variant = existing
    ? (
        await db
          .update(productVariants)
          .set(payload)
          .where(eq(productVariants.id, existing.id))
          .returning()
      )[0]
    : (await db.insert(productVariants).values(payload).returning())[0];

  const pool =
    (await db.query.licensePools.findFirst({ where: eq(licensePools.variantId, variant.id) })) ??
    (await db.insert(licensePools).values({ variantId: variant.id, name: `${variant.name} Pool` }).returning())[0];

  const existingKeys = await db
    .select({ value: licenseKeys.value, status: licenseKeys.status })
    .from(licenseKeys)
    .where(eq(licenseKeys.poolId, pool.id));
  const existingSet = new Set(existingKeys.map((entry) => entry.value));
  const seededKeys = input.seedKeys.filter((value) => !existingSet.has(value));
  const minimumAvailableKeys = input.minimumAvailableKeys ?? input.seedKeys.length;
  const availableCount = existingKeys.filter((entry) => entry.status === "available").length + seededKeys.length;
  const topUpKeys = createTopUpLicenseKeys({
    prefix: input.keyPrefix,
    existingValues: new Set([...existingSet, ...seededKeys]),
    currentAvailableCount: availableCount,
    minimumAvailableCount: minimumAvailableKeys,
  });
  const newKeys = [...seededKeys, ...topUpKeys];

  if (newKeys.length) {
    await db.insert(licenseKeys).values(newKeys.map((value) => ({ poolId: pool.id, value })));
  }
}

async function ensureSiteContent() {
  const settings = await db.query.siteSettings.findFirst();
  if (!settings) {
    await db.insert(siteSettings).values({
      siteName: siteConfig.name,
      siteDescription: siteConfig.description,
      supportEmail: siteConfig.supportEmail,
      defaultCurrency: siteConfig.currency,
      defaultPaymentProvider: paymentConfig.defaultProvider,
      heroBadge: brandConfig.heroBadge,
      heroHeadline: brandConfig.headline,
      heroDescription: brandConfig.subheadline,
    });
  }

  const legalEntries = [
    { slug: "terms", title: "Terms of service", body: "Sample terms for a cloned storefront." },
    { slug: "refunds", title: "Refund policy", body: "Mock refund policy for local development and admin previews." },
  ];

  for (const entry of legalEntries) {
    const existing = await db.query.legalDocuments.findFirst({ where: eq(legalDocuments.slug, entry.slug) });
    if (existing) {
      await db.update(legalDocuments).set({ ...entry, isPublished: true, updatedAt: new Date() }).where(eq(legalDocuments.id, existing.id));
    } else {
      await db.insert(legalDocuments).values({ ...entry, isPublished: true });
    }
  }
}

async function ensureSeedCatalog() {
  const featuredCategoryId = await ensureCategory({
    slug: "featured-licenses",
    name: "Featured Licenses",
    description: "Timed access products for the storefront template.",
    sortOrder: 0,
  });

  const creatorToolsCategoryId = await ensureCategory({
    slug: "creator-tooling",
    name: "Creator Tooling",
    description: "Reusable digital products with access-key fulfillment.",
    sortOrder: 1,
  });

  const featuredDemoProductId = await ensureProduct({
    slug: "creator-access-pass",
    legacySlugs: ["midnight"],
    categoryId: featuredCategoryId,
    name: "Creator Access Pass",
    shortDescription: "Primary timed-access demo product for testing 1-day, 1-week, and 1-month licenses.",
    description:
      "Creator Access Pass is the canonical seed product for the template. It proves variant pricing, bulk quantity checkout, and license-key allocation across multiple durations.",
    features: ["Timed license access", "Bulk checkout support", "Per-order fulfillment audit"],
    badge: "featured demo",
  });

  const secondaryDemoProductId = await ensureProduct({
    slug: "studio-toolkit",
    legacySlugs: ["nebula-suite"],
    categoryId: creatorToolsCategoryId,
    name: "Studio Toolkit",
    shortDescription: "Secondary demo product for admin CRUD and storefront layout coverage.",
    description:
      "Studio Toolkit exists so the template always ships with more than one product. That keeps product grids, category filters, and related-product surfaces realistic in local QA.",
    features: ["Multiple SKUs", "Admin-editable copy", "Provider-ready checkout"],
    badge: "secondary demo",
  });

  await ensureVariant({
    productId: featuredDemoProductId,
    slug: "one-day",
    name: "1 Day",
    durationDays: 1,
    priceMinor: 499,
    compareAtPriceMinor: 699,
    displayOrder: 0,
    keyPrefix: "ACCESS-1D",
    seedKeys: ["ACCESS-1D-001", "ACCESS-1D-002", "ACCESS-1D-003", "ACCESS-1D-004", "ACCESS-1D-005"],
  });
  await ensureVariant({
    productId: featuredDemoProductId,
    slug: "one-week",
    name: "1 Week",
    durationDays: 7,
    priceMinor: 1499,
    compareAtPriceMinor: 1799,
    displayOrder: 1,
    keyPrefix: "ACCESS-1W",
    seedKeys: ["ACCESS-1W-001", "ACCESS-1W-002", "ACCESS-1W-003", "ACCESS-1W-004", "ACCESS-1W-005"],
  });
  await ensureVariant({
    productId: featuredDemoProductId,
    slug: "one-month",
    name: "1 Month",
    durationDays: 30,
    priceMinor: 3999,
    compareAtPriceMinor: 4499,
    displayOrder: 2,
    keyPrefix: "ACCESS-1M",
    seedKeys: ["ACCESS-1M-001", "ACCESS-1M-002", "ACCESS-1M-003", "ACCESS-1M-004", "ACCESS-1M-005"],
  });

  await ensureVariant({
    productId: secondaryDemoProductId,
    slug: "starter-pack",
    name: "Starter Pack",
    durationDays: 14,
    priceMinor: 2199,
    compareAtPriceMinor: 2599,
    displayOrder: 0,
    keyPrefix: "TOOLKIT-14D",
    seedKeys: ["TOOLKIT-14D-001", "TOOLKIT-14D-002", "TOOLKIT-14D-003"],
  });
}

async function main() {
  const env = getServerEnv();

  if (env.NODE_ENV !== "development") {
    throw new Error("seed:dev only runs in development mode.");
  }

  await ensureAdminUser();
  await ensureSiteContent();
  await ensureSeedCatalog();

  console.log("Seeded test user:");
  console.log(`  email: ${DEV_ADMIN.email}`);
  console.log(`  password: ${DEV_ADMIN.password}`);
  console.log("  role: admin");
  console.log("Seeded catalog:");
  console.log("  products: Creator Access Pass, Studio Toolkit");
  console.log("  variants: 1 day / 1 week / 1 month / starter pack");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
