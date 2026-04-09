# Stitch AI Prompts — Basaltor Storefront

Generated 2026-04-09. Use these prompts in order inside Google Stitch.
Paste the DESIGN.md (or its contents) into Stitch before generating.

---

## How to use Stitch with our design system

### Step 1 — Import the design system
1. Open Stitch and create a new project
2. Before generating anything, open the **Design System** panel
3. If Stitch lets you import from a file, paste the full `DESIGN.md` contents
4. If not, use **Generate → Edit Theme** after the first screen to force these tokens:
   - **Roundedness**: 0 (all corners sharp)
   - **Headline font**: JetBrains Mono
   - **Body font**: JetBrains Mono
   - **Primary color**: #1a1a1a (near-black)
   - **Secondary color**: #f5f5f5 (light gray)
   - **Surface color**: #ffffff (white)
   - **On-surface color**: #242424 (near-black)
   - **Border color**: #eaeaea

### Step 2 — Generate screens in order
1. Paste Prompt A below into Stitch and hit generate
2. Inspect what you like and dislike
3. Use **Screen → Edit → Add to Chat** to make one targeted change at a time
4. Once satisfied, generate Prompt B the same way
5. Stitch carries your design tokens between screens automatically

### Step 3 — Iterate with precision
When something is wrong, use this formula:
- **Target**: which component or section
- **Change**: what specifically to modify
- **How**: describe it using UI/UX keywords

Example: "The sign-in card is too wide. Make it max 420px and center it vertically on the page."

Example: "The logo mark in the navbar should be a small bordered square, not a circle. Use zero border-radius."

### Step 4 — Export
When done, export the project. Stitch includes the DESIGN.md alongside the screens. Port the exported HTML/CSS into Basaltor as React components.

---

## Prompt A — Sign-in Page + Public Navbar

**Device:** Web

**Idea**
A sign-in page for a digital-license storefront. This screen also establishes the public-facing navbar that appears on every non-authenticated page (storefront, product pages, cart, checkout, sign-in, sign-up).

**Theme**
Sharp, monospaced, zero-radius design. Pure grayscale palette with no accent colors. JetBrains Mono everywhere — no sans-serif, no serif. Every container has a 1px solid border. Zero border radius on everything — buttons, inputs, cards, badges. No shadows, no gradients, no blur. Dense, precise, terminal-inspired. High contrast black on white (with dark mode support: near-black bg with near-white text).

**Content**

The page has two parts:

**Part 1 — Public Navbar (top of page, will be reused on all public screens)**

Full-width top bar, height about 64px. 1px solid bottom border (#eaeaea). No background color beyond the page background.

Left side: A clickable logo block linking to the homepage. The logo is a small bordered square (11px × 11px, 1px border, sharp corners) containing a simple geometric icon (a diamond or cube shape). Next to it, the store name "Basaltor Storefront" in monospaced medium-weight text at 14px, tight letter-spacing.

Center-left: Horizontal nav links in uppercase 12px monospaced text with wide letter-spacing (0.22em). Just one link visible when not signed in: "Store". When signed in, add "Orders" and "Licenses".

Right side (grouped together, right-aligned):
- A cart button: small cart icon + text "Cart 0" in 12px text, 1px bordered, sharp corners
- A theme toggle: three small buttons in a row (light/dark/system icons), each 1px bordered, sharp
- A "Sign in" ghost button (no fill, just text, uppercase 12px)
- A "Create account" filled button (dark fill #1a1a1a, white text, uppercase 12px, sharp corners)

Mobile: Stack the logo and right-side actions. Hide the center nav.

**Part 2 — Sign-in Card (centered below navbar)**

Below the navbar, a single card centered both horizontally and vertically (using most of the remaining viewport height).

The card:
- Max width: 420px
- Border: 1px solid #eaeaea
- Zero border-radius
- No shadow, no blur, no transparency
- White background (or dark mode equivalent)

Inside the card, top to bottom:
1. Centered logo mark (same bordered square from the navbar) + store name "Basaltor Storefront" in 14px monospaced
2. Heading: "Sign in" in 24px monospaced semibold, centered
3. Two tabs below the heading: "Password" (selected by default) and "Email code". Tabs are uppercase 12px monospaced text. Active tab has a 1px bottom border on the text. Inactive tab is muted gray.
4. Password tab content:
   - Label "Email" in uppercase 12px, wide tracking
   - Email input: full width, 1px border, sharp, 12px padding, monospaced placeholder
   - Label "Password" in uppercase 12px, wide tracking
   - Password input: same style as email
   - "Sign in" button: full width, dark fill (#1a1a1a), white text, uppercase 12px, sharp, 12px vertical padding
5. Below the form: a small centered "Create account" text link in muted gray

The page background is plain white (or dark mode dark). No decorations, no illustrations, no hero images. The card is the only element on the page below the navbar.

---

## Prompt B — Account Dashboard (generate after Prompt A is locked in)

**Device:** Web

**Idea**
The main authenticated landing page. The user just signed in and lands here.

**Theme**
Same design system as Prompt A. Reuse the navbar from Prompt A but add "Orders" and "Licenses" nav links since the user is now signed in.

**Content**

Below the navbar, a two-column layout:
- Left column (about 220px): Account sidebar navigation
- Right column (remaining width): Main content

**Left sidebar:**
- Uppercase label "Account" at top, 12px, wide tracking, muted color
- Below: the user's name + role badge
- Below that: vertical nav links, each uppercase 12px, wide tracking:
  - "Overview" (active — uses dark fill background with white text)
  - "Orders" (inactive — text only, hover darkens)
  - "Licenses" (same as Orders)
  - "Profile" (same)
  - "Admin" (same)
- The sidebar has a 1px right border separating it from content

**Right content area:**
- Heading "Overview" in 28px monospaced semibold
- Subtitle "Your account, orders, and delivered licenses at a glance." in 14px muted
- Three summary cards in a horizontal row, equal width:
  1. Card titled "Orders" — shows a bordered badge "0 total"
  2. Card titled "Licenses" — shows a bordered badge "0 delivered"
  3. Card titled "Role" — shows a bordered badge "admin"
- Each card: 1px border, sharp, white bg, no shadow

---

## Prompt C — Orders Page (generate after Prompt B)

Same navbar and sidebar as Prompt B. Replace the right content with:

- Heading "Orders" + subtitle
- Vertical list of order cards. Each card:
  - Top row: order ID (uppercase monospaced) on left, status badge + provider badge on right
  - Timestamp in muted text
  - Items as bordered rows with product name, variant, quantity, price
  - "View order detail" link at bottom
- Empty state: bordered alert "No orders yet"

---

## Prompt D — Licenses Page (generate after Prompt B)

Same navbar and sidebar. Replace content with:

- Heading "Licenses" + subtitle
- 2-column grid of license cards:
  - Product name (uppercase), variant name (muted), order ID badge
  - License key in a bordered monospaced code block with "Copy key" button
  - Delivery timestamp
- Empty state: bordered alert "No licenses delivered yet"

---

## Prompt E — App Header / Navbar (generate after all screens)

**Device:** Web

This is the isolated navbar component from Prompt A, but now shown on its own for refinement.

If any navbar details need adjustment after seeing it on multiple screens, do it here as a standalone reference. This screen exists only for polish — the navbar was already established in Prompt A.
