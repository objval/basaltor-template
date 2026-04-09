import { siteConfig } from "@/config/site";

export function formatMoney(amountMinor: number, currency: string = siteConfig.currency, locale: string = siteConfig.locale) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinor / 100);
}
