import { ScriptOnce } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { AppTheme, UserTheme } from "@/lib/theme";
import {
  THEME_META_COLORS,
  THEME_STORAGE_KEY,
  buildThemeScript,
  disableTransitionsTemporarily,
  getStoredUserTheme,
  getSystemTheme,
  getThemeClassList,
  parseUserTheme,
  resolveActiveUserTheme,
  resolveAppTheme,
  setStoredUserTheme,
} from "@/lib/theme";

type ThemeContextValue = {
  appTheme: AppTheme;
  forcedTheme?: UserTheme;
  setTheme: (theme: UserTheme) => void;
  systemTheme: AppTheme;
  userTheme: UserTheme;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const THEME_SCRIPT = buildThemeScript();

function getPreferredSchemeQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }

  return window.matchMedia("(prefers-color-scheme: dark)");
}

function updateThemeColorMeta(appTheme: AppTheme): void {
  if (typeof document === "undefined") {
    return;
  }

  const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  themeColorMeta?.setAttribute("content", THEME_META_COLORS[appTheme]);
}

function applyTheme(userTheme: UserTheme, appTheme: AppTheme): void {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.remove("light", "dark", "system");
  root.classList.add(...getThemeClassList(userTheme, appTheme));
  root.style.colorScheme = appTheme;
  updateThemeColorMeta(appTheme);
}

type AppThemeProviderProps = {
  children: React.ReactNode;
  disableTransitionOnChange?: boolean;
  forcedTheme?: UserTheme;
};

export function AppThemeProvider({
  children,
  disableTransitionOnChange = false,
  forcedTheme,
}: AppThemeProviderProps) {
  const [userTheme, setUserThemeState] = useState<UserTheme>(() =>
    getStoredUserTheme(typeof window === "undefined" ? null : window.localStorage),
  );
  const [systemTheme, setSystemTheme] = useState<AppTheme>(() => {
    const preferredSchemeQuery = getPreferredSchemeQuery();
    return getSystemTheme(preferredSchemeQuery?.matches);
  });

  const activeUserTheme = resolveActiveUserTheme(userTheme, forcedTheme);
  const appTheme = resolveAppTheme(activeUserTheme, systemTheme);

  useEffect(() => {
    const restoreTransitions = disableTransitionOnChange ? disableTransitionsTemporarily() : null;
    applyTheme(activeUserTheme, appTheme);
    restoreTransitions?.();
  }, [activeUserTheme, appTheme, disableTransitionOnChange]);

  useEffect(() => {
    setStoredUserTheme(userTheme, typeof window === "undefined" ? null : window.localStorage);
  }, [userTheme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      setUserThemeState(parseUserTheme(event.newValue));
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (activeUserTheme !== "system") {
      return;
    }

    const preferredSchemeQuery = getPreferredSchemeQuery();
    if (!preferredSchemeQuery) {
      return;
    }

    const syncSystemTheme = () => {
      setSystemTheme(getSystemTheme(preferredSchemeQuery.matches));
    };

    syncSystemTheme();
    preferredSchemeQuery.addEventListener("change", syncSystemTheme);

    return () => {
      preferredSchemeQuery.removeEventListener("change", syncSystemTheme);
    };
  }, [activeUserTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      appTheme,
      forcedTheme,
      setTheme: (theme) => {
        if (forcedTheme) {
          return;
        }

        setUserThemeState(theme);

        if (theme === "system") {
          const preferredSchemeQuery = getPreferredSchemeQuery();
          setSystemTheme(getSystemTheme(preferredSchemeQuery?.matches));
        }
      },
      systemTheme,
      userTheme,
    }),
    [appTheme, forcedTheme, systemTheme, userTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ScriptOnce>{THEME_SCRIPT}</ScriptOnce>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within an AppThemeProvider");
  }

  return context;
}
