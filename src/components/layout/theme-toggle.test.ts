import { describe, expect, it } from "vitest";

import { getActiveThemeOption } from "@/components/layout/theme-toggle";

describe("getActiveThemeOption", () => {
  it("returns null before hydration completes", () => {
    expect(getActiveThemeOption("dark", false)).toBeNull();
  });

  it("treats missing theme state as system after hydration", () => {
    expect(getActiveThemeOption(undefined, true)).toBe("system");
  });

  it("keeps the explicit system selection active instead of the resolved theme", () => {
    expect(getActiveThemeOption("system", true)).toBe("system");
  });

  it("keeps explicit light and dark selections active", () => {
    expect(getActiveThemeOption("light", true)).toBe("light");
    expect(getActiveThemeOption("dark", true)).toBe("dark");
  });
});
