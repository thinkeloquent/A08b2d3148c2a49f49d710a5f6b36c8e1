# PanelLeftSidebarMenu002

> **Package:** `@internal/panel-left-sidebar-menu-002`
> **Location:** `platform/frontend-components/panel-left-sidebar-menu-002/`

## What this component does

A sidebar panel with fuzzy search, collapsible checkbox filter sections, active filter pills with remove buttons, a scrollable item list with star toggles/tags/usage bars, and keyboard navigation. Use it when you need multi-faceted filtering (category + status + custom) rather than single-select category pills (see `panel-left-sidebar-menu-001` for that).

## Exports

| Export | Kind | File |
|--------|------|------|
| `PanelLeftSidebarMenu002` | React component | `src/PanelLeftSidebarMenu002.tsx` |
| `PanelLeftSidebarMenu002Props` | TypeScript type | `src/types.ts` |
| `FilterSectionConfig` | TypeScript type | `src/types.ts` |
| `FilterOption` | TypeScript type | `src/types.ts` |
| `SidebarItem` | TypeScript type | `src/types.ts` |
| `ItemFilterFn` | TypeScript type | `src/types.ts` |

## Props API

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| title | `string` | no | Sidebar heading (default: `"Templates"`) |
| filterSections | `FilterSectionConfig[]` | yes | Collapsible checkbox filter groups |
| items | `SidebarItem[]` | yes | Items to display |
| itemFilter | `ItemFilterFn` | no | Custom filter fn: `(item, selections) => boolean` |
| onFilterChange | `(selections: Record<string, string[]>) => void` | no | Fires when filter selections change |
| maxUsageCount | `number` | no | Max value for usage bar (auto-detects) |
| searchPlaceholder | `string` | no | Search input placeholder |
| onItemSelect | `(item: SidebarItem) => void` | no | Item selection callback |
| onStarToggle | `(id, starred) => void` | no | Star toggle callback; omit to hide stars |
| headerActionIcon | `ReactNode` | no | Header button icon; `null` hides button |
| onHeaderAction | `() => void` | no | Header button click |
| footer | `ReactNode` | no | Custom footer content |
| footerLabel | `string` | no | Default footer button label |
| onFooterAction | `() => void` | no | Footer button click |
| className | `string` | no | CSS class escape hatch |

## Quick-start usage

```tsx
import { PanelLeftSidebarMenu002 } from '@internal/panel-left-sidebar-menu-002';

<PanelLeftSidebarMenu002
  title="Templates"
  filterSections={[
    {
      key: 'category',
      title: 'Category',
      options: [
        { id: 'docs', label: 'Docs', count: 3 },
        { id: 'ops', label: 'Ops', count: 2 },
      ],
    },
    {
      key: 'status',
      title: 'Status',
      options: [
        { id: 'starred', label: 'Starred' },
      ],
    },
  ]}
  items={[
    { id: 1, name: 'API Spec', category: 'docs', tags: ['REST'], updated: '2d ago', usageCount: 42, starred: true },
    { id: 2, name: 'Runbook', category: 'ops', tags: ['SRE'], updated: '1d ago', usageCount: 88, starred: false },
  ]}
  itemFilter={(item, selections) => {
    const cats = selections.category ?? [];
    if (cats.length > 0 && !cats.includes(item.category)) return false;
    if ((selections.status ?? []).includes('starred') && !item.starred) return false;
    return true;
  }}
  onItemSelect={(item) => console.log('Selected', item)}
  onStarToggle={(id, starred) => console.log('Star', id, starred)}
/>
```

## Integration checklist

1. **Vite alias** — `vite.config.ts`:
   ```ts
   '@internal/panel-left-sidebar-menu-002': path.resolve(__dirname, '../../platform/frontend-components/panel-left-sidebar-menu-002/src')
   ```
2. **TypeScript paths** — `tsconfig.json`:
   ```json
   { "@internal/panel-left-sidebar-menu-002": ["../../platform/frontend-components/panel-left-sidebar-menu-002/src"] }
   ```
3. **Tailwind @source** — app CSS entry:
   ```css
   @source "../../platform/frontend-components/panel-left-sidebar-menu-002/src";
   ```

## Design constraints

- Zero runtime dependencies (React is a peer dep)
- No router, icon-library, or state-management imports
- className escape hatch on the root element
- Children slots via `footer` prop
- Tailwind-only styling
