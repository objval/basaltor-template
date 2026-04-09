import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { paymentConfig } from "@/config/payments";
import { authClient } from "@/lib/auth-client";
import { getSession } from "@/lib/session";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectableCard } from "@/components/storefront/selectable-card";
import { formatMoney } from "@/lib/money";
import { cartStore, setSelectedPaymentProvider } from "@/modules/cart/cart.store";
import { useCartState, useCartTotals } from "@/modules/cart/use-cart";
import { createCheckout } from "@/modules/checkout/checkout.functions";

export const Route = createFileRoute("/checkout")({
  loader: () => getSession(),
  component: CheckoutPage,
});

function CheckoutPage() {
  const routeSession = Route.useLoaderData();
  const clientSession = authClient.useSession();
  const session = clientSession.data ?? routeSession;
  const cart = useCartState();
  const totals = useCartTotals();
  const createCheckoutFn = useServerFn(createCheckout);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState(session?.user.name ?? "");
  const [email, setEmail] = useState(session?.user.email ?? "");
  const [contactHandle, setContactHandle] = useState("");
  const [country, setCountry] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const selectedProvider = useMemo(
    () => cart.selectedProvider ?? paymentConfig.defaultProvider,
    [cart.selectedProvider],
  );

  const checkoutMode = session ? "account" : "guest";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-6">
      <div className="space-y-2 rounded-none bg-card p-6 ring-1 ring-foreground/10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Checkout</p>
        <h1 className="text-2xl font-medium tracking-tight">Secure checkout</h1>
        <p className="text-sm text-muted-foreground">Complete your contact details, choose a payment provider, and finish the order as a guest or with your account.</p>
      </div>

      {!session ? (
        <Alert>
          <AlertDescription>
            You can place this order as a guest right now, or <Link to="/sign-in" search={{ redirect: "/checkout" }} className="underline underline-offset-4">sign in</Link> to keep everything under your account history.
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(320px,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{session ? "Account details" : "Guest details"}</CardTitle>
            <CardDescription>{session ? "Your account email will be used for this order." : "These details are stored with the order and used for guest access tracking."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="checkout-name">Full name</Label>
              <Input id="checkout-name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checkout-email">Email</Label>
              <Input id="checkout-email" type="email" value={email} readOnly={!!session} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checkout-handle">Contact handle</Label>
              <Input id="checkout-handle" value={contactHandle} onChange={(event) => setContactHandle(event.target.value)} placeholder="Discord / Telegram / preferred handle" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checkout-country">Country</Label>
              <Input id="checkout-country" value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Country or billing region" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checkout-note">Order note</Label>
              <Textarea id="checkout-note" value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} className="min-h-24" placeholder="Optional note for support, delivery context, or where you found us" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment provider</CardTitle>
            <CardDescription>Select the provider flow you want to test.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentConfig.enabledProviders.map((providerId) => {
              const provider = paymentConfig.providers[providerId];
              const active = selectedProvider === provider.id;
              return (
                <SelectableCard key={provider.id} active={active} onClick={() => setSelectedPaymentProvider(provider.id)}>
                  <div className="text-sm font-medium uppercase tracking-[0.14em]">{provider.displayName}</div>
                  <div className="text-xs text-muted-foreground">{provider.helperText}</div>
                </SelectableCard>
              );
            })}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>{totals.itemCount} license{totals.itemCount === 1 ? "" : "s"} selected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!cart.items.length ? (
              <Alert>
                <AlertDescription>
                  Your cart is empty. Go back to the <Link to="/" className="underline underline-offset-4">storefront</Link> and add at least one license.
                </AlertDescription>
              </Alert>
            ) : (
              cart.items.map((item) => (
                <div key={item.cartLineId} className="flex items-center justify-between border border-border px-3 py-2">
                  <div>
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-xs text-muted-foreground">{item.variantName} × {item.quantity}</div>
                  </div>
                  <div>{formatMoney(item.unitPriceMinor * item.quantity, item.currency)}</div>
                </div>
              ))
            )}
            <div className="flex items-center justify-between border border-border px-3 py-2 text-base font-medium">
              <span>Total</span>
              <span>{formatMoney(totals.subtotalMinor, cart.items[0]?.currency ?? "USD")}</span>
            </div>
            {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              disabled={!cart.items.length || pending}
              onClick={async () => {
                try {
                  setPending(true);
                  setError(null);
                  const result = await createCheckoutFn({
                    data: {
                      provider: selectedProvider,
                      items: cartStore.state.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
                      customer: {
                        mode: checkoutMode,
                        fullName,
                        email,
                        contactHandle,
                        country,
                        note: customerNote,
                      },
                      notes: customerNote,
                    },
                  });

                  const checkoutUrl = new URL(result.checkoutUrl, window.location.origin);
                  if (result.guestToken) {
                    checkoutUrl.searchParams.set("token", result.guestToken);
                  }
                  window.location.assign(`${checkoutUrl.pathname}${checkoutUrl.search}`);
                } catch (caught) {
                  setError(caught instanceof Error ? caught.message : "Checkout failed.");
                  setPending(false);
                }
              }}
            >
              {pending ? "Preparing checkout…" : `Continue with ${paymentConfig.providers[selectedProvider].displayName}`}
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/cart">Back to cart</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
