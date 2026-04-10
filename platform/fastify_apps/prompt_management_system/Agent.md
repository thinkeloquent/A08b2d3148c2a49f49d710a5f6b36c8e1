# Prompt Management System - Fastify Admin Application Suite

## Overview

This is a full-stack application suite consisting of:

- **Backend**: Fastify REST API server
- **Frontend**: React user-facing application
- **Frontend-Admin**: React admin dashboard
- **Protobuf**: Protocol buffer definitions for type safety
- **Sequelize**: Database models and migrations

## Architecture

```
prompt_management_system/
├── backend/           # Fastify REST API
├── frontend/          # React user app (Vite + Tailwind)
├── frontend-admin/    # React admin dashboard
├── protobuf/          # Protocol buffer definitions
└── sequelize/         # Database models (Sequelize ORM)
```

## Quick Start

1. **Database Setup**
   ```bash
   cd sequelize && pnpm run reset
   ```

2. **Start Backend**
   ```bash
   cd backend && pnpm run dev
   ```

3. **Start Frontend** (in separate terminal)
   ```bash
   cd frontend && pnpm run dev
   ```

4. **Start Admin** (in separate terminal)
   ```bash
   cd frontend-admin && pnpm run dev
   ```

## Development Guidelines

### API Communication
- Backend exposes REST endpoints on port 3000
- Frontend proxies API requests via Vite config
- Use React Query for server state management
- Protocol buffers define shared types

### Code Organization
- Services contain business logic (backend)
- Hooks encapsulate data fetching (frontend)
- Components are reusable UI elements
- Pages compose components into views

### Testing
- Backend: Integration tests with Vitest
- Frontend-Admin: Unit tests with Vitest + Testing Library
- API Mocking: MSW (Mock Service Worker)

## Component References

- [Backend Agent](./backend/Agent.md)
- [Frontend Agent](./frontend/Agent.md)
- [Frontend-Admin Agent](./frontend-admin/Agent.md)
- [Protobuf Agent](./protobuf/Agent.md)
- [Sequelize Agent](./sequelize/Agent.md)
