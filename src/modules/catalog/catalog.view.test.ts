import { describe, expect, it } from "vitest";

import { deriveProductAvailability, getDefaultVariantSelection } from "@/modules/catalog/catalog.view";

describe("catalog availability view models", () => {
  it("chooses an in-stock default variant before falling back", () => {
    const selected = getDefaultVariantSelection([
      { id: "sold-out-default", isDefault: true, stockMode: "finite", availableKeys: 0 },
      { id: "week", isDefault: false, stockMode: "finite", availableKeys: 2 },
      { id: "month", isDefault: false, stockMode: "finite", availableKeys: 5 },
    ]);

    expect(selected.id).toBe("week");
  });

  it("derives sold-out and lowest purchasable price states", () => {
    const availability = deriveProductAvailability([
      { id: "day", isDefault: false, stockMode: "finite", availableKeys: 0, priceMinor: 499 },
      { id: "week", isDefault: false, stockMode: "finite", availableKeys: 2, priceMinor: 1499 },
      { id: "month", isDefault: false, stockMode: "unlimited", availableKeys: 0, priceMinor: 3999 },
    ]);

    expect(availability.hasPurchasableVariants).toBe(true);
    expect(availability.lowestPurchasablePriceMinor).toBe(1499);
    expect(availability.variantStateById.day.isPurchasable).toBe(false);
    expect(availability.variantStateById.week.isLowStock).toBe(true);
    expect(availability.variantStateById.month.isPurchasable).toBe(true);
  });
});
