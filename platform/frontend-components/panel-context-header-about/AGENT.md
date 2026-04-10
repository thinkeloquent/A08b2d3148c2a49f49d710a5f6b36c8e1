# PanelContextHeaderAbout

> **Package:** `@internal/panel-context-header-about`
> **Location:** `platform/frontend-components/panel-context-header-about/`

## What this component does

A collapsible "about" header card that presents an app's title, description, benefits, use-case tags, stats, and a call-to-action in a progressive-disclosure layout. Use it at the top of any app page to communicate engineering, business, and product value at a glance.

## Exports

| Export | Kind | File |
|--------|------|------|
| `PanelContextHeaderAbout` | React component | `src/PanelContextHeaderAbout.tsx` |
| `useCounter` | React hook | `src/useCounter.ts` |
| `PanelContextHeaderAboutProps` | TypeScript type | `src/types.ts` |
| `BenefitItem` | TypeScript type | `src/types.ts` |
| `TagItem` | TypeScript type | `src/types.ts` |
| `StatItem` | TypeScript type | `src/types.ts` |
| `BreadcrumbItem` | TypeScript type | `src/types.ts` |
| `CtaConfig` | TypeScript type | `src/types.ts` |
| `SelectorOption` | TypeScript type | `src/types.ts` |
| `SectionLabels` | TypeScript type | `src/types.ts` |

## Props API

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `className` | `string` | No | CSS class escape hatch on root wrapper |
| `icon` | `ReactNode` | No | Icon in the gradient badge left of the title |
| `title` | `ReactNode` | Yes | Primary heading — supports styled fragments |
| `statusBadge` | `ReactNode` | No | Badge shown next to the title (e.g. "Production Ready") |
| `description` | `ReactNode` | No | Description paragraph below the title |
| `breadcrumbs` | `BreadcrumbItem[]` | No | Breadcrumb segments above the card |
| `selectorOptions` | `SelectorOption[]` | No | Dropdown options in expanded area |
| `selectorValue` | `string` | No | Currently selected option id |
| `onSelectorChange` | `(id: string) => void` | No | Selector change callback |
| `stats` | `StatItem[]` | No | Animated stat counters |
| `benefits` | `BenefitItem[]` | No | Feature/benefit cards (2-col grid) |
| `tags` | `TagItem[]` | No | Use-case tag pills |
| `cta` | `CtaConfig` | No | Call-to-action banner with button |
| `sectionLabels` | `SectionLabels` | No | Override section heading text and icons |
| `accentGradient` | `string` | No | Tailwind gradient classes for top bar |
| `expanded` | `boolean` | No | Controlled expand state |
| `onExpandedChange` | `(expanded: boolean) => void` | No | Expand toggle callback |
| `children` | `ReactNode` | No | Additional content before the CTA |

## Quick-start usage

```tsx
import { PanelContextHeaderAbout } from '@internal/panel-context-header-about';

<PanelContextHeaderAbout
  title="My App"
  description="A brief description of what this app does."
  benefits={[
    { title: 'Fast', description: 'Optimized for speed.' },
    { title: 'Reliable', description: '99.9% uptime SLA.' },
  ]}
  tags={[
    { label: 'Engineering', colorClass: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Product', colorClass: 'bg-violet-50 text-violet-700 border-violet-200' },
  ]}
/>
```

## Integration checklist

1. **Vite alias** — `vite.config.ts`:
   ```ts
   '@internal/panel-context-header-about': path.resolve(__dirname, '../../platform/frontend-components/panel-context-header-about/src')
   ```
2. **TypeScript paths** — `tsconfig.json`:
   ```json
   { "@internal/panel-context-header-about": ["../../platform/frontend-components/panel-context-header-about/src"] }
   ```
3. **Tailwind @source** — app CSS entry:
   ```css
   @source "../../platform/frontend-components/panel-context-header-about/src";
   ```

## Design constraints

- Zero runtime dependencies (React is a peer dep)
- No router, icon-library, or state-management imports
- CTA button accepts polymorphic `buttonAs` prop for router integration
- `className` escape hatch on root component
- Tailwind-only styling
