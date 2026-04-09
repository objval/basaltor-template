import { brandConfig } from "@/config/brand";

export const THEME_STORAGE_KEY = "ui-theme";
export const USER_THEMES = ["light", "dark", "system"] as const;

export type UserTheme = (typeof USER_THEMES)[number];
export type AppTheme = Exclude<UserTheme, "system">;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export const THEME_META_COLORS: Record<AppTheme, string> = {
  light: brandConfig.backgroundColor,
  dark: brandConfig.themeColor,
};

export function isUserTheme(value: unknown): value is UserTheme {
  return typeof value === "string" && USER_THEMES.includes(value as UserTheme);
}

export function parseUserTheme(value: unknown): UserTheme {
  return isUserTheme(value) ? value : "system";
}

export function getStoredUserTheme(storage?: StorageLike | null): UserTheme {
  if (!storage) {
    return "system";
  }

  try {
    return parseUserTheme(storage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

export function setStoredUserTheme(theme: UserTheme, storage?: StorageLike | null): void {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures (private mode, quota, SSR).
  }
}

export function getSystemTheme(isDarkMode = false): AppTheme {
  return isDarkMode ? "dark" : "light";
}

export function resolveActiveUserTheme(userTheme: UserTheme, forcedTheme?: UserTheme): UserTheme {
  return forcedTheme ?? userTheme;
}

export function resolveAppTheme(userTheme: UserTheme, systemTheme: AppTheme): AppTheme {
  return userTheme === "system" ? systemTheme : userTheme;
}

export function getThemeClassList(userTheme: UserTheme, appTheme: AppTheme): Array<string> {
  return userTheme === "system" ? [appTheme, "system"] : [appTheme];
}

export function disableTransitionsTemporarily(): (() => void) | null {
  if (typeof document === "undefined") {
    return null;
  }

  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;transition:none!important}",
    ),
  );
  document.head.appendChild(style);

  return () => {
    window.getComputedStyle(document.body);
    window.setTimeout(() => {
      style.remove();
    }, 1);
  };
}

export function buildThemeScript(): string {
  const storageKey = JSON.stringify(THEME_STORAGE_KEY);
  const colors = JSON.stringify(THEME_META_COLORS);

  return `(() => {
    const storageKey = ${storageKey};
    const colors = ${colors};
    const themes = ['light', 'dark', 'system'];
    const root = document.documentElement;
    const stored = localStorage.getItem(storageKey);
    const userTheme = themes.includes(stored) ? stored : 'system';
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const appTheme = userTheme === 'system' ? systemTheme : userTheme;
    root.classList.remove('light', 'dark', 'system');
    root.classList.add(appTheme);
    if (userTheme === 'system') {
      root.classList.add('system');
    }
    root.style.colorScheme = appTheme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', colors[appTheme]);
    }
  })()`;
}
