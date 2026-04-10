# Prompt Management System Frontend

## Overview

React-based user-facing application with Vite bundler and Tailwind CSS styling.

## Technology Stack

- **Framework**: React 18
- **Bundler**: Vite
- **Routing**: React Router DOM 6
- **State Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Directory Structure

```
frontend/
├── src/
│   ├── main.tsx               # Application entry point
│   ├── App.tsx                # Root component with routing
│   ├── index.css              # Global styles (Tailwind imports)
│   ├── vite-env.d.ts          # Vite type definitions
│   ├── types/                 # TypeScript type definitions
│   │   ├── api.ts             # API response/request types
│   │   ├── errors.ts          # Error types
│   │   └── index.ts
│   ├── hooks/                 # Custom React hooks
│   │   ├── useRepositories.ts
│   │   ├── useTags.ts
│   │   ├── useMetadata.ts
│   │   └── index.ts
│   ├── services/api/          # API client functions
│   │   ├── client.ts          # Axios/fetch client setup
│   │   ├── repositories.ts
│   │   ├── tags.ts
│   │   ├── metadata.ts
│   │   └── index.ts
│   ├── lib/                   # Utility libraries
│   │   └── queryClient.ts     # React Query client config
│   ├── components/            # Reusable UI components
│   └── utils/                 # Helper functions
├── index.html                 # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts             # Vite configuration with API proxy
├── tailwind.config.js
└── postcss.config.js
```

## Key Patterns

### Data Fetching with React Query
```typescript
// hooks/useRepositories.ts
export function useRepositories() {
  return useQuery({
    queryKey: ['repositories'],
    queryFn: () => repositoriesApi.getAll(),
  });
}
```

### API Client Setup
```typescript
// services/api/client.ts
const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});
```

### Type Definitions
```typescript
// types/api.ts
export interface Repository {
  id: string;
  name: string;
  // ...
}
```

## Development

```bash
# Start development server (port 5173)
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Run tests
pnpm run test
```

## Configuration

### Vite Proxy
API requests are proxied to the backend:
```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  }
}
```

### Tailwind Configuration
Extend theme in `tailwind.config.js` for custom styles.

## Component Guidelines

1. **Keep components small and focused**
2. **Use TypeScript for all components**
3. **Extract reusable logic into hooks**
4. **Use React Query for server state**
5. **Style with Tailwind utility classes**

## Related Components

- API types match: `../protobuf/proto/*.proto`
- Backend API: `../backend`
