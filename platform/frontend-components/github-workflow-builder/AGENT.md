# GithubWorkflowBuilder

> **Package:** `@internal/github-workflow-builder`
> **Location:** `platform/frontend-components/github-workflow-builder/`

## What this component does

A full-featured GitHub Actions Workflow Manager. Provides a three-panel layout (sidebar, main editor, right detail panel) for creating workflows from preset templates, editing template variables, managing utility scripts, linking/unlinking utilities to workflows, and exporting a HATEOAS-style JSON bundle. Includes an Edge.js-like template engine for variable interpolation in YAML templates.

## Exports

| Export | Kind | File |
|--------|------|------|
| `GithubWorkflowBuilder` | React component | `src/GithubWorkflowBuilder.tsx` |
| `compileTemplate` | Utility function | `src/template-engine.ts` |
| `GithubWorkflowBuilderProps` | TypeScript type | `src/types.ts` |
| `WorkflowPreset` | TypeScript type | `src/types.ts` |
| `WorkflowUtil` | TypeScript type | `src/types.ts` |
| `Workflow` | TypeScript type | `src/types.ts` |
| `WorkflowBuilderIcons` | TypeScript type | `src/types.ts` |

## Props API

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| presets | `WorkflowPreset[]` | No | Preset templates for creating workflows (default: 3 built-in presets) |
| initialWorkflows | `Workflow[]` | No | Initial workflows to display (default: empty) |
| initialUtils | `WorkflowUtil[]` | No | Initial utility scripts (default: 4 built-in utilities) |
| icons | `Partial<WorkflowBuilderIcons>` | No | Custom icon overrides (18 icon slots with inline SVG defaults) |
| onWorkflowCreate | `(workflow: Workflow) => void` | No | Called when a workflow is created |
| onWorkflowDelete | `(id: string) => void` | No | Called when a workflow is deleted |
| onUtilCreate | `(util: WorkflowUtil) => void` | No | Called when a utility is created |
| onUtilDelete | `(id: string) => void` | No | Called when a utility is deleted |
| onExport | `(data: unknown) => void` | No | Called when the export bundle is generated |
| className | `string` | No | CSS class escape hatch on root element |
| children | `ReactNode` | No | Custom empty state for main area |

## Quick-start usage

```tsx
import { GithubWorkflowBuilder } from '@internal/github-workflow-builder';

function App() {
  return (
    <GithubWorkflowBuilder
      onWorkflowCreate={(w) => console.log('Created:', w)}
      onExport={(data) => console.log('Export:', data)}
    />
  );
}
```

## Integration checklist

1. **Vite alias** -- `vite.config.ts`:
   ```ts
   '@internal/github-workflow-builder': path.resolve(__dirname, '../../platform/frontend-components/github-workflow-builder/src')
   ```
2. **TypeScript paths** -- `tsconfig.json`:
   ```json
   { "@internal/github-workflow-builder": ["../../platform/frontend-components/github-workflow-builder/src"] }
   ```
3. **Tailwind @source** -- app CSS entry:
   ```css
   @source "../../platform/frontend-components/github-workflow-builder/src";
   ```

## Design constraints

- Zero runtime dependencies (React is a peer dep)
- No router, icon-library, or state-management imports
- className escape hatch on the root element
- Tailwind-only styling with inline SVG icons
- All CRUD state is internal; consumer receives callbacks
- Template engine (`compileTemplate`) is a pure function, independently importable
