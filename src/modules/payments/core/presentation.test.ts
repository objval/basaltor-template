import { describe, expect, it } from "vitest";

import { formatProviderSummary, getEnabledPaymentProviderNames } from "@/modules/payments/core/presentation";

describe("payment provider presentation", () => {
  it("lists the configured provider display names", () => {
    expect(getEnabledPaymentProviderNames()).toEqual(["Stripe", "Paddle"]);
  });

  it("formats provider names for compact UI copy", () => {
    expect(formatProviderSummary(["Stripe", "Paddle"])).toBe("Stripe / Paddle");
    expect(formatProviderSummary(["Stripe"])).toBe("Stripe");
    expect(formatProviderSummary([])).toBe("Configured at checkout");
  });
});
