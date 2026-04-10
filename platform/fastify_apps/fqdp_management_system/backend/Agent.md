# Fqdp Management System Backend

## Overview

Fastify-based REST API server providing CRUD operations and business logic.

## Technology Stack

- **Framework**: Fastify
- **Language**: JavaScript (ESM)
- **Plugins**: @fastify/sensible, @fastify/static
- **Serialization**: Protocol Buffers (protobufjs)
- **Logging**: Pino

## Directory Structure

```
backend/
├── src/
│   ├── index.mjs              # Application entry point
│   ├── plugins/               # Fastify plugins
│   │   ├── content-negotiation.mjs
│   │   └── database.mjs
│   ├── routes/                # API route handlers
│   │   ├── index.mjs
│   │   ├── repositories.mjs
│   │   ├── tags.mjs
│   │   └── metadata.mjs
│   ├── services/              # Business logic layer
│   │   ├── repository.service.mjs
│   │   ├── tag.service.mjs
│   │   └── metadata.service.mjs
│   └── serializers/           # Data transformation
│       └── converters.mjs
├── package.json
├── project.json               # NX project configuration
└── server.test.mjs            # Development server
```

## Key Patterns

### Route Registration
Routes are registered as Fastify plugins with prefixes:
```javascript
fastify.register(repositoriesRoutes, { prefix: '/api/repositories' });
```

### Service Layer
Services encapsulate database operations and business logic:
```javascript
// services/repository.service.mjs
export async function findAll(options) { ... }
export async function findById(id) { ... }
export async function create(data) { ... }
export async function update(id, data) { ... }
export async function remove(id) { ... }
```

### Error Handling
Use @fastify/sensible for consistent error responses:
```javascript
if (!entity) {
  throw fastify.httpErrors.notFound('Entity not found');
}
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/repositories | List all repositories |
| GET | /api/repositories/:id | Get repository by ID |
| POST | /api/repositories | Create repository |
| PUT | /api/repositories/:id | Update repository |
| DELETE | /api/repositories/:id | Delete repository |
| GET | /api/tags | List all tags |
| GET | /api/metadata | List all metadata |

## Development

```bash
# Start development server
pnpm run dev

# Run tests
pnpm run test

# Build for production
pnpm run build
```

## Configuration

Environment variables:
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: Database connection string
- `LOG_LEVEL`: Pino log level (default: info)

## Related Components

- Uses types from: `../protobuf`
- Database models from: `../sequelize`
