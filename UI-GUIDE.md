# UI Guide — Siêu Thị Mắt Kính Admin

## Design Tokens

### Colors
| Token | Value | Usage |
|---|---|---|
| `--gold-400` | `#d4a853` | Primary accent, CTAs, active nav |
| `--gold-500` | `#c49a42` | Primary buttons |
| `--gold-700` | `#8b6c2e` | Hover states |
| `--bg-primary` | `#0a0a0f` | Main background |
| `--bg-secondary` | `#12121a` | Sidebar, cards |
| `--bg-card` | `#16161f` | Card backgrounds |
| `--bg-tertiary` | `#1c1c28` | Input backgrounds |
| `--text-primary` | `#f0f0f5` | Main text |
| `--text-secondary` | `#a0a0b5` | Secondary text |
| `--text-tertiary` | `#6b6b80` | Labels |
| `--success` | `#34d399` | Success states |
| `--warning` | `#fbbf24` | Warnings |
| `--error` | `#f87171` | Errors |
| `--info` | `#60a5fa` | Informational |

### Typography
| Token | Value |
|---|---|
| `--font-body` | `'Inter', sans-serif` |
| `--font-heading` | `'Outfit', sans-serif` |
| `--text-xs` | `0.75rem` (12px) |
| `--text-sm` | `0.875rem` (14px) |
| `--text-base` | `1rem` (16px) |
| `--text-xl` | `1.25rem` (20px) |
| `--text-2xl` | `1.5rem` (24px) |

### Spacing
| Token | Value |
|---|---|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |

### Radius & Shadow
| Token | Value |
|---|---|
| `--radius-sm` | `4px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--radius-xl` | `16px` |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.2)` |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.25)` |

---

## Component Catalog

All components: `src/components/admin/`

| Component | File | Props |
|---|---|---|
| **BottomNav** | `BottomNav.tsx` | N/A (auto-detects active route) |
| **AdminHeader** | `AdminHeader.tsx` | N/A (global search modal) |
| **PageTitle** | `PageTitle.tsx` | `title` `subtitle` `icon` `breadcrumb[]` `actions` |
| **DataTable** | `DataTable.tsx` | `columns` `data` `loading` `rowKey` `actions` `searchable` `pagination` `bulkActions` `cardTitle` `cardSubtitle` |
| **StatCard** | `StatCard.tsx` | `label` `value` `icon` `color` `change` `onClick` |
| **StatusBadge** | `StatusBadge.tsx` | `label` `color` `variant` `size` `icon` |
| **FilterBar** | `FilterBar.tsx` | `options[]` `value` `onChange` |
| **StickyActionBar** | `StickyActionBar.tsx` | `children` `visible` |
| **AdminDrawer** | `AdminDrawer.tsx` | `open` `onClose` `title` `children` `position` |
| **FormField** | `FormField.tsx` | `label` `name` `type` `value` `onChange` `error` `required` |
| **Skeleton** | `Skeleton.tsx` | `width` `height` `variant` `count` |
| **EmptyState** | `EmptyState.tsx` | `icon` `title` `description` `actionLabel` `onAction` |
| **ConfirmDialog** | `ConfirmDialog.tsx` | `open` `onClose` `onConfirm` `title` `message` `variant` |
| **Toast** | `Toast.tsx` | `message` `type` `duration` `onClose` |

---

## One-Hand Mobile Rules

### Layout (≤768px)
- **Sidebar** → hidden, replaced by **BottomNav** (5 items + More drawer)
- **AdminHeader** → fixed top bar with global search
- **Hamburger** → hidden on phone, visible on tablet (769-1023px)

### Tap Targets
- Minimum **44px** height for all interactive elements
- Buttons: `min-height: 44px`
- Kebab menu items: `min-height: 44px`
- Filter chips: `min-height: 36px`

### Thumb Zone
- Primary CTAs at bottom of screen via **StickyActionBar**
- Bottom navigation in safe thumb-reach area
- **AdminDrawer** opens from bottom (not side) on mobile

### Tables (Mobile)
- Tables with ≥5 columns → **card list** view (via `admin-datatable__cards`)
- Tables with ≤4 columns → horizontal scroll with compact cells
- Row actions → **kebab menu** (⋯) instead of inline icon buttons

### Forms (Mobile)
- Use **AdminDrawer** (bottom sheet) instead of modals
- All inputs: `min-height: 44px` with clear focus states
- Form sections with clear visual separation
- Error messages below fields, error summary at top

### Breakpoints
| Breakpoint | Layout |
|---|---|
| ≤768px | BottomNav + AdminHeader, card view for tables |
| 769–1023px | Hamburger sidebar + table view |
| ≥1024px | Fixed sidebar + table view |
