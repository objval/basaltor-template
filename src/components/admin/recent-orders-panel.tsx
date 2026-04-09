import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";

export function RecentOrdersPanel({
  orders,
}: {
  orders: Array<{
    id: string;
    publicId: string;
    status: string;
    currency: string;
    totalMinor: number;
    createdAt: Date;
    customerMode: string;
    customerName: string;
    customerEmail: string;
    placedFromIp: string | null;
    paymentAttempt: { provider: string; status: string } | null;
    allocationCount: number;
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent orders</CardTitle>
        <CardDescription>Newest orders with customer identity, payment state, and allocation counts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {orders.length ? (
          orders.map((order) => (
            <div key={order.id} className="space-y-3 border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium uppercase tracking-[0.14em]">{order.publicId}</div>
                  <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{order.status}</Badge>
                  <Badge variant="outline">{order.customerMode}</Badge>
                  {order.paymentAttempt ? <Badge variant="outline">{order.paymentAttempt.provider}</Badge> : null}
                </div>
              </div>
              <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                <div className="border border-border px-3 py-2">
                  <div className="uppercase tracking-[0.14em]">Customer</div>
                  <div className="mt-1 text-foreground">{order.customerName}</div>
                  <div>{order.customerEmail}</div>
                </div>
                <div className="border border-border px-3 py-2">
                  <div className="uppercase tracking-[0.14em]">Tracking</div>
                  <div className="mt-1">IP: {order.placedFromIp ?? "Unknown"}</div>
                  <div>Allocations: {order.allocationCount}</div>
                  <div>Total: {formatMoney(order.totalMinor, order.currency)}</div>
                </div>
              </div>
              <Link to="/orders/$publicId" params={{ publicId: order.publicId }} className="text-xs underline underline-offset-4">
                Open order detail
              </Link>
            </div>
          ))
        ) : (
          <div className="border border-dashed border-border px-3 py-8 text-sm text-muted-foreground">
            No orders have been created yet. Once customers start checking out, the newest activity will appear here.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
