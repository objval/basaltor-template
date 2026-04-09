import { getRequestHeaders } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";

import type { AppSession } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { PERMISSIONS, hasPermission } from "@/lib/rbac";

export async function getOptionalServerSession(): Promise<AppSession | null> {
  const raw = await auth.api.getSession({ headers: getRequestHeaders() });
  return (raw as AppSession | null) ?? null;
}

export async function requireServerSession(): Promise<AppSession> {
  const session = await getOptionalServerSession();
  if (!session) {
    throw redirect({ to: "/sign-in", search: { redirect: "/dashboard" } });
  }

  return session;
}

export async function requireServerAdmin(): Promise<AppSession> {
  const session = await requireServerSession();
  if (!hasPermission(session.user.role, PERMISSIONS.usersManage)) {
    throw redirect({ to: "/dashboard" });
  }

  return session;
}
