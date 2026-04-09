# Basaltor Digital License Template Architecture Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Turn Basaltor into a cloneable digital-license storefront template with clean branding/config swaps, provider-pluggable payments, durable cart state, and maintainable schema boundaries.

**Architecture:** Keep auth, environment, audit, and app shell in the Basaltor core. Add domain modules for catalog, cart, checkout, payments, orders, fulfillment, and content. Keep orders provider-neutral, isolate Stripe/Paddle logic behind a payment plugin registry, and separate order lines from license fulfillment.

**Tech Stack:** TanStack Start, Better Auth, Drizzle ORM, PostgreSQL, TanStack Store, shadcn/ui, Zod, Vitest, Playwright.

---

## Phase 1 — Core template direction
1. Keep clone-specific branding and metadata in `src/config/*`.
2. Keep provider-specific logic in `src/modules/payments/providers/*` only.
3. Keep schema split by domain in `src/lib/db/schema/*`.
4. Keep UI primitives in `src/components/ui/*` and business UI inside `src/modules/*/components/*`.

## Phase 2 — Schema target

### New schema files
- `src/lib/db/schema/catalog.ts`
- `src/lib/db/schema/commerce.ts`
- `src/lib/db/schema/payments.ts`
- `src/lib/db/schema/fulfillment.ts`
- `src/lib/db/schema/content.ts`
- Modify: `src/lib/db/schema/index.ts`

### Table plan
- `products`
- `product_variants`
- `license_pools`
- `license_keys`
- `orders`
- `order_items`
- `payment_attempts`
- `payment_webhook_events`
- `license_allocations`
- `site_settings`
- `legal_documents`

### Core rules
- `orders` must stay provider-neutral.
- Provider IDs (`stripe`, `paddle`) live in `payment_attempts`, never in `orders`.
- Delivered licenses must be tied to `order_items`, not top-level `orders`.
- Status fields must use strict enums, not freeform strings.
- Branding/site metadata must not be hardcoded in route files.

## Phase 3 — Config surface for easy cloning

### New config files
- `src/config/site.ts`
- `src/config/brand.ts`
- `src/config/metadata.ts`
- `src/config/navigation.ts`
- `src/config/commerce.ts`
- `src/config/payments.ts`

### Clone workflow target
A new clone should mostly require edits only to:
- `src/config/*`
- `.env`
- `public/brand/*`
- seed/catalog content

## Phase 4 — Module layout

### New module roots
- `src/modules/catalog/`
- `src/modules/cart/`
- `src/modules/checkout/`
- `src/modules/payments/`
- `src/modules/orders/`
- `src/modules/licenses/`
- `src/modules/content/`
- `src/modules/admin/`

### Important file targets
- `src/modules/cart/cart.store.ts`
- `src/modules/cart/cart.actions.ts`
- `src/modules/cart/cart.selectors.ts`
- `src/modules/payments/core/contracts.ts`
- `src/modules/payments/core/registry.ts`
- `src/modules/payments/providers/stripe/stripe.server.ts`
- `src/modules/payments/providers/paddle/paddle.server.ts`
- `src/modules/checkout/server/checkout.service.ts`
- `src/modules/licenses/server/reservation.service.ts`
- `src/modules/licenses/server/fulfillment.service.ts`

## Phase 5 — Cart architecture
- Use TanStack Store for cart state.
- Persist per-site key, e.g. `digital-store:<site-slug>:cart:v1`.
- Derive totals from selectors, not duplicated mutable state.
- Support quantity > 1 for the same variant.
- Validate cart server-side before checkout.

## Phase 6 — Payment plugin system

### Provider contract
Each provider must implement:
- `createCheckoutSession()`
- `verifyWebhook()`
- `parseWebhook()`
- `getPublicConfig()`

### First providers
- Stripe
- Paddle

### Provider selection
- One active provider per clone by config.
- Registry still supports multiple providers for future reuse.

## Phase 7 — Fulfillment model
- Reserve inventory before checkout finalization where needed.
- Allocate keys per `order_item` after successful payment.
- Support multiple licenses of the same variant in a single order.
- Keep fulfillment history separate from raw key inventory.

## Phase 8 — Testing plan
- Unit tests for schema/domain helpers.
- Integration tests for checkout + provider normalization.
- Playwright E2E for:
  - add to cart
  - multi-quantity checkout
  - successful payment webhook path
  - license delivery visibility
  - admin order/license management

## Migration note from Whysp
Preserve:
- products + variants split
- inventory key table
- webhook audit trail
- guest checkout support

Do not preserve:
- provider-specific columns on orders
- single-license assumptions on orders
- Whysp-specific product fields in the core schema
- freeform status strings
