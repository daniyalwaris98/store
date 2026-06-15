# Constants

Hardcoded configuration — change once, affects everywhere. No runtime fetching.

## Files

| File | Purpose |
|------|---------|
| `src/lib/constants/brand.ts` | Store identity, logo, contact, social links |
| `src/lib/constants/ui.ts` | Button, card, input design tokens |
| `src/lib/constants/theme.ts` | Colors, typography, radius scale |
| `src/lib/constants/admin.ts` | Admin email addresses (from env ADMIN_EMAILS) |

Design tokens are CSS variables in `src/styles/customization.css`. Components use `var()` not hardcoded values.

## Usage

```typescript
import { BRAND } from "@/lib/constants/brand"
import { BUTTON, CARD } from "@/lib/constants/ui"
import { theme } from "@/lib/constants/theme"
import { ADMIN_EMAILS } from "@/lib/constants/admin"
```