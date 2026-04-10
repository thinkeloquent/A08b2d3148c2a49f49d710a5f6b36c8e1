# PanelRightPropertyFields

> **Package:** `@internal/panel-right-property-fields`
> **Location:** `platform/frontend-components/panel-right-property-fields/`

## What this component does

A right-side panel that displays grouped, searchable property fields with collapsible sections. Each field shows a display label and a machine key. Ideal for schema explorers, column pickers, and field mapping UIs.

## Exports

| Export | Kind | File |
|--------|------|------|
| `PanelRightPropertyFields` | React component | `src/PanelRightPropertyFields.tsx` |
| `PanelRightPropertyFieldsProps` | TypeScript type | `src/types.ts` |
| `PropertyField` | TypeScript type | `src/types.ts` |
| `PropertyFieldGroup` | TypeScript type | `src/types.ts` |

## Props API

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | Yes | Panel header title |
| `titleIcon` | `ReactNode` | No | Icon rendered next to the title |
| `totalCount` | `number` | No | Total field count badge. Derived from groups if omitted. |
| `groups` | `PropertyFieldGroup[]` | Yes | Grouped fields to display |
| `searchValue` | `string` | No | Controlled search input value |
| `onSearchChange` | `(value: string) => void` | No | Callback when search changes |
| `searchPlaceholder` | `string` | No | Search input placeholder (default: "Search fields...") |
| `searchIcon` | `ReactNode` | No | Custom search icon |
| `onFieldClick` | `(field, group) => void` | No | Callback when a field is clicked |
| `defaultCollapsedGroups` | `string[]` | No | Group names collapsed by default |
| `chevronIcon` | `ReactNode` | No | Custom chevron icon for group headers |
| `className` | `string` | No | CSS class escape hatch |
| `children` | `ReactNode` | No | Content below the field list |

## Quick-start usage

```tsx
import { PanelRightPropertyFields } from '@internal/panel-right-property-fields';

const groups = [
  {
    name: 'Identity',
    fields: [{ label: 'user_id', fieldKey: 'userId' }],
  },
  {
    name: 'Details',
    fields: [
      { label: 'full_name', fieldKey: 'fullName' },
      { label: 'email', fieldKey: 'email' },
    ],
  },
];

function App() {
  const [search, setSearch] = useState('');
  return (
    <PanelRightPropertyFields
      title="Fields"
      groups={groups}
      searchValue={search}
      onSearchChange={setSearch}
      onFieldClick={(field) => console.log(field.fieldKey)}
    />
  );
}
```

## Integration checklist

1. **Vite alias** — `vite.config.ts`:
   ```ts
   '@internal/panel-right-property-fields': path.resolve(__dirname, '../../platform/frontend-components/panel-right-property-fields/src')
   ```
2. **TypeScript paths** — `tsconfig.json`:
   ```json
   { "@internal/panel-right-property-fields": ["../../platform/frontend-components/panel-right-property-fields/src"] }
   ```
3. **Tailwind @source** — app CSS entry:
   ```css
   @source "../../platform/frontend-components/panel-right-property-fields/src";
   ```

## Design constraints

- Zero runtime dependencies (React is a peer dep)
- No router, icon-library, or state-management imports
- className escape hatch on root component
- Children slot for extensibility below the field list
- Tailwind-only styling
