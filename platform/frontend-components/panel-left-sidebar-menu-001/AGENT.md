# PanelLeftSidebarMenu001

> **Package:** `@internal/panel-left-sidebar-menu-001`
> **Location:** `platform/frontend-components/panel-left-sidebar-menu-001/`

## What this component does

A sidebar panel with fuzzy search, category filter pills, a scrollable item list with star toggles/tags/usage bars, and keyboard navigation (arrow keys, Enter, Escape). Use it as a left-panel browser for templates, documents, projects, or any categorized collection.

## Exports

| Export | Kind | File |
|--------|------|------|
| `PanelLeftSidebarMenu001` | React component | `src/PanelLeftSidebarMenu001.tsx` |
| `PanelLeftSidebarMenu001Props` | TypeScript type | `src/types.ts` |
| `SidebarCategory` | TypeScript type | `src/types.ts` |
| `SidebarItem` | TypeScript type | `src/types.ts` |
| `CategoryColorScheme` | TypeScript type | `src/types.ts` |

## Props API

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| title | `string` | no | Sidebar heading (default: `"Templates"`) |
| categories | `SidebarCategory[]` | yes | Category filter list; first entry is the default/all filter |
| items | `SidebarItem[]` | yes | Items to display |
| categoryColors | `Record<string, CategoryColorScheme>` | no | Badge color map keyed by category id |
| maxUsageCount | `number` | no | Max value for normalizing usage bars (auto-detects if omitted) |
| searchPlaceholder | `string` | no | Search input placeholder |
| onItemSelect | `(item: SidebarItem) => void` | no | Fires on item click or Enter key |
| onStarToggle | `(id: string \| number, starred: boolean) => void` | no | Fires when star is toggled; omit to hide stars |
| headerActionIcon | `ReactNode` | no | Icon in header button; pass `null` to hide button |
| onHeaderAction | `() => void` | no | Header button click handler |
| footer | `ReactNode` | no | Custom footer content replacing default button |
| footerLabel | `string` | no | Default footer button label |
| onFooterAction | `() => void` | no | Default footer button click |
| className | `string` | no | CSS class escape hatch on the root element |

## Quick-start usage

```tsx
import { PanelLeftSidebarMenu001 } from '@internal/panel-left-sidebar-menu-001';

<PanelLeftSidebarMenu001
  title="Templates"
  categories={[
    { id: 'all', label: 'All', icon: '◈', count: 5 },
    { id: 'docs', label: 'Docs', icon: '◉', count: 3 },
    { id: 'ops', label: 'Ops', icon: '▣', count: 2 },
  ]}
  items={[
    { id: 1, name: 'API Spec', category: 'docs', tags: ['REST'], updated: '2d ago', usageCount: 42, starred: true },
    { id: 2, name: 'Runbook', category: 'ops', tags: ['SRE'], updated: '1d ago', usageCount: 88, starred: false },
  ]}
  categoryColors={{
    docs: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200' },
    ops: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  }}
  searchPlaceholder="Search templates..."
  onItemSelect={(item) => console.log('Selected', item)}
  onStarToggle={(id, starred) => console.log('Star', id, starred)}
/>
```

## Integration checklist

1. **Vite alias** — `vite.config.ts`:
   ```ts
   '@internal/panel-left-sidebar-menu-001': path.resolve(__dirname, '../../platform/frontend-components/panel-left-sidebar-menu-001/src')
   ```
2. **TypeScript paths** — `tsconfig.json`:
   ```json
   { "@internal/panel-left-sidebar-menu-001": ["../../platform/frontend-components/panel-left-sidebar-menu-001/src"] }
   ```
3. **Tailwind @source** — app CSS entry:
   ```css
   @source "../../platform/frontend-components/panel-left-sidebar-menu-001/src";
   ```

## Design constraints

- Zero runtime dependencies (React is a peer dep)
- No router, icon-library, or state-management imports
- className escape hatch on the root element
- Children slots via `footer` prop
- Tailwind-only styling
