import { redirect } from "@tanstack/react-router";

import { PERMISSIONS, hasPermission } from "@/lib/rbac";
import { toRelativeAppPath } from "@/lib/redirects";
import { getSession } from "@/lib/session";

type BeforeLoadLocation = {
  href?: string;
  pathname?: string;
  search?: unknown;
  hash?: string;
};

function getRedirectTarget(location?: BeforeLoadLocation) {
  if (!location) {
    return "/dashboard";
  }

  return toRelativeAppPath(
    location.href ?? `${location.pathname ?? ""}${location.search ?? ""}${location.hash ?? ""}`,
    "/dashboard",
  );
}

export async function requireAuthenticatedRoute(location?: BeforeLoadLocation) {
  const session = await getSession();

  if (!session) {
    throw redirect({
      to: "/sign-in",
      search: { redirect: getRedirectTarget(location) },
    });
  }

  return { session };
}

export async function requireAdminRoute(location?: BeforeLoadLocation) {
  const { session } = await requireAuthenticatedRoute(location);

  if (!hasPermission(session.user.role, PERMISSIONS.usersManage)) {
    throw redirect({ to: "/dashboard" });
  }

  return { session };
}
