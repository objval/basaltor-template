import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { RiComputerLine, RiMoonLine, RiSunLine } from "@remixicon/react";

import { Button } from "@/components/ui/button";

const themes = [
  { label: "light", icon: RiSunLine },
  { label: "dark", icon: RiMoonLine },
  { label: "system", icon: RiComputerLine },
] as const;

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme: selectedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-1 border border-border bg-background p-1">
      {themes.map((option) => {
        const Icon = option.icon;
        const active =
          mounted &&
          (option.label === (selectedTheme ?? "system") ||
            (selectedTheme === "system" && option.label === resolvedTheme));

        return (
          <Button
            key={option.label}
            type="button"
            variant={active ? "default" : "ghost"}
            size="icon-sm"
            aria-label={`Switch to ${option.label} theme`}
            onClick={() => setTheme(option.label)}
          >
            <Icon className="size-4" />
          </Button>
        );
      })}
    </div>
  );
}
