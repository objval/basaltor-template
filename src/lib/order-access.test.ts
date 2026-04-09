import { describe, expect, it } from "vitest";

import { buildGuestOrderAccessUrl, hashGuestAccessToken, verifyGuestAccessToken } from "@/lib/order-access";

describe("guest order access", () => {
  it("hashes and verifies guest access tokens deterministically", () => {
    const token = "guest_access_token_example";
    const hash = hashGuestAccessToken(token);

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hashGuestAccessToken(token)).toBe(hash);
    expect(verifyGuestAccessToken({ token, tokenHash: hash })).toBe(true);
    expect(verifyGuestAccessToken({ token: "wrong", tokenHash: hash })).toBe(false);
  });

  it("builds a guest order access URL that preserves the order id and token", () => {
    expect(
      buildGuestOrderAccessUrl({
        appUrl: "http://localhost:3010",
        publicId: "BST-TEST-1234",
        token: "secret-token",
      }),
    ).toBe("http://localhost:3010/guest/orders/BST-TEST-1234?token=secret-token");
  });
});
