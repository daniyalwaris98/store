# Shared TypeScript Types

`src/types/` contains shared TypeScript types for frontend use.

## Types Files

| File | Exports |
| --- | --- |
| `src/types/cart.ts` | `CartItem`, `Cart`, `AddToCartInput`, `UpdateCartInput`, `RemoveFromCartInput`, `DirectBuyInput` |
| `src/types/collection.ts` | `Collection`, `CollectionProduct`, `CollectionWithProducts`, `CollectionQueryParams`, `CollectionListResponse` |
| `src/types/customer.ts` | `Customer`, `CustomerListResponse` |
| `src/types/order.ts` | `OrderItem` (includes `customMeasurements?: Record<string, string>`, `variantOptions?: Record<string, string>`), `StageHistory`, `Address`, `OrderStage`, `PaymentStatus`, `FulfillmentStatus`, `Order`, `OrderQueryParams`, `OrderListResponse`, `CreateOrderInput`, `UpdateOrderStageInput`, `OrderLookupResponse` |
| `src/types/product.ts` | `ProductVariant`, `GalleryItem`, `CurrencyPrice`, `Product`, `ProductListItem`, `ProductQueryParams`, `ProductListResponse` |
| `src/types/review.ts` | `Review`, `ReviewListResponse` |
| `src/types/shipping.ts` | `ShippingMethod`, `ShippingZone`, `CreateShippingZoneInput`, `UpdateShippingZoneInput` |

All types are re-exported from `src/types/index.ts`.

## Types vs Models

| Location | Type | Purpose |
| --- | --- | --- |
| `src/types/` | Plain TypeScript interfaces | Frontend, API responses, component props |
| `src/lib/db/models/` | Mongoose models | Database operations only |

Types are NOT shared between frontend and backend models directly.

## Related

- Mongoose models: `src/lib/db/models/` (backend only)
- Zod validators for these types: `src/lib/validators/`
