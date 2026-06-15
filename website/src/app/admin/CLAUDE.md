# Admin Panel Context

Routes under `src/app/admin/` — authenticated area for store management.

## Routes

All routes nested under `(dashboard)/` group with shared layout:

| Route | Purpose |
|-------|---------|
| `admin/dashboard/` | Stats overview (orders, revenue, customers) |
| `admin/orders/` | Order list + stage management |
| `admin/orders/[id]/` | Order detail view |
| `admin/products/` | Product list with CRUD |
| `admin/products/new/` | Create new product |
| `admin/products/[id]/` | Edit product |
| `admin/collections/` | Collection list |
| `admin/collections/new/` | Create new collection |
| `admin/collections/[id]/` | Edit collection |
| `admin/customers/` | Customer list |
| `admin/customers/[id]/` | Customer detail |
| `admin/shipping/` | Shipping zones management |
| `admin/reviews/` | Review management (approve/reject) |
| `admin/stickers/` | Sticker/badge manager (reusable overlays) |
| `admin/size-charts/` | Size chart manager (reusable templates) |
| `admin/filter-sets/` | Filter sets manager |
| `admin/settings/` | Store settings |

## Layout

`(dashboard)/layout.tsx` provides:
- **Desktop sidebar** — 64px wide with icon + label navigation
- **Mobile header** — Sheet-based slide-out menu
- **ToastContainer** — Global toast notifications
- Navigation links to all admin sections

## Auth

All admin routes protected by **Email + Password auth** — no OTP.
- Session-based: httpOnly cookie, Redis-backed storage, 24h expiry
- Credentials validated against `ADMIN_EMAILS` (array) and `ADMIN_PASSWORD` env var
- Uses `loginSchema` from `src/lib/validators/auth` for validation
- See `src/lib/auth/session.ts` for session management

## Admin Features

### Dashboard
- **StatsCards** — Orders, revenue, customers overview
- **RecentOrdersTable** — Latest orders with quick actions

### Orders
- **OrderTable** — Paginated order list with filters (status, stage, date range, search)
- **OrderDetailPanel** — Full order view with stage management (unpaid → processing → shipped → delivered)

### Products
- Product CRUD with gallery (images + videos), variants (Shopify-style), inventory tracking
- Assign stickers and size charts to products
- Markdown support for descriptions
- Variant templates for reusable option sets

### Collections
- Collection CRUD with parent hierarchy (tree structure)
- Assign filter sets to collections

### Stickers Manager
- CRUD for reusable sticker/badge overlays
- Fields: name, imageUrl, placement (9 positions), isActive
- Placement system: top-left/right/center, center-left/center/right, bottom-left/right/center

### Size Charts Manager
- CRUD for reusable size chart templates
- Dynamic columns (measurements) and rows (sizes)
- Optional explanation images
- First row values become suggestions for other rows

### Filter Sets
- CRUD for reusable filter sets
- Types: select, multiselect, range
- Assign to collections for filtering products

### Shipping
- Shipping zones with country-based rules
- Weight-based rate calculation
- Free shipping threshold support

## Key Files

- `src/app/admin/(dashboard)/layout.tsx` — Admin layout with sidebar/mobile nav
- `src/lib/auth/session.ts` — Session management (login, logout, getSession)
- `src/lib/validators/` — Zod schemas for admin forms
