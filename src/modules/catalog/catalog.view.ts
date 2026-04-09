export type CatalogAvailabilityVariant = {
  id: string;
  isDefault: boolean;
  stockMode: "finite" | "unlimited";
  availableKeys: number;
  priceMinor?: number;
};

export type CatalogVariantState = {
  isPurchasable: boolean;
  isLowStock: boolean;
};

export function getVariantState(variant: CatalogAvailabilityVariant): CatalogVariantState {
  const isPurchasable = variant.stockMode === "unlimited" || variant.availableKeys > 0;
  const isLowStock = variant.stockMode === "finite" && variant.availableKeys > 0 && variant.availableKeys <= 3;

  return {
    isPurchasable,
    isLowStock,
  };
}

export function getDefaultVariantSelection<T extends CatalogAvailabilityVariant>(variants: Array<T>) {
  const purchasableDefault = variants.find((variant) => variant.isDefault && getVariantState(variant).isPurchasable);
  if (purchasableDefault) return purchasableDefault;

  const firstPurchasable = variants.find((variant) => getVariantState(variant).isPurchasable);
  if (firstPurchasable) return firstPurchasable;

  return variants.find((variant) => variant.isDefault) || variants[0] || null;
}

export function deriveProductAvailability<T extends CatalogAvailabilityVariant>(variants: Array<T>) {
  const variantStateById = Object.fromEntries(variants.map((variant) => [variant.id, getVariantState(variant)]));
  const purchasableVariants = variants.filter((variant) => variantStateById[variant.id].isPurchasable);

  return {
    hasPurchasableVariants: purchasableVariants.length > 0,
    lowestPurchasablePriceMinor: purchasableVariants.length
      ? Math.min(...purchasableVariants.map((variant) => variant.priceMinor ?? Number.POSITIVE_INFINITY))
      : null,
    variantStateById,
  };
}
