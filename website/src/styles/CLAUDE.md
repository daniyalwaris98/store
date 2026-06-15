# Styles and Design Tokens

`src/styles/` contains global CSS and the user-editable customization system.

## Files

| File | Purpose |
| --- | --- |
| `src/app/globals.css` | Base styles + imports customization.css |
| `src/styles/customization.css` | User-editable design tokens (CSS variables) |
| `src/styles/.impeccable.md` | Comprehensive design token documentation |

## Design Tokens

All design tokens are defined as CSS variables in `customization.css`.

**Token categories in customization.css:**

- Color System — `--primary`, `--accent`, `--background`, `--foreground`, `--secondary`, `--muted`, `--success`, `--danger`, `--warning`, `--destructive`, etc.
- Shadows — `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl` (elevation system)
- Border Radius — `--radius-sm` through `--radius-full`
- Typography — `--font-family`, `--font-size-xs` through `--font-size-4xl`
- Transitions — `--transition-fast`, `--transition-base`, `--transition-slow`, `--transition-spring`
- Spacing — `--section-gap`, `--card-padding`, `--grid-gap`
- Focus Ring — `--focus-ring`, `--focus-ring-offset`

**For full design token reference, see:**

- `src/styles/.impeccable.md` — comprehensive design documentation
- `src/styles/customization.css` — the actual CSS variable definitions

## Design Principles

1. **Elevation via shadows** — Components gain shadow on hover, creating lift effect
2. **Subtle animations** — 200ms ease-out transitions, no jarring movements
3. **Layered borders** — `--border` for default, `--border-strong` for hover/focus
4. **Warm minimal palette** — Slate-based neutrals with blue accent

## Related

- Design token constants also exposed in `src/lib/constants/ui.ts` (button shape, card radius, input styles)
- See `src/components/ui/CLAUDE.md` for UI component styling approach
