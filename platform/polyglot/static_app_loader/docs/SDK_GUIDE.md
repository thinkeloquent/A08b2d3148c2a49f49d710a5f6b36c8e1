# Static App Loader SDK Guide

The Static App Loader SDK provides a high-level API for CLI tools, LLM Agents, and Developer Tools to configure and manage static frontend app serving in Fastify and FastAPI applications.

## Usage

### Node.js

```typescript
import { createStaticAppLoader, registerStaticApp, validateConfig } from 'static-app-loader';
import Fastify from 'fastify';

// Initialize SDK with builder pattern
const config = createStaticAppLoader()
  .appName('dashboard')
  .rootPath('/var/www/dashboard/dist')
  .spaMode(true)
  .urlPrefix('/assets')
  .defaultContext({ version: '1.0.0' })
  .maxAge(86400)
  .build();

// Validate before registration (optional)
const validation = validateConfig(config);
if (!validation.success) {
  console.error('Invalid config:', validation.errors);
  process.exit(1);
}

// Register with Fastify
const app = Fastify();
await app.register(staticAppLoader, config);
await app.listen({ port: 3000 });
```

### Python

```python
from fastapi import FastAPI
from static_app_loader import create_static_app_loader, register_static_app, validate_config

# Initialize SDK with builder pattern
config = (
    create_static_app_loader()
    .app_name('dashboard')
    .root_path('/var/www/dashboard/dist')
    .spa_mode(True)
    .url_prefix('/assets')
    .default_context({'version': '1.0.0'})
    .max_age(86400)
    .build()
)

# Validate before registration (optional)
validation = validate_config(config.model_dump())
if not validation['success']:
    print(f"Invalid config: {validation['errors']}")
    exit(1)

# Register with FastAPI
app = FastAPI()
register_static_app(app, config)
```

## Multi-App Registration

Register multiple apps in a single operation with collision detection.

### Node.js

```typescript
import { createMultiAppLoader } from 'static-app-loader';

const results = await createMultiAppLoader()
  .addApp(b => b
    .appName('dashboard')
    .rootPath('/var/www/dashboard/dist')
    .spaMode(true)
  )
  .addApp(b => b
    .appName('admin')
    .rootPath('/var/www/admin/dist')
    .spaMode(true)
  )
  .addApp(b => b
    .appName('docs')
    .rootPath('/var/www/docs/dist')
    .spaMode(false)
  )
  .onCollision('warn')  // 'error' | 'warn' | 'skip'
  .register(fastify);

// Check results
results.forEach(r => {
  if (r.success) {
    console.log(`✓ ${r.appName} registered at ${r.routePrefix}`);
  } else {
    console.error(`✗ ${r.appName} failed: ${r.error}`);
  }
});
```

### Python

```python
from static_app_loader import create_multi_app_loader

results = (
    create_multi_app_loader()
    .add_app(lambda b: b
        .app_name('dashboard')
        .root_path('/var/www/dashboard/dist')
        .spa_mode(True)
    )
    .add_app(lambda b: b
        .app_name('admin')
        .root_path('/var/www/admin/dist')
        .spa_mode(True)
    )
    .add_app(lambda b: b
        .app_name('docs')
        .root_path('/var/www/docs/dist')
        .spa_mode(False)
    )
    .on_collision('warn')  # 'error' | 'warn' | 'skip'
    .register(app)
)

# Check results
for r in results:
    if r.success:
        print(f"✓ {r.app_name} registered at {r.route_prefix}")
    else:
        print(f"✗ {r.app_name} failed: {r.error}")
```

## Configuration Validation

Validate configurations without registering, useful for CLI tools and pre-deployment checks.

### Node.js

```typescript
import { validateConfig } from 'static-app-loader';

const result = validateConfig({
  appName: 'myapp',
  rootPath: '/var/www/myapp/dist',
});

if (result.success) {
  console.log('Valid configuration');
  console.log('Defaults applied:', result.data);
} else {
  console.error('Validation errors:', result.errors);
}
```

### Python

```python
from static_app_loader import validate_config

result = validate_config({
    'app_name': 'myapp',
    'root_path': '/var/www/myapp/dist',
})

if result['success']:
    print('Valid configuration')
    print(f"Defaults applied: {result['data']}")
else:
    print(f"Validation errors: {result['errors']}")
```

## Features

- **Configuration Operations**: `createStaticAppLoader`, `createMultiAppLoader`, `validateConfig`
- **Registration Operations**: `registerStaticApp`, `registerMultipleApps`
- **Collision Handling**: `error` (throw), `warn` (log and continue), `skip` (skip duplicates)
- **Path Rewriting**: Automatic asset path transformation for route prefixes
- **Template Engines**: Mustache, Liquid, Edge (Node.js) / Jinja2 (Python)
- **SSR Support**: Inject initial state via `window.INITIAL_STATE`
- **Logging**: Structured logging with custom logger support

## CLI Usage

### Python CLI

```bash
# Validate a configuration file
python -m static_app_loader validate --config ./config.yaml

# JSON output for scripting
python -m static_app_loader validate --config ./config.json --json
```

## Error Handling

```typescript
// Node.js
import {
  StaticPathNotFoundError,
  RouteCollisionError,
  ConfigValidationError
} from 'static-app-loader';

try {
  await app.register(staticAppLoader, config);
} catch (err) {
  if (err instanceof StaticPathNotFoundError) {
    console.error(`Path not found: ${err.path}`);
  } else if (err instanceof RouteCollisionError) {
    console.error(`Collision: ${err.conflictingApps.join(', ')}`);
  } else if (err instanceof ConfigValidationError) {
    console.error(`Invalid config: ${err.validationErrors.join('\n')}`);
  }
}
```

```python
# Python
from static_app_loader import (
    StaticPathNotFoundError,
    RouteCollisionError,
    ConfigValidationError,
)

try:
    register_static_app(app, config)
except StaticPathNotFoundError as e:
    print(f"Path not found: {e.path}")
except RouteCollisionError as e:
    print(f"Collision: {', '.join(e.conflicting_apps)}")
except ConfigValidationError as e:
    print(f"Invalid config: {chr(10).join(e.validation_errors)}")
```
