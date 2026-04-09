import { useState } from "react";
import { z } from "zod";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import { clearCart } from "@/modules/cart/cart.store";
import { resolveMockCheckout } from "@/modules/checkout/checkout.functions";
import { getMockPayment } from "@/modules/orders/orders.functions";

const mockCheckoutSearchSchema = z.object({
  token: z.string().min(1).optional(),
});

export const Route = createFileRoute("/checkout/mock/$attemptPublicId")({
  validateSearch: (search) => mockCheckoutSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: ({ params, deps }) => getMockPayment({ data: { publicId: params.attemptPublicId, guestToken: deps.token } }),
  component: MockPaymentPage,
});

function MockPaymentPage() {
  const router = useRouter();
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const resolveMockCheckoutFn = useServerFn(resolveMockCheckout);
  const [pending, setPending] = useState<null | "paid" | "failed">(null);
  const [error, setError] = useState<string | null>(null);

  if (!data) {
    return (
      <main className="mx-auto flex w-full max-w-4xl px-4 py-10 md:px-6">
        <Alert>
          <AlertDescription>Payment attempt not found.</AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 md:px-6">
      <div className="space-y-2 rounded-none bg-card p-6 ring-1 ring-foreground/10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Mock provider</p>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-medium tracking-tight">{data.attempt.providerLabel || data.attempt.provider}</h1>
          <Badge variant="outline">{data.attempt.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Use this development page to simulate payment outcomes and verify end-to-end order fulfillment.</p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <CardDescription>{data.order.publicId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border border-border px-3 py-2">
                <div>
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-xs text-muted-foreground">{item.variantName} × {item.quantity}</div>
                </div>
                <div>{formatMoney(item.totalPriceMinor, item.currency)}</div>
              </div>
            ))}
            <div className="flex items-center justify-between border border-border px-3 py-2 text-base font-medium">
              <span>Total</span>
              <span>{formatMoney(data.order.totalMinor, data.order.currency)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhook simulation</CardTitle>
            <CardDescription>Mark the attempt as paid to allocate keys and move the order into a fulfilled state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Provider reference: <span className="font-mono text-foreground">{data.attempt.providerReference}</span></p>
            <p>Attempt public ID: <span className="font-mono text-foreground">{data.attempt.publicId}</span></p>
            {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              disabled={pending !== null}
              onClick={async () => {
                try {
                  setPending("paid");
                  setError(null);
                  const result = await resolveMockCheckoutFn({
                    data: { paymentAttemptPublicId: data.attempt.publicId, outcome: "paid", guestToken: search.token },
                  });
                  clearCart();

                  if (result.customerMode === "guest" && result.guestToken) {
                    await router.navigate({ to: "/guest/orders/$publicId", params: { publicId: result.orderPublicId }, search: { token: result.guestToken } });
                    return;
                  }

                  await router.navigate({ to: "/orders/$publicId", params: { publicId: result.orderPublicId } });
                } catch (caught) {
                  setPending(null);
                  setError(caught instanceof Error ? caught.message : "Payment simulation failed.");
                }
              }}
            >
              {pending === "paid" ? "Allocating keys…" : "Simulate successful payment"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={pending !== null}
              onClick={async () => {
                try {
                  setPending("failed");
                  setError(null);
                  const result = await resolveMockCheckoutFn({
                    data: { paymentAttemptPublicId: data.attempt.publicId, outcome: "failed", guestToken: search.token },
                  });

                  if (result.customerMode === "guest" && result.guestToken) {
                    await router.navigate({ to: "/guest/orders/$publicId", params: { publicId: result.orderPublicId }, search: { token: result.guestToken } });
                    return;
                  }

                  await router.navigate({ to: "/orders/$publicId", params: { publicId: result.orderPublicId } });
                } catch (caught) {
                  setPending(null);
                  setError(caught instanceof Error ? caught.message : "Failure simulation failed.");
                }
              }}
            >
              {pending === "failed" ? "Marking failed…" : "Simulate failure"}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/cart">Back to cart</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
