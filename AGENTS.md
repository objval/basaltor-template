# AGENTS.md

This repo is meant to be easy for humans and AI agents to pick up quickly.

## Read order
1. `README.md`
2. `AGENTS.md`
3. `src/config/site.ts`
4. `src/config/brand.ts`
5. `src/config/template.ts`
6. `scripts/seed-dev.ts`
7. `scripts/smoke-store.ts`
8. `src/modules/checkout/checkout.server.ts`
9. `src/modules/orders/orders.server.ts`
10. `DESIGN.md` and `docs/stitch-prompts.md` if doing UI/design work

## What this repo is
A cloneable TanStack Start storefront template.
Each cloned repo is one store.
Do not treat it as multi-tenant SaaS by default.

## High-value rules
- Keep provider-specific data in `payment_attempts`, not `orders`
- Keep clone-specific values in `src/config/*`
- Keep reusable business logic in `src/modules/*`
- Prefer shaping explicit DTOs over returning raw DB rows to clients
- Verify important changes with `bun run smoke:store`, not only browser checks
- Do not assume payments are production-ready yet

## First things to edit in a clone
- `src/config/site.ts`
- `src/config/brand.ts`
- `src/config/template.ts`
- `src/styles.css`
- `.env`

Then run:
```bash
bun run brand:sync
```

## Setup
```bash
cp .env.example .env
bun install
bun run db:up
bun run db:migrate
bun run seed:dev
bun run dev:site
```

## Verification
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

## Keep the repo clean
- Do not add extra planning docs unless they are clearly reusable
- Prefer updating `README.md` or `AGENTS.md` over creating new one-off docs
- Remove stale notes after the workflow is captured in the main docs
