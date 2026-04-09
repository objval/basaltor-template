# Stitch AI Prompts — Basaltor Storefront Dashboard

Generated 2026-04-09. Use these prompts in Google Stitch to generate the dashboard screens.
Reference the DESIGN.md file (or paste its contents into Stitch's design system) before generating.

---

## Prompt 1 — Account Dashboard (primary screen)

**Device:** Web

**Idea**
A user account dashboard for a digital-license storefront. The dashboard is the main authenticated landing page after sign-in.

**Theme**
Sharp, monospaced, zero-radius design on a pure grayscale palette. JetBrains Mono everywhere. No rounded corners, no shadows, no color beyond grayscale and the destructive red for errors. All containers have 1px borders. Depth comes from spacing and surface contrast, not elevation. Dense information layout. Terminal-inspired precision meets modern commerce.

**Content**
Top: Fixed navigation header with the store logo and name on the left, primary nav links (Store, Orders, Licenses) in the center-left area, and user avatar/menu + cart icon on the right. 1px bottom border separating the header from content.

Left side: Account navigation sidebar with uppercase section label "Account" and vertical links: Overview, Orders, Licenses, Profile, Admin. Active link uses primary (dark) fill.

Main content area (right of sidebar):
- Page heading "Store account overview" with a short subtitle below
- Three summary cards in a horizontal row:
  1. "Orders" — shows count badge like "0 total", description "Track every checkout, fulfillment handoff, and follow-up event in one place"
  2. "Licenses" — shows count badge like "0 delivered", description "Delivered keys tied to this account"
  3. "Role" — shows badge like "admin", description "Auth-managed and enforced before route load"
- Below the cards: a "Recent activity" section showing the 3 most recent orders as compact cards, each with:
  - Order public ID in uppercase monospaced text
  - Timestamp in muted text
  - Status badge (e.g., "fulfilled", "pending_payment")
  - Provider badge (e.g., "stripe")
  - "View order detail" link
- Below that: a "Quick actions" row with two small bordered buttons:
  - "Open admin" (link to admin workspace)
  - "View store" (link to storefront)

Everything is zero radius. Every container has a 1px border. Labels are uppercase with wide letter-spacing. Monospaced font throughout.

---

## Prompt 2 — App Header / Navigation Bar

**Device:** Web

**Idea**
The persistent top navigation header for a digital-license storefront application. Appears on every page.

**Content**
Full-width bar at the top of the page. 1px bottom border.

Left: Logo mark (small bordered square containing a simple geometric icon) + store name in monospaced medium-weight text. The logo+name block is clickable and links to the homepage.

Center-left: Horizontal nav links in uppercase 12px text with wide letter-spacing. Links visible when authenticated: "Store", "Orders", "Licenses". Links visible when not authenticated: just "Store".

Right: Cart button (icon + count badge like "Cart 0"), theme toggle group (light/dark/system), and:
- When signed out: "Sign in" ghost button + "Create account" filled button
- When signed in: User avatar button showing initials like "BA" with a dropdown menu containing "Dashboard", "Profile", "Sign out"

No background color beyond the page background. Height ~4rem. Items vertically centered. Responsive: on mobile, nav links collapse and the header becomes more compact.

---

## Prompt 3 — User Orders List

**Device:** Web

**Idea**
The authenticated user's order history page in the same storefront.

**Content**
Same header and account sidebar as the dashboard.

Main content: heading "Orders" with subtitle "Review payment attempts, fulfillment state, and line-item detail for your account."

If orders exist: vertical list of order cards. Each card has:
- Left: order public ID in uppercase monospaced text
- Right side of header row: two badges — "fulfilled" / "pending_payment" (status), "stripe" / "paddle" (provider)
- Below header: timestamp in muted text
- Order items as bordered rows showing product name, variant name × quantity on left, price on right
- Total row at bottom of items
- "View order detail" link at bottom

If no orders: bordered alert card saying "No orders have been created for this account yet."

---

## Prompt 4 — Delivered Licenses Page

**Device:** Web

**Idea**
The page showing all license keys delivered to the authenticated user.

**Content**
Same header and account sidebar.

Main content: heading "Licenses" with subtitle "Every delivered key tied to the current user account appears here with source order context."

If licenses exist: 2-column grid of license cards. Each card has:
- Top: product name in uppercase text, variant name in muted text, order public ID as a small badge
- Center: category label if available
- Below: the license key displayed in a bordered monospaced code block with a "Copy key" button
- Bottom: delivery timestamp in muted text

If no licenses: bordered alert card saying "No licenses have been delivered to this account yet."

---

## Prompt 5 — Sign-in Page

**Device:** Web

**Idea**
The authentication page for the storefront.

**Content**
Centered card on a clean white (or dark in dark mode) background. Inside the card:
- Centered: store logo mark + store name (BrandMark component)
- Below: heading "Sign in"
- Two tabs: "Password" (default selected) and "Email code"
- Password tab: email input, password input, "Sign in" primary button (full width)
- Email code tab: email input with "Send code" button, then after sending shows an OTP input (6 digit slots in a row), with "Verify code" button
- Footer: "Create account" link
- Below card: nothing — the page is minimal

Same zero-radius, bordered, monospaced design. No decorative elements.

---

## Design system constraints (paste into Stitch or reference DESIGN.md)

- Font: JetBrains Mono, monospace only
- Radius: 0px on everything
- Colors: pure grayscale + destructive red only
- Shadows: none
- Borders: 1px solid border on every container
- Labels: uppercase, 12px, letter-spacing 0.22em
- Layout: max-width 72rem, centered
- Information density: high
- Elevation: none — use spacing and borders for hierarchy
