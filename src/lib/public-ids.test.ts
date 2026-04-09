import { describe, expect, it } from "vitest";

import { generatePublicOrderId, generatePublicPaymentAttemptId, maskLicenseKey } from "@/lib/public-ids";

describe("public id helpers", () => {
  it("creates formatted public ids", () => {
    expect(generatePublicOrderId()).toMatch(/^BST-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(generatePublicPaymentAttemptId("stripe")).toMatch(/^STRIPE-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it("masks long license keys", () => {
    expect(maskLicenseKey("MIDNIGHT-1M-ABCDE12345")).toMatch(/^MIDN••••2345$/);
  });
});
