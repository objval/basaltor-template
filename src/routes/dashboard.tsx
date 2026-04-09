import { createFileRoute, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toArray } from "@/lib/collections";
import { getSession } from "@/lib/session";
import { getMyLicenses, getMyOrders } from "@/modules/orders/orders.functions";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/sign-in" });
    }

    return { session };
  },
  loader: async () => {
    const [orders, licenses] = await Promise.all([getMyOrders(), getMyLicenses()]);
    return {
      orders,
      licenses,
    };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { session } = Route.useRouteContext();
  const loaderData = Route.useLoaderData();
  const orders = toArray<(typeof loaderData.orders)[number]>(loaderData.orders);
  const licenses = toArray<(typeof loaderData.licenses)[number]>(loaderData.licenses);

  return (
    <AppShell
      role={session.user.role}
      sectionLabel="Account"
      title="Overview"
      description="Your account, orders, and delivered licenses at a glance."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{orders.length} total</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Licenses</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{licenses.length} delivered</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Role</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{session.user.role}</Badge>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
