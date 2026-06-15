## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **UI**: Radix primitives + Tailwind CSS 4, shadcn-style components
- **Database**: MongoDB (Mongoose)
- **Cache**: Next.js native (unstable_cache + revalidateTag) — product caching, SSR caching only
- **State**: Global Context API only (no Tanstack Query)
- **Validation**: Zod (shared schemas frontend/backend)
- **Auth**: Email + Password (no OTP, no JWT sessions for admin)
- **HTTP**: Axios for API calls
- **File Storage**: Self-hosted SeaweedFS S3 (NOT Cloudinary)
- **Icons**: Lucide React

## Commands

```bash
npm run dev    # local development
npm run build  # production build
npm run lint   # lint checks
```

## All Directories

| Path | Purpose |
|------|---------|
| `src/app/(store)/` | Customer-facing routes (collections, products, cart, checkout, orders) |
| `src/app/admin/` | Admin panel routes |
| `src/app/api/` | API routes by domain (auth, products, orders, etc.) |
| `src/components/ui/` | Base Radix UI components (Button, Dialog, Select, etc.) |
| `src/components/global/` | Cross-page components (Header, Footer, ProductCard, CartSidebar) |
| `src/components/features/` | Page-specific feature components (hero, featured-videos, size-chart) |
| `src/components/` | Components index and exports |
| `src/lib/db/` | MongoDB connection + Mongoose models |
| `src/lib/auth/` | Auth helpers (session management) |
| `src/lib/validators/` | Zod schemas (shared between frontend/backend) |
| `src/lib/constants/` | Hardcoded config (brand, UI tokens, admin emails, theme) |
| `src/lib/utils/` | Utility helpers |
| `src/context/` | React Context providers (CartContext, ToastContext, CurrencyContext) |
| `src/hooks/` | Custom React hooks |
| `src/types/` | Shared TypeScript types |
| `src/styles/` | globals.css + customization.css (user-editable design tokens) |

**Shared types**: `src/types/` for frontend/TypeScript types, `src/lib/db/models/` for Mongoose models. Types are NOT shared between frontend and backend models directly — backend models are Mongoose, frontend uses plain TS types.

## Architecture Rules

- **All API access** goes through `src/app/api/` routes — no direct DB access from components
- **Validation**: Use Zod schemas from `src/lib/validators/` for all forms and API bodies
- **State mutations** only in Context providers or API routes — never directly in components
- **Cart state** managed via CartContext + API routes — do not duplicate cart logic
- **Design tokens** in `src/styles/customization.css` (CSS variables) — all components reference `var()` not hardcoded values
- **Brand constants** in `src/lib/constants/brand.ts` — store name, logo, social links
- **UI shape tokens** in `src/lib/constants/ui.ts` — button shape, card radius, input styles (change once, affects all)
- **Admin auth** uses httpOnly cookies with Redis session storage — not JWT
- **Update CLAUDE.md** you have to update these files when made new changes and something is newly added

## Nested Context

For detailed context on specific areas, see these sub-CLAUDE.md files:

### App Routes
- `src/app/(store)/CLAUDE.md` — storefront routes (homepage, collections, products, cart, checkout, orders)
- `src/app/admin/CLAUDE.md` — admin panel routes (dashboard, orders, products, collections, customers, settings)
- `src/app/api/CLAUDE.md` — API routes (auth, products, collections, orders, cart, shipping, reviews, uploads)

### Components
- `src/components/ui/CLAUDE.md` — base Radix UI components (Button, Dialog, Select, etc.)
- `src/components/global/CLAUDE.md` — cross-page components (Header, Footer, ProductCard, CartSidebar)
- `src/components/features/CLAUDE.md` — page-specific components (hero, featured-videos, size-chart)
- `src/components/CLAUDE.md` — component exports and organization

### Library
- `src/lib/CLAUDE.md` — lib folder overview (db, redis, validators, utils, constants, auth)
- `src/lib/db/CLAUDE.md` — MongoDB connection and model best practices
- `src/lib/validators/CLAUDE.md` — Zod schemas for all forms and API bodies
- `src/lib/constants/CLAUDE.md` — brand, UI tokens, theme, admin email configuration
- `src/lib/auth/` — Auth helpers (session management) — no sub-CLAUDE.md
- `src/lib/utils/` — Utility helpers — no sub-CLAUDE.md

### Core
- `src/context/CLAUDE.md` — React Context providers (CartContext, ToastContext, CurrencyContext)
- `src/hooks/CLAUDE.md` — custom React hooks
- `src/types/CLAUDE.md` — shared TypeScript types
- `src/styles/CLAUDE.md` — CSS globals, customization.css design tokens
