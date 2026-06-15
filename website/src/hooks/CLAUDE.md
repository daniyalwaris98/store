# Custom React Hooks

Reusable stateful logic. Global state via Context API only (no Tanstack Query).

All hooks are exported from `src/hooks/index.ts`.

## Storefront Hooks

### Data Fetching

- `useProducts(initialParams?)` — fetch paginated product list with `fetchProducts(params)`
- `useProduct(slug?)` — fetch single product by slug with `fetchProduct(slug?)`
- `useCollections()` — fetch all collections with `fetchCollections()`
- `useCollection(slug?)` — fetch single collection with products with `fetchCollection(slug?)`

### Cart & Checkout

- `useCart()` — from `@/context/CartContext`, cart state and operations
- `useCartSync()` — sync cart mutations to API (`addToCartSync`, `updateCartSync`, `removeFromCartSync`, `syncCart`)
- `useCheckout()` — create orders with `createOrder(input)`, returns `order`, `isLoading`, `error`, `validationDetails`, `clearCheckout()`
- `useOrders()` — fetch customer orders with `fetchOrders(params)`

### Store Settings

- `useStoreSettings()` — fetch/update store settings with `fetchSettings()`, `updateSettings(updates)`

## Admin Hooks

All admin hooks follow the pattern: `useAdmin<Entity>()` with `fetchX()`, `createX()`, `updateX()`, `deleteX()` methods.

### Admin Products

- `useAdminProducts(initialParams?)` — product CRUD + `updateInventory(id, inventory)`
- Uses `CreateProductInput` / `UpdateProductInput` from `@/lib/validators/product`

### Admin Orders

- `useAdminOrders(initialParams?)` — order CRUD + `updateStage(id, input)`, `getOrder(id)`

### Admin Collections

- `useAdminCollections()` — collection CRUD

### Admin Customers

- `useAdminCustomers()` — customer list with `fetchCustomers(params)`, `updateCustomer(id, input)`, `deleteCustomer(id)`

### Admin Reviews

- `useAdminReviews()` — review management with `fetchReviews(params)`, `createReview(input)`, `approveReview(id)`, `rejectReview(id)`

### Admin Stickers

- `useAdminStickers()` — sticker management (uses `StickerPlacement` from `@/lib/db/models/Sticker`)

### Admin Size Charts

- `useAdminSizeCharts()` — size chart CRUD (uses `ISizeChart`, `ISizeChartRow` from `@/lib/db/models/SizeChart`)

### Admin Filter Sets

- `useAdminFilterSets()` — filter set CRUD (uses `IFilterSet` from `@/lib/db/models/FilterSet`)

### Admin Shipping

- `useAdminShipping()` — shipping zone CRUD with `fetchZones(params)`, `createZone(input)`, `updateZone(id, input)`, `deleteZone(id)` (uses `IShippingZone` from `@/lib/db/models/ShippingZone`)

## Utility Hooks

- `useDebounce(value, delay?)` — debounce any value (default 300ms delay)
