# Components Overview

Component architecture for the e-commerce platform under `src/components/`.

## Structure

```
components/
├── ui/          # Base shadcn-style components (Radix primitives + Tailwind)
├── global/      # Cross-page reusable components
└── features/    # Page-specific feature components
```

## Design Tokens

All components use design tokens from `src/lib/constants/ui.ts`:
- **Button**: shape variants (default, pill, square, soft), controlled by `BUTTON.defaultShape`
- **Card**: border radius, padding, shadow
- **Input**: border radius, focus states

Design tokens are implemented as CSS variables in `src/styles/customization.css`. Components reference `var()` not hardcoded values.

## UI Components (`ui/`)

Base shadcn-style components — see `ui/CLAUDE.md` for full list.

| Component | Purpose |
|-----------|---------|
| `button/` | Variants (default, destructive, outline, secondary, ghost, link), sizes |
| `card/` | CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `dialog/` | Overlay with frosted glass effect, rounded content |
| `dropdown-menu/` | Rounded items with accent hover |
| `editor/MarkdownEditor` | MDX-based markdown editor |
| `input/` | Hover border strengthening, focus ring |
| `label/` | Subtle transition support |
| `select/` | Rounded trigger + content |
| `separator/` | Horizontal/vertical divider |
| `sheet/` | Slide-out panels with same dialog treatment |
| `skeleton/` | Gradient shimmer effect |
| `table/` | Rounded container, hover rows |
| `tabs/` | Rounded list with active shadow |
| `textarea/` | Hover border + focus ring |
| `toast/` | Rounded variants with transitions |

## Global Components (`global/`)

Cross-page reusable components — see `global/CLAUDE.md` for full list.

| Component | Purpose |
|-----------|---------|
| `header/` | Navigation (MobileNav, DesktopNav, MobileMenu, HeaderActions) |
| `footer/` | Links, newsletter, social media |
| `product-card/` | Grid card with hover image swap, sticker overlay |
| `cart-sidebar/` | Slide-out cart panel (right side) |
| `sale-popup/` | Recent purchase notifications (bottom-left) |
| `variant-selector/` | Size/color picker for product variants |
| `size-chart/` | Modal with size chart templates |
| `filter-sidebar/` | Admin-defined filter sets |
| `pagination/` | Page navigation for product grids |
| `review-card/` | Single review with star rating |
| `review-form/` | Review submission form |
| `star-rating/` | Reusable star rating display/input |
| `address-form/` | Shipping address input |
| `order-summary/` | Checkout order summary panel |
| `badge/` | Sticker overlay component |
| `price-display/` | Original/sale price with discount |
