# Feature Components Context

Page-specific components under `src/features/` — not reusable outside their feature area.

## Status Key

- **Implemented**: Component exists as a directory with `index.tsx`
- **Sub-component**: Smaller piece within a larger component (no index.tsx)

---

## Homepage

| Component | Status |
|-----------|--------|
| `hero-section/` | Implemented |
| `features-section/` | Implemented |
| `featured-collections/` | Implemented |
| `featured-products/` | Implemented |
| `featured-videos/` | Implemented |
| `reviews-section/` | Implemented |
| `promo-banner/` | Implemented |
| `brand-showcase/` | Implemented |
| `special-products/` | Implemented |
| `tiktok-videos/` | Implemented (with VideoCard.tsx, VideoModal.tsx) |

---

## Collection Page

| Component | Status |
|-----------|--------|
| `collection-hero/` | Implemented |
| `product-grid/` | Implemented |
| `sort-dropdown/` | Implemented |
| `CollectionSection/` | Implemented |
| `collection-grid/` | Implemented (with CollectionGridItem.tsx) |

---

## Product Page

| Component | Status |
|-----------|--------|
| `product-gallery/` | Implemented |
| `product-info/` | Implemented |
| `related-products/` | Implemented |
| `product-details/` | Implemented |
| `CustomSizeForm.tsx` | Implemented |

---

## Checkout

Components for checkout flow (OrderSummary, ShippingForm, PaymentMethod, PromoCodeInput) are handled by global components and page layouts.

---

## Admin Dashboard

| Component | Status |
|-----------|--------|
| `stats-cards/` | Implemented |
| `recent-orders-table/` | Implemented |
| `order-detail-panel/` | Implemented |

---

## Admin Collections Management

| Component | Status |
|-----------|--------|
| `collection/CollectionForm` | Implemented |

---

## Admin Products Management

| Component | Status |
|-----------|--------|
| `product/ProductForm` (with `ProductForm.tsx` as main) | Implemented |

---

## FAQ

| Component | Status |
|-----------|--------|
| `faq/FAQSection/` | Implemented |

---

## Notes

- All components created as directories with `index.tsx`
- All page-specific logic lives in feature components, not in global components
- Mobile-first design: 375px base, breakpoints sm:640px md:768px lg:1024px xl:1280px
