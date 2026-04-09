import { describe, expect, it } from "vitest";

import { parseServerEnv } from "@/lib/env";

describe("parseServerEnv", () => {
  it("provides safe development defaults", () => {
    const env = parseServerEnv({});

    expect(env.APP_URL).toBe("http://127.0.0.1:3000");
    expect(env.DATABASE_URL).toContain("postgres://basaltor");
    expect(env.SMTP_PORT).toBe(1025);
  });

  it("requires a non-default secret in production", () => {
    expect(() =>
      parseServerEnv({
        NODE_ENV: "production",
        BETTER_AUTH_SECRET: "dev-only-change-me-dev-only-change-me",
      }),
    ).toThrow(/BETTER_AUTH_SECRET/);
  });
});
