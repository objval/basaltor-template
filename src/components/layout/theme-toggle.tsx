import { RiComputerLine, RiMoonLine, RiSunLine } from "@remixicon/react";
import { useEffect, useState } from "react";

import type { UserTheme } from "@/lib/theme";
import { useAppTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";

type ThemeOption = UserTheme;

const themes = [
  { label: "light", icon: RiSunLine },
  { label: "dark", icon: RiMoonLine },
  { label: "system", icon: RiComputerLine },
] as const;

export function getActiveThemeOption(theme: UserTheme | undefined, mounted: boolean): ThemeOption | null {
  if (!mounted) {
    return null;
  }

  return theme ?? "system";
}

export function ThemeToggle() {
  const { appTheme, forcedTheme, setTheme, userTheme } = useAppTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = getActiveThemeOption(forcedTheme ?? userTheme, mounted);
  const effectiveTheme = mounted ? appTheme : null;
  const switchingDisabled = !mounted || !!forcedTheme;

  return (
    <div className="flex items-center gap-1 border border-border bg-background p-1" aria-label="Theme switcher" role="group">
      {themes.map((option) => {
        const Icon = option.icon;
        const active = option.label === activeTheme;
        const label = `Switch to ${option.label} theme`;
        const title = forcedTheme
          ? `Theme is locked to ${forcedTheme} on this page`
          : option.label === "system" && effectiveTheme
            ? `Follow system theme (currently ${effectiveTheme})`
            : undefined;

        return (
          <Button
            key={option.label}
            type="button"
            variant={active ? "default" : "ghost"}
            size="icon-sm"
            aria-label={label}
            aria-pressed={active}
            title={title}
            disabled={switchingDisabled}
            onClick={() => {
              if (switchingDisabled) {
                return;
              }

              setTheme(option.label);
            }}
          >
            <Icon className="size-4" />
          </Button>
        );
      })}
    </div>
  );
}
