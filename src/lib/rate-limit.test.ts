import { afterEach, describe, expect, it } from "vitest";

import { clearRateLimitStore, deriveRateLimitActor, enforceRateLimit, getRateLimitState } from "@/lib/rate-limit";

afterEach(() => {
  clearRateLimitStore();
});

describe("rate limit helpers", () => {
  it("allows requests until the limit is reached", () => {
    expect(
      getRateLimitState({ bucket: "checkout", key: "ip:127.0.0.1", max: 2, windowMs: 1000, now: 1 }).allowed,
    ).toBe(true);

    expect(
      getRateLimitState({ bucket: "checkout", key: "ip:127.0.0.1", max: 2, windowMs: 1000, now: 2 }).allowed,
    ).toBe(true);

    expect(
      getRateLimitState({ bucket: "checkout", key: "ip:127.0.0.1", max: 2, windowMs: 1000, now: 3 }).allowed,
    ).toBe(false);
  });

  it("resets after the time window expires", () => {
    expect(
      getRateLimitState({ bucket: "checkout", key: "ip:127.0.0.1", max: 1, windowMs: 1000, now: 1 }).allowed,
    ).toBe(true);

    expect(
      getRateLimitState({ bucket: "checkout", key: "ip:127.0.0.1", max: 1, windowMs: 1000, now: 2 }).allowed,
    ).toBe(false);

    expect(
      getRateLimitState({ bucket: "checkout", key: "ip:127.0.0.1", max: 1, windowMs: 1000, now: 1002 }).allowed,
    ).toBe(true);
  });

  it("throws a 429 response when enforcing an exceeded limit", () => {
    enforceRateLimit({ bucket: "checkout", key: "ip:127.0.0.1", max: 1, windowMs: 1000, now: 1 });

    expect(() =>
      enforceRateLimit({ bucket: "checkout", key: "ip:127.0.0.1", max: 1, windowMs: 1000, now: 2 }),
    ).toThrowError(Response);
  });

  it("derives the actor from forwarded proxy headers", () => {
    const headers = new Headers({
      "x-forwarded-for": "100.73.192.82, 127.0.0.1",
    });

    expect(deriveRateLimitActor(headers, "fallback")).toBe("100.73.192.82");
  });
});
