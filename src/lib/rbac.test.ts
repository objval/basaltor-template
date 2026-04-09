import { describe, expect, it } from "vitest";

import { PERMISSIONS, getNavigationForRole, hasPermission, normalizeRole } from "@/lib/rbac";

describe("rbac", () => {
  it("grants admin-only permission to admins and owners only", () => {
    expect(hasPermission("owner", PERMISSIONS.usersManage)).toBe(true);
    expect(hasPermission("admin", PERMISSIONS.usersManage)).toBe(true);
    expect(hasPermission("member", PERMISSIONS.usersManage)).toBe(false);
  });

  it("normalizes unknown roles to member", () => {
    expect(normalizeRole(undefined)).toBe("member");
    expect(normalizeRole("unknown-role")).toBe("member");
  });

  it("filters navigation by permission", () => {
    const adminLinks = getNavigationForRole("admin").map((item) => item.href);
    const memberLinks = getNavigationForRole("member").map((item) => item.href);

    expect(adminLinks).toContain("/admin");
    expect(memberLinks).not.toContain("/admin");
    expect(memberLinks).toEqual(["/dashboard", "/orders", "/licenses", "/profile"]);
  });
});
