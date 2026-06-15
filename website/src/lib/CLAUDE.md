# Lib Folder Overview

`src/lib/` contains shared server-side utilities, configurations, and database models.

## Subdirectories

| Path | Purpose |
|------|---------|
| `src/lib/db/` | MongoDB connection + Mongoose models |
| `src/lib/cache/` | Next.js native caching (unstable_cache + revalidateTag) |
| `src/lib/validators/` | Zod schemas (shared frontend/backend) |
| `src/lib/constants/` | Hardcoded config (brand, UI tokens, theme, admin emails) |
| `src/lib/utils/` | Utility helpers (cn, formatPrice, slugify, etc.) |
| `src/lib/auth/` | Auth helpers (cookie-only signed sessions) |
| `src/lib/seaweed.ts` | Self-hosted SeaweedFS S3 upload integration |

## Key Files

| Path | Purpose |
|------|---------|
| `src/lib/seaweed.ts` | Self-hosted SeaweedFS S3 upload integration |
| `src/lib/media.ts` | Media utilities |
| `src/lib/currency.ts` | Currency helpers |

For detailed context on specific areas, see:
- `src/lib/db/CLAUDE.md` — MongoDB connection and model best practices
- `src/lib/validators/CLAUDE.md` — Zod schemas
- `src/lib/constants/CLAUDE.md` — brand, UI tokens, theme, admin config