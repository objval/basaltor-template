import { useMemo, useState } from "react";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectableCard } from "@/components/storefront/selectable-card";
import { formatMoney } from "@/lib/money";
import { addCartItem } from "@/modules/cart/cart.store";
import { getProductBySlug } from "@/modules/catalog/catalog.functions";
import { getDefaultVariantSelection } from "@/modules/catalog/catalog.view";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    const data = await getProductBySlug({ data: { slug: params.slug } });
    if (!data) {
      throw redirect({ to: "/" });
    }

    return data;
  },
  component: ProductPage,
});

function clampQty(qty: number, max: number): number {
  if (max <= 0) return 1;
  return Math.min(Math.max(qty, 1), max);
}

function ProductPage() {
  const data = Route.useLoaderData();
  const defaultVariant = getDefaultVariantSelection(data.variants);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(defaultVariant.id);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const selectedVariant = useMemo(
    () => data.variants.find((variant) => variant.id === selectedVariantId) || getDefaultVariantSelection(data.variants),
    [data.variants, selectedVariantId],
  );

  const maxQuantity = selectedVariant.stockMode === "finite" ? Math.max(selectedVariant.availableKeys, 1) : 25;
  const clampedQuantity = clampQty(quantity, maxQuantity);
  const canPurchase = selectedVariant.isPurchasable;
  const orderTotal = selectedVariant.priceMinor * clampedQuantity;

  function selectVariant(variantId: string) {
    setSelectedVariantId(variantId);
    const variant = data.variants.find((v) => v.id === variantId);
    if (variant && variant.stockMode === "finite") {
      setQuantity((current) => clampQty(current, Math.max(variant.availableKeys, 1)));
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4 rounded-none bg-card p-8 ring-1 ring-foreground/10">
          <div className="flex flex-wrap gap-2">
            {data.category ? <Badge variant="outline">{data.category.name}</Badge> : null}
            {data.product.badge ? <Badge variant="outline">{data.product.badge}</Badge> : null}
            {!data.variants.some((variant) => variant.isPurchasable) ? <Badge variant="outline">Sold out</Badge> : null}
          </div>
          <h1 className="text-3xl font-medium tracking-tight">{data.product.name}</h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{data.product.description}</p>
          <div className="flex flex-wrap gap-2">
            {data.product.features.map((feature) => (
              <span key={feature} className="border border-border px-2 py-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {feature}
              </span>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Choose license</CardTitle>
            <CardDescription>Pick a duration, review availability, and add the quantity you want to the cart.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.variants.map((variant) => {
              const active = variant.id === selectedVariant.id;
              return (
                <SelectableCard key={variant.id} active={active} disabled={!variant.isPurchasable} onClick={() => selectVariant(variant.id)}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium uppercase tracking-[0.14em]">{variant.name}</div>
                      <div className="text-xs text-muted-foreground">{variant.durationDays ? `${variant.durationDays} days access` : "Timed license"}</div>
                    </div>
                    <div className="text-right text-sm font-medium">
                      <div>{formatMoney(variant.priceMinor, variant.currency)}</div>
                      {variant.compareAtPriceMinor ? (
                        <div className="text-xs text-muted-foreground line-through">{formatMoney(variant.compareAtPriceMinor, variant.currency)}</div>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {variant.stockMode === "unlimited"
                      ? "Always available"
                      : !variant.isPurchasable
                        ? "Sold out"
                        : variant.isLowStock
                          ? `Only ${variant.availableKeys} left`
                          : `${variant.availableKeys} keys available`}
                  </div>
                </SelectableCard>
              );
            })}

            <div className="flex items-center justify-between border border-border px-3 py-2">
              <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Quantity</span>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" disabled={!canPurchase || clampedQuantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                  −
                </Button>
                <span className="min-w-8 text-center text-sm">{clampedQuantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canPurchase || clampedQuantity >= maxQuantity}
                  onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between border border-border px-3 py-2 text-sm">
              <span>Total</span>
              <span className="font-medium">{formatMoney(orderTotal, selectedVariant.currency)}</span>
            </div>

            {!canPurchase ? (
              <Alert>
                <AlertDescription>This variant is currently unavailable. Pick another option or check back after more keys are added.</AlertDescription>
              </Alert>
            ) : null}

            {message ? (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              disabled={!canPurchase}
              onClick={() => {
                if (!canPurchase) return;
                addCartItem({
                  productId: data.product.id,
                  productSlug: data.product.slug,
                  productName: data.product.name,
                  variantId: selectedVariant.id,
                  variantName: selectedVariant.name,
                  variantSlug: selectedVariant.slug,
                  durationDays: selectedVariant.durationDays,
                  unitPriceMinor: selectedVariant.priceMinor,
                  currency: selectedVariant.currency,
                  quantity: clampedQuantity,
                });
                setMessage(`${data.product.name} · ${selectedVariant.name} × ${clampedQuantity} added to cart.`);
              }}
            >
              {canPurchase ? "Add to cart" : "Unavailable"}
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/cart">Review cart</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      {data.relatedProducts.length ? (
        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Related products</p>
          <div className="grid gap-4 md:grid-cols-3">
            {data.relatedProducts.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="text-base uppercase tracking-[0.12em]">{product.name}</CardTitle>
                  <CardDescription>{product.shortDescription || product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild>
                    <Link to="/products/$slug" params={{ slug: product.slug }}>Open product</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
