import { createFileRoute, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toArray } from "@/lib/collections";
import { getSession } from "@/lib/session";
import { getMyLicenses } from "@/modules/orders/orders.functions";

export const Route = createFileRoute("/licenses")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/sign-in" });
    }

    return { session };
  },
  loader: () => getMyLicenses(),
  component: LicensesPage,
});

function LicensesPage() {
  const loaderData = Route.useLoaderData();
  const data = toArray<(typeof loaderData)[number]>(loaderData);
  const { session } = Route.useRouteContext();

  return (
    <AppShell role={session.user.role} sectionLabel="Account" title="Licenses" description="Every delivered key tied to the current user account appears here with source order context.">
      {data.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((entry) => (
            <Card key={entry.allocation.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base uppercase tracking-[0.14em]">{entry.product?.name ?? entry.item.productName}</CardTitle>
                    <CardDescription>{entry.item.variantName}</CardDescription>
                  </div>
                  <Badge variant="outline">{entry.order.publicId}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {entry.category ? <p className="text-muted-foreground">Category: {entry.category.name}</p> : null}
                <div className="border border-border px-3 py-2 font-mono text-xs break-all">{entry.allocation.deliveredKey}</div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(entry.allocation.deliveredKey)}>
                    Copy key
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Delivered {new Date(entry.allocation.deliveredAt).toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <AlertDescription>No licenses have been delivered to this account yet.</AlertDescription>
        </Alert>
      )}
    </AppShell>
  );
}
