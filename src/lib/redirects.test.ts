import { describe, expect, it } from "vitest";

import { normalizeRedirectPath, toRelativeAppPath } from "@/lib/redirects";

describe("redirect helpers", () => {
  it("accepts safe in-app redirect paths", () => {
    expect(normalizeRedirectPath("/orders?filter=paid#latest")).toBe("/orders?filter=paid#latest");
  });

  it("rejects external or malformed redirect targets", () => {
    expect(normalizeRedirectPath("https://evil.example/steal")).toBe("/dashboard");
    expect(normalizeRedirectPath("//evil.example/steal")).toBe("/dashboard");
    expect(normalizeRedirectPath("orders")).toBe("/dashboard");
  });

  it("converts app absolute URLs back into relative paths", () => {
    expect(toRelativeAppPath("https://store.example/orders/ABC?tab=items#notes")).toBe(
      "/orders/ABC?tab=items#notes",
    );
  });

  it("falls back when the location cannot be normalized", () => {
    expect(toRelativeAppPath("not a url", "/profile")).toBe("/profile");
  });
});
