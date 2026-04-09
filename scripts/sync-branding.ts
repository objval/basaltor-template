import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { brandConfig } from "@/config/brand";
import { siteConfig } from "@/config/site";

const manifest = {
  short_name: siteConfig.shortName,
  name: siteConfig.legalName,
  icons: [
    {
      src: brandConfig.assets.logoPath,
      type: "image/svg+xml",
      sizes: "any",
    },
    {
      src: brandConfig.assets.faviconPath,
      sizes: "64x64 32x32 24x24 16x16",
      type: "image/x-icon",
    },
  ],
  start_url: ".",
  display: "standalone",
  theme_color: brandConfig.themeColor,
  background_color: brandConfig.backgroundColor,
};

const currentDir = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(currentDir, "../public/manifest.json");
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Synced branding manifest to ${manifestPath}`);
