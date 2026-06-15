# Zod Validators

Zod schemas shared between frontend and backend for validation. All API bodies are validated with Zod.

## Location

All validators are in `src/lib/validators/`.

## Files

| File | Schema | Validates |
|------|--------|-----------|
| `auth.ts` | `loginSchema` | Admin login |
| `cart.ts` | `addToCartSchema`, `updateCartItemSchema`, `removeFromCartSchema`, `directBuySchema` | Cart operations |
| `product.ts` | `createProductSchema`, `updateProductSchema`, `productQuerySchema`, `updateInventorySchema`, `productVariantSchema`, `galleryItemSchema`, `currencyPriceSchema` | Product CRUD + partial schemas |
| `collection.ts` | `createCollectionSchema`, `updateCollectionSchema` | Collection CRUD |
| `order.ts` | `createOrderSchema`, `updateOrderStageSchema`, `orderQuerySchema`, `orderItemSchema`, `addressSchema` | Order creation + partial schemas |
| `customer.ts` | `customerSchema`, `createCustomerSchema`, `updateCustomerSchema`, `customerQuerySchema` | Customer data |
| `shipping.ts` | `createShippingZoneSchema`, `updateShippingZoneSchema`, `calculateShippingSchema` | Shipping rules |
| `review.ts` | `createReviewSchema`, `adminCreateReviewSchema`, `reviewQuerySchema`, `reviewActionSchema` | Review submission |
| `filterSet.ts` | `createFilterSetSchema`, `updateFilterSetSchema` | Filter set CRUD |
| `sticker.ts` | `createStickerSchema`, `updateStickerSchema` | Sticker CRUD |
| `sizeChart.ts` | `createSizeChartSchema`, `updateSizeChartSchema` | Size chart CRUD |

## Usage

```typescript
import { productSchema } from "@/lib/validators/product"
import { z } from "zod"

// In API route
const body = productSchema.parse(req.body)

// In form (frontend)
const form = useForm({
  resolver: zodResolver(productSchema),
  // ...
})
```

## Validation Rules

All schemas include appropriate validation:
- Required string fields have `.min(1)`
- Numeric fields have type coercion with `.transform()` or `.pipe()`
- Email fields use `.email()`
- Enum fields use `.enum()` or `.nativeEnum()`
- Optional fields use `.optional()` or `.nullable()`
- Arrays use `.array().min(1)` for non-empty

## Shared Between Frontend/Backend

These schemas are the **single source of truth** for validation. Frontend forms and backend API routes use the same schema, ensuring consistency.