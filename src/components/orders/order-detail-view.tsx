import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";

type OrderDetailViewProps = {
  data: {
    publicId: string;
    status: string;
    totalMinor: number;
    currency: string;
    customerMode: string;
    customerName: string | null;
    customerEmail: string | null;
    customerContactHandle: string | null;
    customerCountry: string | null;
    customerNote: string | null;
    placedFromIp: string | null;
    placedFromUserAgent: string | null;
    placedFromReferrer: string | null;
    placedFromAcceptLanguage: string | null;
    items: Array<{
      id: string;
      productName: string;
      variantName: string;
      quantity: number;
      unitPriceMinor: number;
      totalPriceMinor: number;
      currency: string;
    }>;
    paymentAttempts: Array<{
      id: string;
      publicId: string;
      provider: string;
      providerLabel: string | null;
      status: string;
    }>;
    allocations: Array<{
      id: string;
      deliveredKey: string;
      deliveredAt: Date;
    }>;
  };
  retryHref?: string | null;
  showCustomerInsights?: boolean;
};

export function OrderDetailView({ data, retryHref, showCustomerInsights = false }: OrderDetailViewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
          <CardDescription>{data.status}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {data.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border border-border px-3 py-2">
              <div>
                <div className="font-medium">{item.productName}</div>
                <div className="text-xs text-muted-foreground">{item.variantName} · {item.quantity} × {formatMoney(item.unitPriceMinor, item.currency)}</div>
              </div>
              <div>{formatMoney(item.totalPriceMinor, item.currency)}</div>
            </div>
          ))}
          <div className="flex items-center justify-between border border-border px-3 py-2 font-medium">
            <span>Total</span>
            <span>{formatMoney(data.totalMinor, data.currency)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment attempts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.paymentAttempts.length ? (
              data.paymentAttempts.map((attempt) => (
                <div key={attempt.id} className="border border-border px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span>{attempt.providerLabel || attempt.provider}</span>
                    <Badge variant="outline">{attempt.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{attempt.publicId}</div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No payment attempts are recorded for this order yet.</p>
            )}
            {retryHref ? (
              <Button variant="outline" className="w-full" asChild>
                <a href={retryHref}>Retry payment</a>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivered licenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.allocations.length ? (
              data.allocations.map((allocation) => (
                <div key={allocation.id} className="space-y-2 border border-border px-3 py-2">
                  <div className="font-mono text-xs break-all">{allocation.deliveredKey}</div>
                  <Button type="button" variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(allocation.deliveredKey)}>
                    Copy key
                  </Button>
                  <div className="text-xs text-muted-foreground">Delivered {new Date(allocation.deliveredAt).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No license allocations were delivered for this order.</p>
            )}
          </CardContent>
        </Card>

        {showCustomerInsights ? (
          <Card>
            <CardHeader>
              <CardTitle>Customer and tracking</CardTitle>
              <CardDescription>{data.customerMode === "guest" ? "Guest checkout" : "Account checkout"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-4 border border-border px-3 py-2">
                <span>Name</span>
                <span className="text-right">{data.customerName}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border border-border px-3 py-2">
                <span>Email</span>
                <span className="text-right">{data.customerEmail}</span>
              </div>
              {data.customerContactHandle ? (
                <div className="flex items-center justify-between gap-4 border border-border px-3 py-2">
                  <span>Handle</span>
                  <span className="text-right">{data.customerContactHandle}</span>
                </div>
              ) : null}
              {data.customerCountry ? (
                <div className="flex items-center justify-between gap-4 border border-border px-3 py-2">
                  <span>Country</span>
                  <span className="text-right">{data.customerCountry}</span>
                </div>
              ) : null}
              {data.customerNote ? (
                <div className="space-y-1 border border-border px-3 py-2">
                  <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Order note</div>
                  <div>{data.customerNote}</div>
                </div>
              ) : null}
              {data.placedFromIp ? (
                <div className="flex items-center justify-between gap-4 border border-border px-3 py-2">
                  <span>IP</span>
                  <span className="text-right font-mono text-xs">{data.placedFromIp}</span>
                </div>
              ) : null}
              {data.placedFromAcceptLanguage ? (
                <div className="flex items-center justify-between gap-4 border border-border px-3 py-2">
                  <span>Language</span>
                  <span className="text-right text-xs">{data.placedFromAcceptLanguage}</span>
                </div>
              ) : null}
              {data.placedFromReferrer ? (
                <div className="space-y-1 border border-border px-3 py-2">
                  <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Referrer</div>
                  <div className="break-all text-xs">{data.placedFromReferrer}</div>
                </div>
              ) : null}
              {data.placedFromUserAgent ? (
                <div className="space-y-1 border border-border px-3 py-2">
                  <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">User agent</div>
                  <div className="break-all text-xs">{data.placedFromUserAgent}</div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
