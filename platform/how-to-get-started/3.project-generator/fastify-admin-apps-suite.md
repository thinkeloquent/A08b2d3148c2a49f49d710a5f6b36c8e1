# Fastify Admin Apps Suite

Full-stack application template with Fastify backend, React frontend, admin dashboard, protocol buffers, and Sequelize ORM.

## Overview

| Property             | Value                         |
| -------------------- | ----------------------------- |
| **Type**             | `fastify-admin-apps`          |
| **Target Directory** | `fastify_apps/{name_snake}/`  |
| **Template Path**    | `fastify-admin-apps/template` |

## What Gets Created

```
fastify_apps/{name_snake}/
├── Agent.md                    # Root documentation for LLM context
├── backend/                    # Fastify REST API server
│   ├── Agent.md
│   └── src/
│       ├── plugins/            # Fastify plugins
│       ├── routes/             # API route handlers
│       ├── services/           # Business logic layer
│       └── serializers/        # Data transformation
├── frontend/                   # React user-facing app
│   ├── Agent.md
│   └── src/
│       ├── types/              # TypeScript definitions
│       ├── hooks/              # React Query hooks
│       ├── services/api/       # API client
│       ├── lib/                # Utilities
│       ├── components/         # UI components
│       └── utils/              # Helper functions
├── frontend-admin/             # React admin dashboard
│   ├── Agent.md
│   └── src/
│       ├── pages/              # Page components
│       │   ├── repositories/
│       │   ├── tags/
│       │   └── metadata/
│       ├── components/
│       │   ├── layout/         # AdminLayout, Header, Sidebar
│       │   ├── forms/          # FormField, Input, Select, etc.
│       │   ├── tables/         # DataTable, Pagination
│       │   ├── diff/           # DiffViewer, FieldDiff
│       │   └── feedback/       # Toast, ConfirmDialog
│       ├── hooks/              # Data & form hooks
│       ├── schemas/            # Zod validation schemas
│       ├── services/api/       # API client
│       ├── types/              # TypeScript definitions
│       ├── lib/                # Utilities
│       ├── utils/              # Helper functions
│       └── __tests__/          # Test suite with MSW
├── protobuf/                   # Protocol buffer definitions
│   ├── Agent.md
│   ├── proto/                  # .proto files
│   ├── generated/              # Generated JS/TS
│   └── src/                    # Re-exports
└── sequelize/                  # Database models
    ├── Agent.md
    ├── Makefile                # Includes ../../Makefile.sequelize
    └── models/                 # Sequelize model definitions
```

## Usage

### Create a New Project

```bash
polynx() { node packages_mjs/project-generator/dist/index.js "$@"; }

# Using the CLI
polynx create fastify-admin-apps my-app

# Or with full path
node packages_mjs/project-generator/dist/index.js create fastify-admin-apps my-app
node packages_mjs/project-generator/dist/index.js create <NAME>
```

This creates: `fastify_apps/my_app/`

### Post-Generation Setup

```bash
cd fastify_apps/my_app

# 1. Setup database (uses Makefile → ../../Makefile.sequelize)
cd sequelize && make reset && cd ..

# 2. Start backend (port 3000)
cd backend && pnpm dev

# 3. In new terminal: Start frontend (port 5173)
cd frontend && pnpm dev

# 4. In new terminal: Start admin (port 5174)
cd frontend-admin && pnpm dev
```

## Technology Stack

### Backend

- **Framework**: Fastify
- **Language**: JavaScript (ESM)
- **Plugins**: @fastify/sensible, @fastify/static
- **Serialization**: Protocol Buffers (protobufjs)
- **Logging**: Pino

### Frontend & Admin

- **Framework**: React 18
- **Bundler**: Vite
- **Routing**: React Router DOM 6
- **State**: React Query (TanStack Query)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### Admin-Specific

- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + Testing Library + MSW
- **Diff**: diff library for change visualization

### Database

- **ORM**: Sequelize
- **Database**: PostgreSQL

## Agent.md Files

Each component includes an `Agent.md` file providing LLM context:

| File                      | Purpose                                      |
| ------------------------- | -------------------------------------------- |
| `Agent.md`                | Suite overview, architecture, quick start    |
| `backend/Agent.md`        | API patterns, route structure, service layer |
| `frontend/Agent.md`       | React patterns, hooks, API client setup      |
| `frontend-admin/Agent.md` | Admin patterns, forms, tables, testing       |
| `protobuf/Agent.md`       | Proto conventions, code generation           |
| `sequelize/Agent.md`      | Model definitions, associations, scripts     |

## Placeholder Variables

The template uses these placeholders (auto-replaced during generation):

| Placeholder                | Example Value | Used For                 |
| -------------------------- | ------------- | ------------------------ |
| `{{APP_NAME}}`             | `my-app`      | Original kebab-case name |
| `{{APP_NAME_SNAKE}}`       | `my_app`      | Python/paths             |
| `{{APP_NAME_TITLE}}`       | `My App`      | Documentation            |
| `{{APP_NAME_PASCAL}}`      | `MyApp`       | Class names              |
| `{{APP_NAME_CAMEL}}`       | `myApp`       | Variables                |
| `{{APP_NAME_UPPER_SNAKE}}` | `MY_APP`      | Constants/env vars       |

## Architecture Patterns

### Backend Service Layer

```javascript
// routes/repositories.mjs
fastify.get("/", async (request, reply) => {
  const repositories = await repositoryService.findAll();
  return reply.send(repositories);
});

// services/repository.service.mjs
export async function findAll() {
  return Repository.findAll({ include: ["tags"] });
}
```

### Frontend Data Fetching

```typescript
// hooks/useRepositories.ts
export function useRepositories() {
  return useQuery({
    queryKey: ["repositories"],
    queryFn: () => api.repositories.getAll(),
  });
}
```

### Admin Form Handling

```typescript
// schemas/repository.ts
export const repositorySchema = z.object({
  name: z.string().min(1, "Required"),
});

// hooks/useRepositoryForm.ts
export function useRepositoryForm() {
  return useForm({ resolver: zodResolver(repositorySchema) });
}
```

## Related Documentation

- [CLI Basic Usage](./1.cli-basic-usage.sh)
- [Create Projects](./2.create-projects.sh)
- [Project Types Reference](./6.project-types-reference.sh)
- [Creating Templates](./7.creating-templates.sh)
