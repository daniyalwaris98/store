# API Routes Context

API routes under `src/app/api/` — all access through these, no direct DB from components.

## Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `api/auth/logout` | POST | Clear admin session |
| `api/auth/session` | GET | Check current session |
| `api/auth/login` | POST | Login validation with loginSchema |
| `api/products` | GET | List products (search, filter, paginate) |
| `api/products` | POST | Create product (admin) |
| `api/products/[id]` | GET | Get single product |
| `api/products/[id]` | PUT | Update product (admin) |
| `api/products/[id]` | DELETE | Delete product (admin) |
| `api/products/[id]/inventory` | PATCH | Update inventory (admin) |
| `api/collections` | GET | List collections (tree structure, admin sees all, public sees active only) |
| `api/collections` | POST | Create collection (admin) |
| `api/collections/[id]` | GET | Get single collection by ID or slug (admin only) |
| `api/collections/[id]` | PUT | Update collection (admin) |
| `api/collections/[id]` | DELETE | Delete collection (admin) |
| `api/collections/public/[slug]` | GET | Public collection lookup by slug |
| `api/orders` | GET | List orders (admin, with filters) |
| `api/orders` | POST | Guest checkout (public) |
| `api/orders/[id]` | GET | Get order (admin) |
| `api/orders/[id]` | PATCH | Update order (admin) |
| `api/orders/lookup` | POST | Public order lookup by order number + email |
| `api/cart` | GET | Get current cart |
| `api/cart/add` | POST | Add item to cart |
| `api/cart/update` | PATCH | Update item quantity |
| `api/cart/remove` | DELETE | Remove item |
| `api/cart/direct-buy` | POST | Add item + redirect to checkout |
| `api/customers` | GET | List customers (admin) |
| `api/customers/[id]` | GET | Get customer (admin) |
| `api/customers/[id]` | PUT | Update customer (admin) |
| `api/shipping` | GET | Calculate shipping (country, weight, subtotal) |
| `api/shipping/zones` | GET/POST | List/create shipping zones (admin) |
| `api/shipping/zones/[id]` | PUT/DELETE | Update/delete shipping zone (admin) |
| `api/reviews` | GET | Get reviews (admin: all statuses + search; public: approved only) |
| `api/reviews` | POST | Create review (guest or logged in) |
| `api/reviews/[id]/approve` | PATCH | Approve review (admin) |
| `api/reviews/[id]/reject` | PATCH | Reject review (admin) |
| `api/reviews/featured` | GET | Get featured reviews for homepage |
| `api/uploads` | POST | Upload to Openinary |
| `api/uploads/[publicId]` | DELETE | Delete asset by publicId (admin) |
| `api/filter-sets` | GET/POST | List/create filter sets (admin) |
| `api/filter-sets/[id]` | PUT/DELETE | Update/delete filter set (admin) |
| `api/stickers` | GET/POST | List/create stickers (admin) |
| `api/stickers/[id]` | PUT/DELETE | Update/delete sticker (admin) |
| `api/size-charts` | GET/POST | List/create size charts (admin) |
| `api/size-charts/[id]` | PUT/DELETE | Update/delete size chart (admin) |
| `api/variant-templates` | GET/POST | List/create variant templates (admin) |
| `api/variant-templates/[id]` | PUT/DELETE | Update/delete variant template (admin) |
| `api/recent-purchase` | POST | Internal: called after order success |
| `api/recent-purchase` | GET | Public: get recent purchases for popup |
| `api/store-settings` | GET | Get store settings (public) |
| `api/store-settings` | PUT | Update store settings (admin) |

## Validation

All API bodies validated with **Zod schemas** from `src/lib/validators/`. No raw body access.

## Auth Pattern

Admin routes check session via `src/lib/auth/session.ts` — httpOnly cookie, HMAC-SHA256 signed.

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Uploads | 1000 per min per IP |
| General API | 100 per min |

## Caching Strategy (Next.js native)

| Data | TTL | Invalidation |
|------|-----|--------------|
| Product list | 5 min | revalidateTag("products") |
| Product detail | 10 min | revalidateTag("products") |
| Collections | 15 min | revalidateTag("collections") |

## Order Flow

- Guest checkout: creates customer from email if not exists
- Order stores `name`/`price` at purchase time (not live product data)
- Stages: unpaid → processing → shipped → delivered
- Stage history tracks timestamps and optional notes
- Public order lookup via `/api/orders/lookup` with order number + email

## File Storage

All uploads go to self-hosted **SeaweedFS S3** (NOT Cloudinary). See `src/lib/seaweed.ts` for upload/delete helpers.
