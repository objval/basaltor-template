import { Link } from "@tanstack/react-router";

import { APP_LOGO_PATH, APP_NAME } from "@/lib/app-config";
import { cn } from "@/lib/utils";

export function BrandMark({
  eyebrow,
  className,
  align = "left",
  size = "default",
}: {
  eyebrow?: string | null;
  className?: string;
  align?: "left" | "center";
  size?: "sm" | "default";
}) {
  const compact = size === "sm";

  return (
    <Link
      to="/"
      className={cn(
        "flex w-full max-w-fit items-center gap-3 border border-border/80 bg-muted/30 transition-colors hover:bg-muted/50",
        compact ? "px-2.5 py-2" : "px-4 py-3",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center border border-border/80 bg-background shadow-sm",
          compact ? "size-9 p-1.5" : "size-11 p-1.5",
        )}
      >
        <img src={APP_LOGO_PATH} alt={`${APP_NAME} logo`} className="size-full object-contain" />
      </span>
      <span className={cn("min-w-0", align === "center" ? "text-center" : "text-left")}>
        {eyebrow ? (
          <span className="block text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{eyebrow}</span>
        ) : null}
        <span className={cn("block text-foreground", compact ? "text-xs font-medium tracking-[0.18em]" : "text-sm font-medium tracking-[0.08em]")}>
          {APP_NAME}
        </span>
      </span>
    </Link>
  );
}
