import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { OrderDetailView } from "@/components/orders/order-detail-view";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getGuestOrder } from "@/modules/orders/orders.functions";

const guestSearchSchema = z.object({
  token: z.string().min(1),
});

export const Route = createFileRoute("/guest/orders/$publicId")({
  validateSearch: (search) => guestSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: ({ params, deps }) => getGuestOrder({ data: { publicId: params.publicId, token: deps.token } }),
  component: GuestOrderPage,
});

function GuestOrderPage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();

  if (!data) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Order not found</CardTitle>
            <CardDescription>This guest access link is invalid, expired, or no longer available.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const retryHref = data.paymentAttempts.length > 0 && data.status !== "fulfilled"
    ? `/checkout/mock/${data.paymentAttempts[0].publicId}?token=${encodeURIComponent(search.token)}`
    : null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-6">
      <div className="space-y-2 rounded-none bg-card p-6 ring-1 ring-foreground/10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Guest order access</p>
        <h1 className="text-2xl font-medium tracking-tight">{data.publicId}</h1>
        <p className="text-sm text-muted-foreground">Use this secure link to review payment status, retry a failed mock payment, and retrieve your delivered licenses.</p>
      </div>
      <OrderDetailView data={data} retryHref={retryHref} />
    </main>
  );
}
