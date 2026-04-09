# Basaltor

Cloneable digital-license storefront template built on TanStack Start.

## Included now
- Better Auth with email/password auth
- Drizzle ORM + PostgreSQL
- Mailpit for self-hosted local auth email flows
- Protected account routes and admin workspace
- Cart state with TanStack Store
- Catalog schema split into categories, products, variants, license pools, keys, orders, payment attempts, and allocations
- Example Stripe and Paddle provider plugins for local checkout verification
- User order history and delivered license views
- Admin CRUD for categories, products, variants, prices, slugs, and bulk key uploads
- Sharp shadcn/ui token system (OKLCH, radius `0`, JetBrains Mono)

## Quick start
```bash
cd ~/projects/basaltor
cp .env.example .env
bun install
bun run db:up
bun run db:generate
bun run db:migrate
bun run seed:dev
bun run dev:site
```

## Local services
- App: `http://127.0.0.1:3010`
- App over LAN: `http://192.168.1.13:3010`
- Mailpit inbox: `http://127.0.0.1:8025`
- Mailpit over LAN: `http://192.168.1.13:8025`
- PostgreSQL: `postgres://basaltor:***@127.0.0.1:5432/basaltor`

## Test credentials
Run `bun run seed:dev` and use the printed admin credentials.

Current defaults come from `src/config/template.ts`:
- Email: `admin@digital-market-template.local`
- Password: `ChangeMe!2345`
- Role: `admin`

## Verification commands
```bash
bun run lint
bun run typecheck
bun run test
bun run smoke:store
bun run build
```

## White-label / clone workflow
Edit these first when cloning the template:
- `src/config/site.ts` — app name, legal name, slug, support email, locale, currency
- `src/config/brand.ts` — logo paths, theme color, hero copy, manifest/favicons
- `src/config/template.ts` — local admin seed credentials and smoke-test customer defaults
- `src/styles.css` — global OKLCH theme tokens (`:root` + `.dark`)
- `.env` — app URL, database URL, SMTP overrides, OAuth credentials

Then sync public branding assets:
```bash
bun run brand:sync
```

Brand asset defaults:
- public logo: `/logo.svg`
- favicon: `/favicon.ico`
- manifest: `/manifest.json`

## Commands
```bash
bun run dev          # Start the app on port 3000
bun run dev:site     # Start the app on dedicated port 3010 for LAN/site testing
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
bun run smoke:store  # End-to-end backend smoke for checkout + fulfillment
```

## Main routes
- `/` — storefront with demo products
- `/products/$slug` — product detail and variant selection
- `/cart` — TanStack Store cart
- `/checkout` — provider selection
- `/checkout/mock/$attemptPublicId` — local mock payment confirmation/failure page
- `/dashboard` — account summary
- `/orders` — current user order history
- `/orders/$publicId` — order detail and delivered keys
- `/licenses` — delivered licenses tied to the current user
- `/admin` — category/product/variant/key management

## Structure
```text
src/
  components/
    admin/
    auth/
    layout/
    profile/
    storefront/
    ui/
  config/
    site.ts
    brand.ts
    metadata.ts
    commerce.ts
    payments.ts
  lib/
    auth.ts
    auth-client.ts
    auth-guards.ts
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
    /
    /products/$slug
    /cart
    /checkout
    /checkout/mock/$attemptPublicId
    /dashboard
    /orders
    /orders/$publicId
    /licenses
    /admin
```

## Project AI skills
Project-local Skills CLI setup is installed in `.agents/skills/`.

Installed skills:
- `shadcn` — shadcn/ui project-aware component workflows
- `find-skills` — discover additional skills from the ecosystem
- `better-auth-best-practices` — Better Auth implementation guidance
- `tanstack-start-best-practices` — TanStack Start patterns and guardrails
- `web-design-guidelines` — high-level UI/UX guidance

Useful commands:
```bash
npx skills ls --json
npx shadcn info --json
npx skills find <query>
```

## Notes
- Orders are provider-neutral.
- Provider-specific fields live in `payment_attempts`, not `orders`.
- Fulfillment is tied to `order_items` through `license_allocations`.
- Mock providers are development-only; swap the provider modules later for real Stripe/Paddle implementations.
