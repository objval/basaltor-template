import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";

export function ProductCard({
  product,
}: {
  product: {
    slug: string;
    name: string;
    shortDescription: string | null;
    description: string;
    badge: string | null;
    category: { name: string } | null;
    variants: Array<{
      id: string;
      name: string;
      durationDays: number | null;
      priceMinor: number;
      currency: string;
      availableKeys: number;
      isPurchasable: boolean;
      isLowStock: boolean;
    }>;
    cheapestPriceMinor: number | null;
    hasPurchasableVariants: boolean;
  };
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {product.category ? <Badge variant="outline">{product.category.name}</Badge> : null}
          {product.badge ? <Badge variant="outline">{product.badge}</Badge> : null}
        </div>
        <CardTitle className="text-lg uppercase tracking-[0.12em]">{product.name}</CardTitle>
        <CardDescription className="text-sm leading-6 text-muted-foreground">
          {product.shortDescription || product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-2">
          {product.variants.map((variant) => (
            <span key={variant.id} className="border border-border px-2 py-1 uppercase tracking-[0.14em]">
              {variant.name}
              {!variant.isPurchasable ? " · Sold out" : variant.isLowStock ? ` · ${variant.availableKeys} left` : ""}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between border border-border p-3 text-sm">
          <span>{product.hasPurchasableVariants ? "From" : "Status"}</span>
          <span className="font-medium text-foreground">
            {product.cheapestPriceMinor !== null
              ? formatMoney(product.cheapestPriceMinor, product.variants[0]?.currency ?? "USD")
              : "Sold out"}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild variant={product.hasPurchasableVariants ? "default" : "outline"}>
          <Link to="/products/$slug" params={{ slug: product.slug }}>
            {product.hasPurchasableVariants ? "Configure license" : "View availability"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
