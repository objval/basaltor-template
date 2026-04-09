# Basaltor Template

Cloneable TanStack Start digital-license storefront template with Better Auth, Drizzle, PostgreSQL, mock payment providers, and a reusable account/admin shell.

## What this repo is
Use this as a starting point for a new storefront-style app where each cloned repo is one store.

Included now:
- Better Auth with email/password and email OTP sign-in
- Drizzle ORM + PostgreSQL
- Mailpit for local email verification flows
- Protected account routes and RBAC-aware admin workspace
- Cart state with TanStack Store
- Provider-neutral order + payment attempt schema
- Demo Stripe/Paddle mock providers for local checkout verification
- Delivered-license and order-history views
- Admin CRUD for categories, products, variants, prices, slugs, and bulk key uploads
- Sharp monochrome shadcn/ui design system with JetBrains Mono and zero radius

Important current caveats:
- payment providers are still mock/example implementations
- guest order access still uses a query-string token model
- there is branded error handling, but not a fully custom not-found system yet

## Start a new app from this template
### Option A — GitHub template flow
```bash
gh repo create your-org/your-new-app \
  --template objval/basaltor-template \
  --private \
  --clone
cd your-new-app
```

### Option B — Plain clone / local copy
```bash
git clone https://github.com/objval/basaltor-template.git your-new-app
cd your-new-app
```

## Fastest local setup
```bash
cp .env.example .env
bun install
bun run db:up
bun run db:generate
bun run db:migrate
bun run seed:dev
bun run dev:site
```

Default local URLs:
- App: `http://127.0.0.1:3010`
- Mailpit: `http://127.0.0.1:8025`
- PostgreSQL: `postgres://basaltor:basaltor@127.0.0.1:5432/basaltor`

If testing from LAN/Tailscale, update `APP_URL` in `.env` before verifying auth flows.

## First login
Run `bun run seed:dev` and use the printed admin credentials.

Current defaults live in `src/config/template.ts`:
- Email: `admin@digital-market-template.local`
- Password: `ChangeMe!2345`
- Role: `admin`

## First files to edit after cloning
Change these first:
- `src/config/site.ts` — app name, legal name, slug, support email, locale, currency
- `src/config/brand.ts` — logo paths, theme color, hero copy, favicon/manifest metadata
- `src/config/template.ts` — local admin seed credentials and smoke-test defaults
- `src/styles.css` — global OKLCH theme tokens (`:root` + `.dark`)
- `.env` — app URL, database URL, SMTP, OAuth credentials

Then sync public branding assets:
```bash
bun run brand:sync
```

Brand asset defaults:
- Logo: `public/logo.svg`
- Favicon: `public/favicon.ico`
- Manifest: `public/manifest.json`

## Verification before making major changes
Run this full sequence after setup and after any major refactor:
```bash
bun run typecheck
bun run lint
bun run test
bun run seed:dev
bun run smoke:store
bun run build
```

What these prove:
- `typecheck` — TS surfaces are consistent
- `lint` — code stays within repo conventions
- `test` — low-level utilities and validation still work
- `seed:dev` — local bootstrap remains healthy and idempotent
- `smoke:store` — checkout + fulfillment backend flow still works end to end
- `build` — production bundle still compiles

## AI / operator handoff
Read `AGENTS.md` after this README. It contains the minimal read order, setup path, verification commands, and repo hygiene rules for future humans or agents.

## Main commands
```bash
bun run dev          # Start app on port 3000
bun run dev:site     # Start app on port 3010 for dedicated site/LAN testing
bun run build        # Production build
bun run test         # Vitest suite
bun run lint         # ESLint
bun run typecheck    # TypeScript
bun run db:up        # Start postgres + mailpit
bun run db:down      # Stop local services
bun run db:generate  # Generate migrations from schema
bun run db:migrate   # Apply migrations
bun run db:studio    # Open Drizzle Studio
bun run seed:dev     # Seed admin + demo catalog + license keys
bun run smoke:store  # Checkout + fulfillment smoke test
bun run brand:sync   # Regenerate manifest from brand config
```

## Main routes
- `/` — storefront with demo products
- `/products/$slug` — product detail and variant selection
- `/cart` — TanStack Store cart
- `/checkout` — provider selection and customer details
- `/checkout/mock/$attemptPublicId` — local mock payment confirmation/failure page
- `/guest/orders/$publicId` — guest-access order detail
- `/dashboard` — account summary
- `/orders` — current user order history
- `/orders/$publicId` — order detail and delivered keys
- `/licenses` — delivered licenses tied to the current user
- `/profile` — account details and password management
- `/admin` — category/product/variant/key management

## Structure
```text
src/
  components/
    admin/
    auth/
    layout/
    orders/
    profile/
    storefront/
    ui/
  config/
    site.ts
    brand.ts
    metadata.ts
    commerce.ts
    payments.ts
    template.ts
  lib/
    auth.ts
    auth-client.ts
    auth-guards.ts
    redirects.ts
    route-auth.ts
    rate-limit.ts
    session.ts
    money.ts
    public-ids.ts
    db/schema/
  modules/
    admin/
    cart/
    catalog/
    checkout/
    orders/
    payments/
  routes/
scripts/
  seed-dev.ts
  smoke-store.ts
```

## Project AI skills
Project-local Skills CLI setup is installed in `.agents/skills/`.

Installed skills:
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

## Related repo docs
- `AGENTS.md` — minimal AI/operator handoff and repo hygiene rules
- `DESIGN.md` — design system handoff for Stitch
- `docs/stitch-prompts.md` — prompt set for auth/dashboard/orders/licenses/navbar generation

## Template philosophy
This repo is strongest when it stays close to four rules:
- config over scattered hardcoding
- provider-neutral data design
- reusable domain modules over page-local business logic
- verification scripts that prove the template still works after cloning
