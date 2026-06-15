# Global Components Context

Reusable cross-page components under `src/global/` — used throughout storefront and admin.

## Implemented Components

| Component | Purpose |
|-----------|---------|
| `header/` | Navigation with menu, cart icon, login (MobileNav, DesktopNav, MobileMenu, HeaderActions sub-components) |
| `footer/` | Links, newsletter signup, social media |
| `product-card/` | Grid card with hover image swap, sticker overlay, price display |
| `cart-sidebar/` | Slide-out cart panel (right side) |
| `sale-popup/` | Bottom-left popup showing recent purchase notifications |
| `variant-selector/` | Size/color picker for product variants |
| `size-chart/` | Modal displaying size chart from reusable templates |
| `collection-card/` | Collection thumbnail with name and image |
| `filter-sidebar/` | Admin-defined filter sets for collection pages |
| `pagination/` | Page navigation for product grids |
| `review-card/` | Single review display with star rating |
| `review-form/` | Form for submitting product reviews |
| `star-rating/` | Reusable star rating display/input component |
| `address-form/` | Shipping address input form |
| `order-summary/` | Checkout order summary panel |
| `badge/` | Sticker/badge overlay component |
| `price-display/` | Original/sale price display with discount percentage |
| `whatsapp-floating-button/` | Floating WhatsApp chat button |

## Mobile-First Note

All global components follow mobile-first design:
- Design for 375px base viewport first
- Breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- Touch targets minimum 44x44px
- Cart sidebar becomes full-screen drawer on mobile
