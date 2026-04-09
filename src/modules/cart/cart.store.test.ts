import { beforeEach, describe, expect, it } from "vitest";

import { addCartItem, cartStore, clearCart, getCartTotals, updateCartItemQuantity } from "@/modules/cart/cart.store";

describe("cartStore", () => {
  beforeEach(() => {
    cartStore.setState(() => ({ hydrated: true, selectedProvider: null, items: [] }));
  });

  it("merges duplicate variant lines and totals quantities", () => {
    addCartItem({
      productId: "p1",
      productSlug: "midnight",
      productName: "Midnight",
      variantId: "v1",
      variantName: "1 Week",
      variantSlug: "one-week",
      durationDays: 7,
      unitPriceMinor: 1499,
      currency: "USD",
      quantity: 1,
    });
    addCartItem({
      productId: "p1",
      productSlug: "midnight",
      productName: "Midnight",
      variantId: "v1",
      variantName: "1 Week",
      variantSlug: "one-week",
      durationDays: 7,
      unitPriceMinor: 1499,
      currency: "USD",
      quantity: 2,
    });

    expect(cartStore.state.items).toHaveLength(1);
    expect(cartStore.state.items[0]?.quantity).toBe(3);
    expect(getCartTotals(cartStore.state)).toEqual({ itemCount: 3, subtotalMinor: 4497 });
  });

  it("removes a line when quantity is updated to zero", () => {
    addCartItem({
      productId: "p1",
      productSlug: "midnight",
      productName: "Midnight",
      variantId: "v2",
      variantName: "1 Day",
      variantSlug: "one-day",
      durationDays: 1,
      unitPriceMinor: 499,
      currency: "USD",
      quantity: 1,
    });

    updateCartItemQuantity("p1:v2", 0);

    expect(cartStore.state.items).toHaveLength(0);
    clearCart();
  });
});
