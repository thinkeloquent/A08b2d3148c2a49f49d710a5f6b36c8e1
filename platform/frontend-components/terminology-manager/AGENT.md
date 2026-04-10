# TerminologyManager

> **Package:** `@internal/terminology-manager`
> **Location:** `platform/frontend-components/terminology-manager/`

## What this component does

A full-featured CRUD manager for terminology/glossary entries. Provides list and grid views, a slide-in detail panel, modal forms for creating/editing terms, search filtering, delete confirmation, toast notifications, and JSON export. Consumer owns the data array and provides save/delete callbacks.

## Exports

| Export | Kind | File |
|--------|------|------|
| `TerminologyManager` | React component | `src/TerminologyManager.tsx` |
| `TerminologyManagerProps` | TypeScript type | `src/types.ts` |
| `Term` | TypeScript type | `src/types.ts` |
| `PriorityColorConfig` | TypeScript type | `src/types.ts` |

## Props API

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| terms | `Term[]` | Yes | Array of terminology entries to display |
| onSave | `(term: Term) => void` | Yes | Called when a term is created or updated |
| onDelete | `(id: string) => void` | Yes | Called when a term is deleted |
| title | `string` | No | Header title (default: "Terminology Manager") |
| subtitle | `string` | No | Header subtitle (default: "Internal Knowledge Base") |
| headerIcon | `ReactNode` | No | Icon in the header badge |
| emptyStateIcon | `ReactNode` | No | Icon in the empty state |
| priorityColors | `Record<string, PriorityColorConfig>` | No | Priority color map (default: P0/P1/P2) |
| className | `string` | No | CSS class escape hatch |

## Quick-start usage

```tsx
import { useState } from 'react';
import { TerminologyManager } from '@internal/terminology-manager';
import type { Term } from '@internal/terminology-manager';

function App() {
  const [terms, setTerms] = useState<Term[]>([]);

  const handleSave = (term: Term) => {
    setTerms((prev) => {
      const idx = prev.findIndex((x) => x.id === term.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = term; return n; }
      return [term, ...prev];
    });
  };

  const handleDelete = (id: string) => {
    setTerms((prev) => prev.filter((t) => t.id !== id));
  };

  return <TerminologyManager terms={terms} onSave={handleSave} onDelete={handleDelete} />;
}
```

## Integration checklist

1. **Vite alias** — `vite.config.ts`:
   ```ts
   '@internal/terminology-manager': path.resolve(__dirname, '../../platform/frontend-components/terminology-manager/src')
   ```
2. **TypeScript paths** — `tsconfig.json`:
   ```json
   { "@internal/terminology-manager": ["../../platform/frontend-components/terminology-manager/src"] }
   ```
3. **Tailwind @source** — app CSS entry:
   ```css
   @source "../../platform/frontend-components/terminology-manager/src";
   ```

## Design constraints

- Zero runtime dependencies (React is a peer dep)
- No router, icon-library, or state-management imports
- className escape hatch on the root element
- Tailwind-only styling with inline SVG icons
