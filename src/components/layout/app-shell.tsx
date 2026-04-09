import { Link, useRouterState } from "@tanstack/react-router";

import { getNavigationForRole, roleLabel } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AppShell({
  role,
  title,
  description,
  sectionLabel = "Account",
  children,
}: {
  role: string | null | undefined;
  title: string;
  description: string;
  sectionLabel?: string;
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigation = getNavigationForRole(role);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
      <section className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{sectionLabel}</CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-[0.2em]">
              Role <Badge variant="outline" className="ml-2 uppercase">{roleLabel(role)}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {navigation.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center justify-between border border-border px-3 py-2 text-xs uppercase tracking-[0.18em] transition-colors",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
        <section className="space-y-6">
          <div className="space-y-2 rounded-none bg-card p-6 ring-1 ring-foreground/10">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{sectionLabel}</p>
            <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </section>
      </section>
    </main>
  );
}
