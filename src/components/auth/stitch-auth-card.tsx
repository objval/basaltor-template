import { Link } from "@tanstack/react-router";

import { BrandMark } from "@/components/layout/brand-mark";
import { cn } from "@/lib/utils";

export function StitchAuthCard({
  eyebrow,
  title,
  description,
  children,
  footerAction,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  footerAction?: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-[calc(100svh-4rem)] flex-1 items-center justify-center overflow-x-hidden px-4 py-6 md:px-6 md:py-10">
      <DotGrid />
      <div className="z-10 w-full max-w-md border border-border bg-card">
        <div className="h-px w-full bg-border" />
        <div className="space-y-8 p-6 md:p-8">
          <BrandMark align="center" className="mx-auto bg-transparent" />
          <div className="space-y-2 text-center">
            <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {eyebrow}
            </span>
            <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground md:text-[1.75rem]">
              {title}
            </h1>
            {description ? (
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {children}
        </div>
        {footerAction ? (
          <div className="border-t border-border/80 bg-background px-6 py-4 md:px-8">
            {footerAction}
          </div>
        ) : null}
      </div>
      <AuthPageAccent />
    </main>
  );
}

export function StitchAuthFieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
      {children}
    </label>
  );
}

export function StitchAuthInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "w-full border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export function StitchAuthPrimaryButton({
  children,
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "w-full border border-border bg-primary px-4 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-primary-foreground transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function StitchAuthOutlineButton({
  children,
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "shrink-0 border border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-accent disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function StitchAuthError({ message }: { message: string }) {
  return (
    <div className="border border-destructive/30 bg-destructive/10 px-4 py-3 font-mono text-xs text-destructive">
      {message}
    </div>
  );
}

export function StitchAuthLink({
  children,
  className,
  to,
  search,
}: {
  children: React.ReactNode;
  className?: string;
  to: string;
  search?: any;
}) {
  return (
    <Link
      to={to}
      search={search}
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}

function DotGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
      style={{
        backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />
  );
}

function AuthPageAccent() {
  return (
    <>
      <div className="pointer-events-none fixed bottom-0 right-0 hidden select-none p-12 lg:block">
        <h2 className="font-mono text-[7rem] font-extrabold leading-none text-accent/40">
          AUTH
        </h2>
      </div>
      <div className="pointer-events-none fixed bottom-12 left-12 hidden h-px w-32 bg-border lg:block" />
      <div className="pointer-events-none fixed top-24 right-12 hidden h-32 w-px bg-border lg:block" />
    </>
  );
}
