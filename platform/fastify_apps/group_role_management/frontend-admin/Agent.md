# Group Role Management Admin Dashboard

## Overview

React-based admin dashboard with comprehensive form handling, data tables, and CRUD operations.

## Technology Stack

- **Framework**: React 18
- **Bundler**: Vite
- **Routing**: React Router DOM 6
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Testing Library + MSW
- **Language**: TypeScript

## Directory Structure

```
frontend-admin/
├── src/
│   ├── main.tsx               # Application entry point
│   ├── App.tsx                # Root component with routing
│   ├── config.ts              # Application configuration
│   ├── index.css              # Global styles
│   ├── pages/                 # Page components
│   │   ├── DashboardPage.tsx
│   │   ├── BulkInsertPage.tsx
│   │   ├── repositories/      # Repository CRUD pages
│   │   │   ├── RepositoriesPage.tsx
│   │   │   ├── RepositoryCreatePage.tsx
│   │   │   ├── RepositoryDetailPage.tsx
│   │   │   ├── RepositoryEditPage.tsx
│   │   │   └── index.ts
│   │   ├── tags/              # Tag management pages
│   │   └── metadata/          # Metadata management pages
│   ├── components/            # Reusable UI components
│   │   ├── layout/            # Layout components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── index.ts
│   │   ├── forms/             # Form components
│   │   │   ├── FormField.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── TextArea.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── TagInput.tsx
│   │   │   └── index.ts
│   │   ├── tables/            # Table components
│   │   │   ├── DataTable.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── index.ts
│   │   ├── diff/              # Diff visualization
│   │   │   ├── DiffViewer.tsx
│   │   │   ├── FieldDiff.tsx
│   │   │   └── index.ts
│   │   └── feedback/          # User feedback
│   │       ├── Toast.tsx
│   │       ├── ConfirmDialog.tsx
│   │       └── index.ts
│   ├── hooks/                 # Custom hooks
│   │   ├── useRepositories.ts
│   │   ├── useRepositoryForm.ts
│   │   ├── useTags.ts
│   │   ├── useTagForm.ts
│   │   ├── useMetadata.ts
│   │   ├── useMetadataForm.ts
│   │   └── index.ts
│   ├── schemas/               # Zod validation schemas
│   │   ├── repository.ts
│   │   ├── tag.ts
│   │   ├── metadata.ts
│   │   └── index.ts
│   ├── services/api/          # API client
│   ├── types/                 # TypeScript types
│   ├── lib/                   # Utility libraries
│   └── utils/                 # Helper functions
├── __tests__/                 # Test suite
│   ├── setup.ts               # Test setup with MSW
│   ├── mocks/
│   │   ├── server.ts          # MSW server
│   │   └── handlers.ts        # API mock handlers
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── lib/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Key Patterns

### Form Handling with React Hook Form + Zod
```typescript
// schemas/repository.ts
export const repositorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

// hooks/useRepositoryForm.ts
export function useRepositoryForm(defaultValues) {
  return useForm({
    resolver: zodResolver(repositorySchema),
    defaultValues,
  });
}
```

### Admin Layout Pattern
```typescript
// components/layout/AdminLayout.tsx
export function AdminLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

### Data Table Pattern
```typescript
// components/tables/DataTable.tsx
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}
```

### CRUD Page Pattern
Each entity has consistent pages:
- **List Page**: DataTable with search/filter
- **Create Page**: Form for new entity
- **Detail Page**: Read-only view
- **Edit Page**: Form for updating

## Development

```bash
# Start development server
pnpm run dev

# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Build for production
pnpm run build
```

## Testing

### MSW for API Mocking
```typescript
// __tests__/mocks/handlers.ts
export const handlers = [
  http.get('/api/repositories', () => {
    return HttpResponse.json(mockRepositories);
  }),
];
```

### Component Testing
```typescript
// __tests__/components/DiffViewer.test.tsx
describe('DiffViewer', () => {
  it('shows differences between objects', () => {
    render(<DiffViewer oldValue={...} newValue={...} />);
    expect(screen.getByText('Changed')).toBeInTheDocument();
  });
});
```

## Component Guidelines

1. **Forms**: Use React Hook Form with Zod schemas
2. **Tables**: Use DataTable component with typed columns
3. **Feedback**: Use Toast for notifications, ConfirmDialog for destructive actions
4. **Layout**: Wrap pages in AdminLayout
5. **Diff**: Use DiffViewer for showing changes before save

## Related Components

- API types match: `../protobuf/proto/*.proto`
- Backend API: `../backend`
- Shares patterns with: `../frontend`
