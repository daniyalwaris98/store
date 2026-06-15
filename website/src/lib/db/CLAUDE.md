# MongoDB Database

## Models

Models in `src/lib/db/models/` — exported as singletons to avoid duplicates on hot-reload.

| Collection | Model | Purpose |
|------------|-------|---------|
| `admins` | `Admin` | Admin users (email + password auth) |
| `customers` | `Customer` | Customer profiles (guest + registered) |
| `products` | `Product` | Product catalog with variants, gallery, pricing |
| `collections` | `Collection` | Category/collection hierarchy |
| `orders` | `Order` | Customer orders (stores items at purchase time) |
| `shipping_zones` | `ShippingZone` | Country-based shipping rules |
| `reviews` | `Review` | Product reviews |
| `filter_sets` | `FilterSet` | Reusable filter configurations |
| `stickers` | `Sticker` | Badge/overlay images |
| `size_charts` | `SizeChart` | Size measurement tables |
| `recent_purchases` | `RecentPurchase` | TTL-based (24hr expiry) social proof tracking |
| `assets` | `Asset` | Uploaded file tracking (publicId, url, type, folder) |
| `store_settings` | `StoreSettings` | Store currency and settings |
| `variant_templates` | `VariantTemplate` | Reusable variant option configurations |

## Helper Functions

| Model | Function | Purpose |
|-------|----------|---------|
| `Product` | `getProductsBySlugs(slugs)` | Fetch multiple products by slugs in a single query |
| `StoreSettings` | `getStoreSettings()` | Singleton helper to get/cached store settings |

## Connection (`mongodb.ts`)

Features:
- **Retry logic**: Exponential backoff on connection failures
- **Graceful shutdown**: Handles `SIGTERM` and `SIGINT` signals for clean server shutdown

## Best Practices

- Use `.select()` to get only needed fields
- Use `.lean()` for read-only queries
- Index fields used in queries (unique, ref, sorted, filtered)
- Orders snapshot denormalized data — don't rely on live product data
- Singleton models prevent hot-reload duplicates