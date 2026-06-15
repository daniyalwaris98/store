# Storefront Context

Customer-facing routes under `src/app/(store)/` — public store pages.

## Routes

| Route | Purpose |
|-------|---------|
| `(store)/` | Homepage |
| `(store)/account/` | Customer account page (guest lookup) |
| `(store)/search/` | Search products |
| `(store)/collections/[slug]/` | Collection page with products |
| `(store)/products/[slug]/` | Product detail page |
| `(store)/cart/` | Cart page |
| `(store)/orders/` | Order lookup by order number + email |
| `(store)/orders/[id]/` | Order confirmation (public by order number) |
| `(store)/privacy/` | Privacy policy |
| `(store)/terms/` | Terms of service |
| `(store)/shipping/` | Shipping information |

## Layout

`(store)/layout.tsx` wraps all storefront pages with:
- **Header** — Navigation with menu, cart icon, login
- **Footer** — Links, newsletter, social
- **CartSidebar** — Slide-out cart panel (right side)
- **SalePopup** — Bottom-left popup showing recent purchases (currently disabled/commented out)

## Page Features

### Homepage
- HeroSection (large banner with tagline)
- FeaturesSection — Icons for shipping, payment, quality, returns
- Newsletter section with email signup

### Collection Page (`/collections/[slug]`)
- CollectionHero — Banner with collection image/name
- FilterSidebar — Admin-defined filter sets (colors, sizes, price range)
- SortDropdown — Price low/high, newest, popular, rating
- ProductGrid — Paginated product list

### Product Page (`/products/[slug]`)
- ProductGallery — Main image + thumbnails, video support
- ProductInfo — Name, price, variants, add to cart
- VariantSelector — Dropdowns for size/color
- StickerOverlay — Renders sticker from stickers collection
- SizeChartButton — Opens size chart modal (from shared size_charts collection)
- RelatedProducts — Products from same collection

### Cart Page
- Full cart view with items, quantities, subtotal
- Proceed to checkout button

### Orders Page
- Order lookup form (order number + email)
- Order display with items, summary, shipping/payment info
- Stage timeline display

## Mobile-First Critical

All components designed mobile-first (375px base):
- Responsive breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- Touch targets minimum 44x44px
- Cart sidebar becomes full-screen drawer on mobile

## Price System

- `salePrice` — active sale price (global)
- `countryPrices` — country-specific prices override `salePrice` if customer country matches
- `originalPrice` — regular price fallback
- Discount percentage calculated: `Math.round((1 - salePrice / originalPrice) * 100)`

## Sale Popup System

- Triggers 10-40 seconds after page load (minimum 10s)
- Shows: "[City] customer bought [Product Name] [time ago]"
- Dismisses after 5 seconds
- Queries delivered orders from last 24 hours
- Does not show during checkout
- **Currently disabled** — component is commented out in layout.tsx
