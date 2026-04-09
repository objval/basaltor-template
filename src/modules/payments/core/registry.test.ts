import { describe, expect, it } from "vitest";

import { getDefaultPaymentProvider, getEnabledPaymentProviders, getPaymentProvider } from "@/modules/payments/core/registry";

describe("payment registry", () => {
  it("exposes the configured example providers", () => {
    const providers = getEnabledPaymentProviders();
    expect(providers.map((provider) => provider.id)).toEqual(["stripe", "paddle"]);
    expect(getDefaultPaymentProvider().id).toBe("stripe");
    expect(getPaymentProvider("paddle").presentation.displayName).toBe("Paddle");
  });
});
