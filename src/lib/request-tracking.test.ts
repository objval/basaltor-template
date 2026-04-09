import { describe, expect, it } from "vitest";

import { buildOrderTrackingSnapshot } from "@/lib/request-tracking";

describe("buildOrderTrackingSnapshot", () => {
  it("prefers cf-connecting-ip and captures request metadata", () => {
    const headers = new Headers({
      "cf-connecting-ip": "203.0.113.9",
      "x-forwarded-for": "198.51.100.5, 10.0.0.2",
      "user-agent": "Vitest Browser",
      referer: "https://example.com/products/midnight",
      "accept-language": "en-US,en;q=0.9",
    });

    expect(buildOrderTrackingSnapshot(headers)).toEqual({
      ipAddress: "203.0.113.9",
      userAgent: "Vitest Browser",
      referrer: "https://example.com/products/midnight",
      acceptLanguage: "en-US,en;q=0.9",
    });
  });

  it("falls back to the first forwarded ip when cf headers are missing", () => {
    const headers = new Headers({
      "x-forwarded-for": "198.51.100.5, 10.0.0.2",
    });

    expect(buildOrderTrackingSnapshot(headers).ipAddress).toBe("198.51.100.5");
  });
});
