# Server Integration Guide for Static App Loader

This guide covers framework-specific integration patterns for Fastify (Node.js) and FastAPI (Python).

## Fastify Integration (Node.js)

The integration uses `staticAppLoader` as a Fastify plugin, registered during the application startup phase.

### Pattern: Fastify Plugin

```typescript
import Fastify from 'fastify';
import { staticAppLoader, createMultiAppLoader, logger } from 'static-app-loader';

// Create logger
const log = logger.create('my-server', 'app.ts');

// Create Fastify instance
const server = Fastify({ logger: true });

// Register static apps
await server.register(staticAppLoader, {
  appName: 'dashboard',
  rootPath: '/var/www/dashboard/dist',
  spaMode: true,
  urlPrefix: '/assets',
  defaultContext: {
    appVersion: process.env.APP_VERSION,
    apiBase: '/api',
  },
});

// Or use multi-app registration
const results = await createMultiAppLoader()
  .addApp(b => b.appName('portal').rootPath('/var/www/portal/dist'))
  .addApp(b => b.appName('admin').rootPath('/var/www/admin/dist'))
  .onCollision('warn')
  .logger(log)
  .register(server);

// Add API routes
server.get('/api/health', async () => ({ status: 'ok' }));

// Start server
await server.listen({ port: 3000 });
```

### Usage with Existing Plugins

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { staticAppLoader } from 'static-app-loader';

const server = Fastify();

// Register other plugins first
await server.register(cors, { origin: true });

// Then register static apps
await server.register(staticAppLoader, {
  appName: 'app',
  rootPath: './dist',
});

