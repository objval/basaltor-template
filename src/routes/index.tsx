import { Link, createFileRoute } from "@tanstack/react-router";

import { brandConfig } from "@/config/brand";
import { ProductCard } from "@/components/storefront/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PERMISSIONS, hasPermission } from "@/lib/rbac";
import { getSession } from "@/lib/session";
import { getStorefront } from "@/modules/catalog/catalog.functions";
import { getEnabledPaymentProviderNames } from "@/modules/payments/core/presentation";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [storefront, session] = await Promise.all([getStorefront(), getSession()]);
    return {
      ...storefront,
      session,
    };
  },
  component: HomePage,
});

function HomePage() {
  const { categories, products, session } = Route.useLoaderData();
  const providerNames = getEnabledPaymentProviderNames();
  const canManage = session ? hasPermission(session.user.role, PERMISSIONS.usersManage) : false;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:px-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4 rounded-none bg-card p-8 ring-1 ring-foreground/10">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{brandConfig.eyebrow}</p>
          <div className="flex flex-wrap items-center gap-2">
            {providerNames.map((providerName) => (
              <Badge key={providerName} variant="outline">
                {providerName}
              </Badge>
            ))}
            <Badge variant="outline">Bulk-ready cart</Badge>
            <Badge variant="outline">License fulfillment</Badge>
          </div>
          <h1 className="max-w-3xl text-4xl font-medium tracking-tight">{brandConfig.headline}</h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{brandConfig.subheadline}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link to="/cart">Open cart</Link>
            </Button>
            {canManage ? (
              <Button variant="outline" asChild>
                <Link to="/admin">Admin workspace</Link>
              </Button>
            ) : session ? (
              <Button variant="outline" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link to="/sign-in" search={{ redirect: "/dashboard" }}>Sign in</Link>
              </Button>
            )}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>
              Browse products, choose a license duration, check out, and your keys are delivered instantly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Pick a product and variant, then check out as a guest or with your account.</p>
            <p>After payment, license keys are allocated and delivered to your account or email.</p>
            <p>Review your order history, delivery status, and license keys from the dashboard.</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge key={category.id} variant="outline">
              {category.name}
            </Badge>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
