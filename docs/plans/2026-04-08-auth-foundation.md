# Basaltor Auth Foundation Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Turn the fresh TanStack Start scaffold into a secure, reusable template foundation with Better Auth, Drizzle, PostgreSQL, protected routes, RBAC helpers, self-hosted dev services, and consistent shadcn-driven UI.

**Architecture:** TanStack Start handles SSR/routes/server functions. Better Auth provides the auth engine with email/password and optional OAuth. Drizzle + PostgreSQL store auth and app data. A small RBAC layer sits on top of the user role field and permission map. Theme consistency is enforced through shared semantic tokens in `src/styles.css` and reusable layout/components.

**Tech Stack:** TanStack Start, Better Auth, Drizzle ORM, PostgreSQL, Mailpit, shadcn/ui, Tailwind v4, Vitest, Testing Library.

---

## Phase 1
1. Add DB, env, auth, and mail foundations.
2. Add auth routes, protected routes, and dashboard shell.
3. Add RBAC helpers and admin-only surface.
4. Add tests, run migrations, seed test user, and verify build.