await server.ready();
```

### Route Priority

Static app routes are registered with specific prefixes to avoid conflicts:

1. API routes (`/api/*`) - Defined before static apps
2. Static assets (`/{appName}/assets/*`) - Direct file serving
3. SPA catch-all (`/{appName}/*`) - Returns index.html

```typescript
// API routes take priority
server.get('/api/users', async () => ({ users: [] }));

// Static app at /dashboard
await server.register(staticAppLoader, {
  appName: 'dashboard',
  rootPath: './dashboard/dist',
});

// Requests:
// GET /api/users        → API handler
// GET /dashboard        → index.html
// GET /dashboard/users  → index.html (SPA)
// GET /dashboard/assets/app.js → static file
```

## FastAPI Integration (Python)

The integration uses the `lifespan` context manager for initialization and cleanup.

### Pattern: Lifespan Context Manager

```python
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from static_app_loader import (
    register_static_app,
    register_multiple_apps,
    StaticLoaderOptions,
    MultiAppOptions,
    logger,
    reset_registered_prefixes,
)

log = logger.create('my-server', 'main.py')


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler."""
    log.info('Starting server')

    # Reset for hot-reload support
    reset_registered_prefixes()

    # Register static apps
    options = MultiAppOptions(
        apps=[
            StaticLoaderOptions(
                app_name='dashboard',
                root_path='/var/www/dashboard/dist',
                spa_mode=True,
                default_context={'api_base': '/api'},
            ),
            StaticLoaderOptions(
                app_name='admin',
                root_path='/var/www/admin/dist',
                spa_mode=True,
            ),
        ],
        collision_strategy='warn',
        logger=log,
    )

    results = register_multiple_apps(app, options)

    for r in results:
        if r.success:
            log.info(f"Registered: {r.app_name} at {r.route_prefix}")
        else:
            log.error(f"Failed: {r.app_name} - {r.error}")

    log.info('Server ready')
    yield
    log.info('Shutting down')


app = FastAPI(lifespan=lifespan)


@app.get('/api/health')
async def health():
    return {'status': 'ok'}
```

### Pattern: Dependency Injection

For more complex scenarios, use FastAPI's dependency injection:

```python
from fastapi import FastAPI, Depends, Request
from typing import Annotated
from static_app_loader import StaticLoaderOptions, get_registered_prefixes


def get_app_config(request: Request) -> dict:
    """Dependency to get static app configuration."""
    prefixes = get_registered_prefixes()
    return {
        'registered_apps': list(prefixes.keys()),
        'base_url': str(request.base_url),
    }


AppConfig = Annotated[dict, Depends(get_app_config)]


@app.get('/api/config')
async def get_config(config: AppConfig):
    return config
```

### Route Priority

FastAPI routes are matched in order of specificity:

1. Exact path matches (`/api/health`)
2. Path parameter routes (`/api/users/{id}`)
3. Static file mounts (`/{app_name}/assets/`)
4. SPA catch-all (`/{app_name}/{path:path}`)

```python
# API routes
@app.get('/api/users')
async def get_users():
    return {'users': []}

# Static app at /dashboard
register_static_app(app, StaticLoaderOptions(
    app_name='dashboard',
    root_path='./dashboard/dist',
))

# Requests:
# GET /api/users             → API handler
# GET /dashboard             → index.html
# GET /dashboard/users       → index.html (SPA)
# GET /dashboard/assets/app.js → static file
```

## Common Patterns

### Environment-Based Configuration

**Node.js**
```typescript
const config = createStaticAppLoader()
  .appName(process.env.APP_NAME || 'app')
  .rootPath(process.env.STATIC_ROOT || './dist')
  .spaMode(process.env.SPA_MODE !== 'false')
  .maxAge(process.env.NODE_ENV === 'production' ? 86400 : 0)
  .build();
```

**Python**
```python
import os

config = (
    create_static_app_loader()
    .app_name(os.getenv('APP_NAME', 'app'))
    .root_path(os.getenv('STATIC_ROOT', './dist'))
    .spa_mode(os.getenv('SPA_MODE', 'true').lower() != 'false')
    .max_age(86400 if os.getenv('PYTHON_ENV') == 'production' else 0)
    .build()
)
```

### Custom Logger Integration

**Node.js (with Pino)**
```typescript
import pino from 'pino';

const pinoLogger = pino();

const customLogger = {
  info: (msg, ctx) => pinoLogger.info(ctx, msg),
  warn: (msg, ctx) => pinoLogger.warn(ctx, msg),
  error: (msg, ctx) => pinoLogger.error(ctx, msg),
  debug: (msg, ctx) => pinoLogger.debug(ctx, msg),
  trace: (msg, ctx) => pinoLogger.trace(ctx, msg),
};

await server.register(staticAppLoader, {
  ...config,
  logger: customLogger,
});
```

**Python (with structlog)**
```python
import structlog

structlog_logger = structlog.get_logger()

class StructlogAdapter:
    def info(self, msg, ctx=None):
        structlog_logger.info(msg, **(ctx or {}))
    def warn(self, msg, ctx=None):
        structlog_logger.warning(msg, **(ctx or {}))
    def error(self, msg, ctx=None):
        structlog_logger.error(msg, **(ctx or {}))
    def debug(self, msg, ctx=None):
        structlog_logger.debug(msg, **(ctx or {}))
    def trace(self, msg, ctx=None):
        structlog_logger.debug(msg, level='trace', **(ctx or {}))

register_static_app(app, StaticLoaderOptions(
    **config.model_dump(),
    logger=StructlogAdapter(),
))
```

### Health Check with App Status

**Node.js**
```typescript
import { getRegisteredPrefixes } from 'static-app-loader';

server.get('/health', async () => {
  const prefixes = getRegisteredPrefixes();
  return {
    status: 'ok',
    staticApps: Array.from(prefixes.entries()).map(([prefix, name]) => ({
      name,
      prefix,
    })),
  };
});
```

**Python**
```python
from static_app_loader import get_registered_prefixes

@app.get('/health')
async def health():
    prefixes = get_registered_prefixes()
    return {
        'status': 'ok',
        'static_apps': [
            {'name': name, 'prefix': prefix}
            for prefix, name in prefixes.items()
        ],
    }
```
