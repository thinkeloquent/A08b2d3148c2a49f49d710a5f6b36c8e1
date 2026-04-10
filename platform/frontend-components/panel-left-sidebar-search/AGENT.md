# PanelLeftSidebarSearch

> **Package:** `@internal/panel-left-sidebar-search`
> **Location:** `platform/frontend-components/panel-left-sidebar-search/`

## What this component does

A generic left-panel search and filter component with fuzzy matching, inline `key:value` token parsing, a multi-step filter palette, and optional result grouping. Use it as a sidebar to search/filter any list of items by text and structured facets.

## Exports

| Export | Kind | File |
|--------|------|------|
| `PanelLeftSidebarSearch` | React component (generic `<T>`) | `src/PanelLeftSidebarSearch.tsx` |
| `FuzzyHighlight` | React component | `src/PanelLeftSidebarSearch.tsx` |
| `fuzzy` | Utility function | `src/fuzzy.ts` |
| `PanelLeftSidebarSearchProps` | TypeScript type | `src/types.ts` |
| `FacetDefinition` | TypeScript type | `src/types.ts` |
| `FacetMap` | TypeScript type | `src/types.ts` |
| `FuzzyResult` | TypeScript type | `src/types.ts` |
| `SearchHint` | TypeScript type | `src/types.ts` |
| `Operator` | TypeScript type | `src/types.ts` |

## Props API

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| items | `T[]` | Yes | Full list of items to search/filter |
| facets | `FacetMap` | Yes | Facet definitions keyed by field name |
| getSearchableFields | `(item: T) => { name, description, tags? }` | Yes | Extract searchable text from an item |
| getFacetValue | `(item: T, facetKey: string) => string` | Yes | Extract facet field value for filtering |
| renderItem | `(item: T, queryText: string, index: number) => ReactNode` | Yes | Render a single result row |
| renderGroupHeader | `(groupKey: string, count: number) => ReactNode` | No | Custom group header renderer |
| getGroupKey | `(item: T) => string` | No | Extract group key; enables group-by toggle |
| groupByLabel | `string` | No | Label for group toggle (default: "Group") |
| operators | `Operator[]` | No | Filter operators (default: ["is","is not","contains"]) |
| placeholder | `string` | No | Input placeholder |
| title | `string` | No | Header title |
| subtitle | `string` | No | Header subtitle |
| headerIcon | `ReactNode` | No | Icon in the header |
| hints | `SearchHint[]` | No | Quick-syntax hints shown on focus |
| footer | `ReactNode` | No | Footer content |
| className | `string` | No | CSS class on root container |
| children | `ReactNode` | No | Content after results |

## Quick-start usage

```tsx
import { PanelLeftSidebarSearch, FuzzyHighlight, fuzzy } from '@internal/panel-left-sidebar-search';
import type { FacetMap } from '@internal/panel-left-sidebar-search';

const FACETS: FacetMap = {
  status: { label: 'Status', icon: '●', accent: '#f59e0b', values: ['Active', 'Draft'] },
};

<PanelLeftSidebarSearch
  items={myItems}
  facets={FACETS}
  getSearchableFields={(item) => ({ name: item.name, description: item.desc })}
  getFacetValue={(item, key) => item[key] || ''}
  renderItem={(item, queryText, i) => (
    <div key={item.id} className="px-3 py-2 text-sm">
      <FuzzyHighlight text={item.name} idx={queryText ? fuzzy(item.name, queryText).idx : []} />
    </div>
  )}
  placeholder="Search..."
/>
```

## Integration checklist

1. **Vite alias** — `vite.config.ts`:
   ```ts
   '@internal/panel-left-sidebar-search': path.resolve(__dirname, '../../platform/frontend-components/panel-left-sidebar-search/src')
   ```
2. **TypeScript paths** — `tsconfig.json`:
   ```json
   { "@internal/panel-left-sidebar-search": ["../../platform/frontend-components/panel-left-sidebar-search/src"] }
   ```
3. **Tailwind @source** — app CSS entry:
   ```css
   @source "../../platform/frontend-components/panel-left-sidebar-search/src";
   ```

## Design constraints

- Zero runtime dependencies (React is a peer dep)
- No router, icon-library, or state-management imports
- className escape hatch on every component
- Generic `<T>` — works with any item shape
- Tailwind-only styling
