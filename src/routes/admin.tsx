import { createFileRoute, redirect } from "@tanstack/react-router";

import { CatalogAdmin } from "@/components/admin/catalog-admin";
import { RecentOrdersPanel } from "@/components/admin/recent-orders-panel";
import { AppShell } from "@/components/layout/app-shell";
import { PERMISSIONS, hasPermission } from "@/lib/rbac";
import { getSession } from "@/lib/session";
import { getAdminData } from "@/modules/admin/admin.functions";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/sign-in" });
    }

    if (!hasPermission(session.user.role, PERMISSIONS.usersManage)) {
      throw redirect({ to: "/dashboard" });
    }

    return { session };
  },
  loader: () => getAdminData(),
  component: AdminPage,
});

function AdminPage() {
  const { session } = Route.useRouteContext();
  const data = Route.useLoaderData();

  return (
    <AppShell
      role={session.user.role}
      sectionLabel="Admin"
      title="Admin workspace"
      description="Manage categories, products, variants, priceMinor values, and inventory keys from the reusable template control plane."
    >
      <div className="space-y-6">
        <CatalogAdmin categories={data.categories} products={data.products} />
        <RecentOrdersPanel orders={data.recentOrders} />
      </div>
    </AppShell>
  );
}
