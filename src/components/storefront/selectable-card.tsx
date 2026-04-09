import { cn } from "@/lib/utils";

type SelectableCardProps = {
  active?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function SelectableCard({ active = false, disabled = false, className, children, ...props }: SelectableCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex w-full flex-col gap-2 border px-3 py-3 text-left transition-all duration-150 ease-out",
        active ? "border-foreground bg-card shadow-[4px_4px_0_0_theme(colors.foreground)]" : "border-border hover:border-foreground/40 hover:bg-muted/30",
        disabled && "cursor-not-allowed border-border/60 bg-muted/20 text-muted-foreground opacity-60 shadow-none hover:border-border/60 hover:bg-muted/20",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
