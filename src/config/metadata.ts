import { brandConfig } from "@/config/brand";
import { siteConfig } from "@/config/site";

export const metadataConfig = {
  title: siteConfig.name,
  description: siteConfig.description,
  themeColor: brandConfig.themeColor,
  openGraphTitle: `${siteConfig.name} · ${brandConfig.heroBadge}`,
  openGraphDescription: brandConfig.subheadline,
} as const;

export function buildPageTitle(value?: string) {
  return value ? `${value} · ${siteConfig.name}` : siteConfig.name;
}
