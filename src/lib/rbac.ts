export const ROLES = ["owner", "admin", "member"] as const;
export type AppRole = (typeof ROLES)[number];

export const PERMISSIONS = {
  dashboardView: "dashboard:view",
  profileManage: "profile:manage",
  usersManage: "users:manage",
  auditView: "audit:view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<AppRole, Array<Permission>> = {
  owner: [
    PERMISSIONS.dashboardView,
    PERMISSIONS.profileManage,
    PERMISSIONS.usersManage,
    PERMISSIONS.auditView,
  ],
  admin: [
    PERMISSIONS.dashboardView,
    PERMISSIONS.profileManage,
    PERMISSIONS.usersManage,
    PERMISSIONS.auditView,
  ],
  member: [PERMISSIONS.dashboardView, PERMISSIONS.profileManage],
};

export function isAppRole(value: string): value is AppRole {
  return ROLES.includes(value as AppRole);
}

export function normalizeRole(value: string | null | undefined): AppRole {
  if (!value) return "member";
  return isAppRole(value) ? value : "member";
}

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  const normalized = normalizeRole(role);
  return ROLE_PERMISSIONS[normalized].includes(permission);
}

export function roleLabel(role: string | null | undefined): string {
  return normalizeRole(role).replace(/^./, (letter) => letter.toUpperCase());
}

export function getNavigationForRole(role: string | null | undefined) {
  const items = [
    { title: "Overview", href: "/dashboard", permission: PERMISSIONS.dashboardView },
    { title: "Orders", href: "/orders", permission: PERMISSIONS.dashboardView },
    { title: "Licenses", href: "/licenses", permission: PERMISSIONS.dashboardView },
    { title: "Profile", href: "/profile", permission: PERMISSIONS.profileManage },
    { title: "Admin", href: "/admin", permission: PERMISSIONS.usersManage },
  ];

  return items.filter((item) => hasPermission(role, item.permission));
}
