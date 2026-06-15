# UI Components Context

Base shadcn-style components under `src/components/ui/` — building blocks for all UI.

Built on **Radix primitives** with Tailwind CSS 4 styling. Design tokens from `src/lib/constants/ui.ts` control button shapes, card styles, and input borders.

## Styling System

### Design Tokens (`customization.css`)

| Category | Tokens |
|----------|--------|
| Colors | `--primary`, `--accent`, `--background`, `--foreground`, `--secondary`, `--muted`, `--border`, `--border-strong` |
| Shadows | `--shadow-xs` through `--shadow-xl` (elevation system) |
| Radius | `--radius-sm` through `--radius-2xl`, `--radius-full` |
| Transitions | `--transition-fast` (150ms), `--transition-base` (200ms), `--transition-slow` (300ms), `--transition-spring` |

### Hover Behavior Patterns

All interactive components follow consistent patterns:

| Pattern | Implementation |
|---------|----------------|
| **Lift** | `-translate-y-0.5` on hover |
| **Shadow escalation** | `shadow-sm` → `shadow-md` on hover |
| **Border strengthening** | `border-border` → `border-border-strong` on hover |
| **Easing** | `ease-out` for natural deceleration |

### Button Variants

| Variant | Style |
|---------|-------|
| `default` | Primary fill, lifts + shadows on hover |
| `destructive` | Red fill (`--danger`), lifts + shadows on hover |
| `outline` | Border-2, subtle background on hover |
| `secondary` | Muted fill, subtle lift on hover |
| `ghost` | No background, subtle hover state |
| `link` | Underline on hover |

All button sizes use `rounded-lg` with consistent padding (`h-11 px-5 py-2.5` default).

### Component Updates

#### Dropdown Menu
- Content: `rounded-xl`, `shadow-lg`, `p-1.5` padding
- Items: `rounded-lg`, `py-2.5`, hover state `focus:bg-accent-light`
- Sub-trigger: Same rounded treatment

#### Dialog
- Overlay: `bg-black/60 backdrop-blur-sm` (frosted glass effect)
- Content: `rounded-xl`, `shadow-xl`, `gap-5`
- Close button: `rounded-lg`, hover opacity + background transition

#### Select
- Trigger: `rounded-lg`, `h-11`, hover `border-border-strong`
- Content: `rounded-xl`, `shadow-lg`
- Items: `rounded-lg`, `py-2.5`, hover `focus:bg-accent-light`

#### Tabs
- List: `rounded-xl`, `bg-background-muted`, `p-1.5`, `shadow-sm`
- Trigger: `rounded-lg`, `px-5 py-2.5`, active `font-semibold` + `shadow-sm`
- Content: `mt-4` margin

#### Toast
- Variants use `rounded-xl`, `p-5` padding
- Action/close: `rounded-lg`, transition on all states

#### Sheet (Slide-out panels)
- Same dialog overlay treatment (`bg-black/60 backdrop-blur-sm`)
- Content: `rounded-xl`, `shadow-xl`
- Close button: Consistent hover treatment

#### Input/Textarea
- `rounded-lg`, `h-11` height for inputs
- Hover: `border-border-strong`
- Focus: `ring-2 ring-accent ring-offset-2`
- Textarea: `min-h-[120px]`, `resize-none`

#### Table
- Container: `rounded-xl`, `border-border`, `shadow-sm`
- Rows: Hover `bg-background-muted`, transition on all
- Header: `font-semibold`
- Footer: `bg-background-muted`

#### Skeleton
- `rounded-xl` with gradient shimmer (`from-muted to-muted/70`)

#### Label
- `text-sm font-medium` with transition support

#### Separator
- `bg-border`, `h-[1px]` or `w-[1px]`

## Implemented Components

| Component | Notes |
|-----------|-------|
| `button/` | All variants (default, destructive, outline, secondary, ghost, link) with lift + shadow hover |
| `card/` | CardHeader, CardTitle, CardDescription, CardContent, CardFooter with lift + shadow |
| `dialog/` | Frosted overlay (`bg-black/60 backdrop-blur-sm`), rounded content |
| `dropdown-menu/` | Rounded items (`rounded-lg`) with light accent hover |
| `editor/MarkdownEditor` | MDX-based markdown editor |
| `input/` | Hover border strengthening, focus ring |
| `label/` | Subtle transition support |
| `select/` | Rounded trigger + content (`rounded-lg`) |
| `separator/` | Horizontal/vertical divider (`h-[1px]`/w-full) |
| `sheet/` | Frosted overlay (`bg-black/60 backdrop-blur-sm`), same dialog treatment |
| `skeleton/` | Gradient shimmer (`rounded-xl` with `from-muted to-muted/70`) |
| `table/` | Rounded container (`rounded-xl`), hover rows (`bg-background-muted`) |
| `tabs/` | Rounded list (`bg-background-muted rounded-xl`), active `shadow-sm` |
| `textarea/` | Hover border + focus ring (`ring-offset-2`) |
| `toast/` | Rounded variants with transitions |
| `accordion/` | Collapsible content sections |
| `switch/` | Toggle switch component |
| `lightbox/` | Full-screen image/video viewer |
| `hero-carousel/` | Hero image carousel with auto-advancement |
