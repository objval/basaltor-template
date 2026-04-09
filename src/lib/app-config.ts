import { brandConfig } from "@/config/brand";
import { siteConfig } from "@/config/site";

export const APP_NAME = siteConfig.name;
export const APP_SHORT_NAME = siteConfig.shortName;
export const APP_DESCRIPTION = siteConfig.description;
export const APP_EYEBROW = brandConfig.eyebrow;
export const APP_LOGO_PATH = brandConfig.assets.logoPath;
export const APP_FAVICON_PATH = brandConfig.assets.faviconPath;
export const APP_MANIFEST_PATH = brandConfig.assets.manifestPath;
export const APP_THEME_COLOR = brandConfig.themeColor;
export const DEV_MAILPIT_URL = "http://127.0.0.1:8025";
