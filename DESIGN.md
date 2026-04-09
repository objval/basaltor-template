# Design System

## Overview

A sharp, monospaced, zero-radius digital storefront dashboard.

High contrast, minimal noise, dense information layout. The entire design system lives on a grayscale palette with zero corner radius and JetBrains Mono as the single typeface. Every element is bordered, not elevated. No shadows. No rounded corners. No decorative color.

The feeling is terminal-esque precision meets modern commerce — like a well-designed developer tool for selling things.

## Colors

- **Primary** (#1a1a1a, oklch 0.205 0 0): CTA buttons, active states, most important interactive elements
- **Foreground** (#242424, oklch 0.145 0 0): Body text, headings
- **Secondary** (#f5f5f5, oklch 0.97 0 0): Secondary surfaces, badges, hover tints
- **Muted** (#f5f5f5, oklch 0.97 0 0): Muted backgrounds, disabled states
- **Muted foreground** (#999, oklch 0.556 0 0): Secondary text, placeholders, captions
- **Border** (#eaeaea, oklch 0.922 0 0): All borders, dividers, input outlines
- **Background** (#ffffff, oklch 1 0 0): Page background
- **Card** (#ffffff, oklch 1 0 0): Card background (same as page — contrast comes from borders)
- **Destructive** (oklch 0.577 0.245 27.325): Error states, destructive actions
- **Accent** (#f5f5f5, oklch 0.97 0 0): Hover highlights, subtle emphasis

Dark mode inverts the scheme: backgrounds become near-black, foreground becomes near-white, borders become semi-transparent white.

## Typography

- **Font family**: JetBrains Mono Variable, monospace
- **Headlines**: Regular weight, tight tracking, 28–36px
- **Body**: Regular weight, 14–16px
- **Labels**: Regular weight, 12px, uppercase with wide letter-spacing (0.22–0.3em)
- **Numbers/counts**: Same font — monospace alignment is a feature, not a bug

The monospace constraint is strict. Do not introduce sans-serif or serif fonts. If contrast is needed, use font size and weight, not font family.

## Elevation

None. This design uses no box shadows, no drop shadows, no elevation tokens.

Depth and hierarchy come from:
- Border contrast (1px solid border token on every container)
- Surface color variation (background vs card vs muted vs secondary)
- Spacing (tight grids for data, generous padding for hero content)
- Typography scale (labels vs body vs headings)

## Components

- **Buttons**: Zero radius (`border-radius: 0`). Primary uses dark fill with light text. Secondary/outline uses bordered surface. Ghost uses no border. Full width on mobile, auto width on desktop.
- **Cards**: 1px border, zero radius, no shadow. Title in uppercase wide-tracking label style. Content below in body style. Footer can contain actions.
- **Badges**: Bordered outline variant. Zero radius. Uppercase label text.
- **Inputs**: 1px border, zero radius. Focus ring uses `--ring` token. No background fill — inputs sit on the page background.
- **Navigation (header)**: Fixed top bar. 1px bottom border. Logo on left (monospaced mark + name). Primary nav links centered-left. Auth + cart actions on right. Mobile collapses to stacked layout.
- **Navigation (sidebar/account)**: Left-aligned vertical links with uppercase labels. Active state uses primary color fill.
- **Tables/lists**: Border-separated rows. Monospaced data alignment. Uppercase section headers.
- **Alerts**: 1px bordered containers. Destructive uses destructive token. Info uses muted.

## Layout

- **Max width**: 72rem (max-w-6xl)
- **Horizontal padding**: 1rem (mobile) / 1.5rem (desktop)
- **Vertical section spacing**: 1.5–2rem gaps
- **Grid**: CSS grid with explicit minmax columns. Example: `grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]` for two-column storefront layouts. Three-column dashboard uses `grid-cols-3`.
- **Page padding**: 2.5rem vertical, responsive horizontal

## Do's and Don'ts

- Do use monochrome palette only — no accent colors beyond the tokens
- Do use `0` border radius on all components — this is a defining trait
- Do keep labels uppercase with wide tracking — this is the primary hierarchy signal
- Do use borders (not shadows) for every container — cards, inputs, buttons, alerts
- Don't add shadows, gradients, or blurs to decorative elements
- Don't use more than two font sizes on a single card/section
- Don't introduce color beyond grayscale + destructive red
- Don't round corners — even slightly
- Do align monospaced numbers in dashboards and tables — use the monospace font as a feature
- Do keep information density high — this is a tool, not a brochure
