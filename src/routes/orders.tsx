import { Link, createFileRoute, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toArray } from "@/lib/collections";
import { formatMoney } from "@/lib/money";
import { getSession } from "@/lib/session";
import { getMyOrders } from "@/modules/orders/orders.functions";

export const Route = createFileRoute("/orders")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/sign-in" });
    }

    return { session };
  },
  loader: () => getMyOrders(),
  component: OrdersPage,
});

function OrdersPage() {
  const loaderData = Route.useLoaderData();
  const orders = toArray<(typeof loaderData)[number]>(loaderData);
  const { session } = Route.useRouteContext();

  return (
    <AppShell role={session.user.role} sectionLabel="Account" title="Orders" description="Review payment attempts, fulfillment state, and line-item detail for your account.">
      {orders.length ? (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base uppercase tracking-[0.14em]">{order.publicId}</CardTitle>
                  <CardDescription>{new Date(order.createdAt).toLocaleString()}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{order.status}</Badge>
                  <Badge variant="outline">{order.latestPaymentAttempt.provider}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border border-border px-3 py-2">
                  <div>
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-xs text-muted-foreground">{item.variantName} × {item.quantity}</div>
                  </div>
                  <div>{formatMoney(item.totalPriceMinor, item.currency)}</div>
                </div>
              ))}
              <div className="flex items-center justify-between border border-border px-3 py-2 font-medium">
                <span>Total</span>
                <span>{formatMoney(order.totalMinor, order.currency)}</span>
              </div>
              <Link to="/orders/$publicId" params={{ publicId: order.publicId }} className="text-xs underline underline-offset-4">
                View order detail
              </Link>
            </CardContent>
          </Card>
        ))}
        </div>
      ) : (
        <Alert>
          <AlertDescription>No orders have been created for this account yet.</AlertDescription>
        </Alert>
      )}
    </AppShell>
  );
}
