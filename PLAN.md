# Basaltor Template — Quick Reference

This is a reusable TanStack Start storefront template, not a single hardcoded app.

## Read this first
1. `README.md`
2. `src/config/site.ts`
3. `src/config/brand.ts`
4. `src/config/template.ts`
5. `scripts/seed-dev.ts`
6. `scripts/smoke-store.ts`

## Foundation status
- Better Auth + Drizzle + PostgreSQL wired in
- Mailpit docker service for local verification emails
- Protected account and admin routes
- Provider-neutral commerce schema
- Mock checkout + fulfillment smoke flow
- Automated checks: typecheck, lint, test, build, smoke-store

## Fast setup
```bash
cp .env.example .env
bun install
bun run db:up
bun run db:migrate
bun run seed:dev
bun run dev:site
```

## First clone edits
- `src/config/site.ts`
- `src/config/brand.ts`
- `src/config/template.ts`
- `src/styles.css`
- `.env`

Then run:
```bash
bun run brand:sync
```

## Verification sequence
```bash
bun run typecheck
bun run lint
bun run test
bun run seed:dev
bun run smoke:store
bun run build
```

## Current caveats
- payments are still mock/example integrations
- guest order access still uses a query-string token model
- not-found UX is still basic compared with the rest of the shell

## Project AI skills
Installed in `.agents/skills/`:
- `shadcn`
- `find-skills`
- `better-auth-best-practices`
- `tanstack-start-best-practices`
- `web-design-guidelines`

Useful commands:
```bash
npx skills ls --json
npx shadcn info --json
npx skills find <query>
```

## Related docs
- `README.md`
- `DESIGN.md`
- `docs/stitch-prompts.md`
