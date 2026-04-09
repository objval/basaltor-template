import { siteConfig } from "@/config/site";

export const commerceConfig = {
  currency: siteConfig.currency,
  guestCheckout: true,
  cartStorageKey: `digital-store:${siteConfig.slug}:cart:v1`,
  allowBulkLicenses: true,
} as const;
