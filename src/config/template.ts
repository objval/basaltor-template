import { siteConfig } from "@/config/site";

export function buildLocalTemplateEmailHost(slug: string) {
  const normalized = slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${normalized || "storefront"}.local`;
}

const localEmailHost = buildLocalTemplateEmailHost(siteConfig.slug);

export const templateConfig = {
  devAdmin: {
    email: `admin@${localEmailHost}`,
    password: "ChangeMe!2345",
    name: `${siteConfig.shortName} Admin`,
  },
  smokeCustomer: {
    fullName: "Template Smoke Guest",
    email: `smoke-guest@${localEmailHost}`,
    contactHandle: "discord:smoke-guest",
    country: "Chile",
    note: "smoke-test",
  },
} as const;