import { describe, expect, it } from "vitest";

import { createCheckoutSchema } from "@/modules/checkout/checkout.schemas";

describe("createCheckoutSchema", () => {
  it("accepts guest checkout identity details", () => {
    const parsed = createCheckoutSchema.parse({
      provider: "stripe",
      items: [{ variantId: "550e8400-e29b-41d4-a716-446655440000", quantity: 2 }],
      customer: {
        mode: "guest",
        fullName: "Nico Guest",
        email: "guest@example.com",
        contactHandle: "discord:nico",
        country: "Chile",
        note: "Bought after seeing the midnight promo.",
      },
    });

    expect(parsed.customer.mode).toBe("guest");
    expect(parsed.customer.email).toBe("guest@example.com");
  });

  it("rejects a checkout without customer identity", () => {
    expect(() =>
      createCheckoutSchema.parse({
        provider: "stripe",
        items: [{ variantId: "550e8400-e29b-41d4-a716-446655440000", quantity: 1 }],
      }),
    ).toThrow(/customer/i);
  });
});
