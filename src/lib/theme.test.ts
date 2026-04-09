import { describe, expect, it } from "vitest";

import {
  THEME_META_COLORS,
  THEME_STORAGE_KEY,
  buildThemeScript,
  getStoredUserTheme,
  getSystemTheme,
  getThemeClassList,
  parseUserTheme,
  resolveActiveUserTheme,
  resolveAppTheme,
  setStoredUserTheme,
} from "@/lib/theme";

describe("theme helpers", () => {
  it("parses invalid theme values back to system", () => {
    expect(parseUserTheme("dark")).toBe("dark");
    expect(parseUserTheme("broken")).toBe("system");
    expect(parseUserTheme(null)).toBe("system");
  });

  it("reads and writes stored theme safely", () => {
    const storage = new Map<string, string>();
    const storageLike = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
    };

    expect(getStoredUserTheme(storageLike)).toBe("system");

    setStoredUserTheme("dark", storageLike);
    expect(getStoredUserTheme(storageLike)).toBe("dark");
  });

  it("resolves system theme, forced themes, and theme classes correctly", () => {
    expect(getSystemTheme(true)).toBe("dark");
    expect(getSystemTheme(false)).toBe("light");
    expect(resolveActiveUserTheme("light", "dark")).toBe("dark");
    expect(resolveActiveUserTheme("system", undefined)).toBe("system");
    expect(resolveAppTheme("system", "dark")).toBe("dark");
    expect(resolveAppTheme("light", "dark")).toBe("light");
    expect(getThemeClassList("system", "dark")).toEqual(["dark", "system"]);
    expect(getThemeClassList("light", "light")).toEqual(["light"]);
  });

  it("builds a theme bootstrap script with storage key and meta colors", () => {
    const script = buildThemeScript();

    expect(script).toContain(THEME_STORAGE_KEY);
    expect(script).toContain("prefers-color-scheme: dark");
    expect(script).toContain(THEME_META_COLORS.light);
    expect(script).toContain(THEME_META_COLORS.dark);
  });
});
