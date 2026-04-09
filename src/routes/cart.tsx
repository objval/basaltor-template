import { Link, createFileRoute } from "@tanstack/react-router";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import { formatProviderSummary, getEnabledPaymentProviderNames } from "@/modules/payments/core/presentation";
import { clearCart, removeCartItem, updateCartItemQuantity } from "@/modules/cart/cart.store";
import { useCartState, useCartTotals } from "@/modules/cart/use-cart";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const cart = useCartState();
  const totals = useCartTotals();
  const providerSummary = formatProviderSummary(getEnabledPaymentProviderNames());

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <div className="space-y-2 rounded-none bg-card p-6 ring-1 ring-foreground/10">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Cart</p>
            <h1 className="text-2xl font-medium tracking-tight">Review your license bundle</h1>
            <p className="text-sm text-muted-foreground">You can update quantities here, then continue to checkout as a guest or with your account.</p>
          </div>

          {cart.items.length ? (
            cart.items.map((item) => (
              <Card key={item.cartLineId}>
                <CardContent className="flex flex-col gap-4 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-medium uppercase tracking-[0.14em]">{item.productName}</div>
                      <div className="text-xs text-muted-foreground">{item.variantName} · {item.durationDays ? `${item.durationDays} days` : "Timed access"}</div>
                      <div className="text-xs text-muted-foreground">{formatMoney(item.unitPriceMinor, item.currency)} each</div>
                      <Link to="/products/$slug" params={{ slug: item.productSlug }} className="text-xs underline underline-offset-4">
                        Edit product selection
                      </Link>
                    </div>
                    <div className="text-right text-sm font-medium">{formatMoney(item.unitPriceMinor * item.quantity, item.currency)}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => updateCartItemQuantity(item.cartLineId, item.quantity - 1)}>
                      −
                    </Button>
                    <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                    <Button variant="outline" size="sm" onClick={() => updateCartItemQuantity(item.cartLineId, item.quantity + 1)}>
                      +
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeCartItem(item.cartLineId)}>
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Alert>
              <AlertDescription>Your cart is empty. Add at least one license variant from the storefront before checking out.</AlertDescription>
            </Alert>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <CardDescription>{totals.itemCount} license{totals.itemCount === 1 ? "" : "s"} in cart</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between border border-border px-3 py-2">
              <span>Subtotal</span>
              <span>{formatMoney(totals.subtotalMinor, cart.items[0]?.currency ?? "USD")}</span>
            </div>
            <div className="flex items-center justify-between border border-border px-3 py-2">
              <span>Checkout options</span>
              <span>Guest or account</span>
            </div>
            <div className="flex items-center justify-between border border-border px-3 py-2">
              <span>Payment providers</span>
              <span>{providerSummary}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" asChild disabled={!cart.items.length}>
              <Link to="/checkout">Continue to checkout</Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={() => clearCart()} disabled={!cart.items.length}>
              Clear cart
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
