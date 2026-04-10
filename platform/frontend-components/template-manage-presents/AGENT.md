# TemplateManagePresents

> **Package:** `@internal/template-manage-presents`
> **Location:** `platform/frontend-components/template-manage-presents/`

## What this component does

A full-featured Template Management Platform UI for managing template presets with token replacements, a browsable catalog, generated instances, audit logging, references (which apps use templates), and labels/tags. Uses a compound component pattern so consumers can use the full shell or individual sub-components.

## Exports

| Export | Kind | File |
|--------|------|------|
| `TemplateManagePresents` | React component (compound) | `src/TemplateManagePresents.tsx` |
| `TemplateManagePresentsProps` | TypeScript type | `src/types.ts` |
| `TemplatePreset` | TypeScript type | `src/types.ts` |
| `Template` | TypeScript type | `src/types.ts` |
| `TemplateInstance` | TypeScript type | `src/types.ts` |
| `AuditEntry` | TypeScript type | `src/types.ts` |
| `TemplateReference` | TypeScript type | `src/types.ts` |
| `Label` | TypeScript type | `src/types.ts` |
| `NavItem` | TypeScript type | `src/types.ts` |

## Sub-components (compound pattern)

| Sub-component | Purpose |
|---------------|---------|
| `TemplateManagePresents.Catalog` | Catalog view with search/filter |
| `TemplateManagePresents.PresetCard` | Individual preset card |
| `TemplateManagePresents.PresetDetail` | Preset detail view |
| `TemplateManagePresents.SetupWizard` | Instance generation wizard |
| `TemplateManagePresents.Instances` | Instances table |
| `TemplateManagePresents.TemplatesAdmin` | Templates admin table |
| `TemplateManagePresents.PresetsAdmin` | Presets admin table |
| `TemplateManagePresents.AuditLog` | Audit log view |
| `TemplateManagePresents.Sidebar` | Sidebar navigation |
| `TemplateManagePresents.Badge` | Badge component |
| `TemplateManagePresents.Button` | Button (polymorphic `as` prop) |
| `TemplateManagePresents.StatCard` | Stat card |
| `TemplateManagePresents.ProgressBar` | Progress bar |
| `TemplateManagePresents.Field` | Text input field |
| `TemplateManagePresents.SelectField` | Select dropdown |
| `TemplateManagePresents.Toggle` | Toggle switch |
| `TemplateManagePresents.ReviewSection` | Key-value review section |

## Props API (main component)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| presets | `TemplatePreset[]` | No | Template presets for the catalog |
| templates | `Template[]` | No | Raw template sources |
| instances | `TemplateInstance[]` | No | Generated instances |
| auditLog | `AuditEntry[]` | No | Audit log entries |
| categories | `string[]` | No | Available categories for filtering |
| navItems | `NavItem[]` | No | Navigation items (defaults provided) |
| defaultPage | `string` | No | Initial active page (default: "catalog") |
| categoryColors | `Record<string, string>` | No | Category-to-color mapping |
| onPresetSelect | `(preset) => void` | No | Called when a preset is selected |
| onInstanceGenerate | `(preset, config) => void` | No | Called when an instance is generated |
| title | `string` | No | Platform title (default: "Template Platform") |
| brandIcon | `ReactNode` | No | Brand icon for the sidebar |
| userAvatar | `ReactNode` | No | User avatar content |
| className | `string` | No | CSS class escape hatch |
| defaultCollapsed | `boolean` | No | Sidebar collapsed on mount |
| headerRight | `ReactNode` | No | Header right slot |

## Quick-start usage

```tsx
import { TemplateManagePresents } from '@internal/template-manage-presents';
import type { TemplatePreset } from '@internal/template-manage-presents';

function App() {
  const presets: TemplatePreset[] = [/* ... */];

  return (
    <TemplateManagePresents
      presets={presets}
      categories={['Backend', 'Frontend']}
      onPresetSelect={(p) => console.log(p.name)}
    />
  );
}
```

### Using sub-components standalone

```tsx
import { TemplateManagePresents } from '@internal/template-manage-presents';

function CatalogPage({ presets }) {
  return (
    <TemplateManagePresents.Catalog
      presets={presets}
      categories={['Backend', 'Frontend']}
      onSelect={(p) => console.log(p.name)}
    />
  );
}
```

## Integration checklist

1. **Vite alias** -- `vite.config.ts`:
   ```ts
   '@internal/template-manage-presents': path.resolve(__dirname, '../../platform/frontend-components/template-manage-presents/src')
   ```
2. **TypeScript paths** -- `tsconfig.json`:
   ```json
   { "@internal/template-manage-presents": ["../../platform/frontend-components/template-manage-presents/src"] }
   ```
3. **Tailwind @source** -- app CSS entry:
   ```css
   @source "../../platform/frontend-components/template-manage-presents/src";
   ```

## Design constraints

- Zero runtime dependencies (React is a peer dep)
- No router, icon-library, or state-management imports in src/
- Icons passed as `ReactNode` props (inline SVGs in dev examples)
- className escape hatch on every component
- Tailwind-only styling (DM Sans font, indigo/violet gradients, slate backgrounds)
- Token replacement uses `{{{ token }}}` mustache syntax
