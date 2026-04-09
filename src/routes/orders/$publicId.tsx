import { createFileRoute, redirect } from "@tanstack/react-router";

import { OrderDetailView } from "@/components/orders/order-detail-view";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { getMyOrderDetail } from "@/modules/orders/orders.functions";

export const Route = createFileRoute("/orders/$publicId")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/sign-in" });
    }

    return { session };
  },
  loader: ({ params }) => getMyOrderDetail({ data: { publicId: params.publicId } }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const data = Route.useLoaderData();
  const { session } = Route.useRouteContext();

  if (!data) {
    return (
      <AppShell role={session.user.role} title="Order not found" description="The requested order does not exist or is not accessible for the current session.">
        <Card>
          <CardHeader>
            <CardTitle>Order not found</CardTitle>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  const retryHref = data.paymentAttempts.length > 0 && data.status !== "fulfilled" ? `/checkout/mock/${data.paymentAttempts[0].publicId}` : null;

  return (
    <AppShell role={session.user.role} sectionLabel={data.isPrivileged ? "Admin" : "Account"} title={data.publicId} description="Detailed payment and license delivery history for the selected order.">
      <OrderDetailView data={data} retryHref={retryHref} showCustomerInsights={data.isPrivileged} />
    </AppShell>
  );
}
