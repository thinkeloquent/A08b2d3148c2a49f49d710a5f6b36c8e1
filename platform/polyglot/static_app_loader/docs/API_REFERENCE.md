# Static App Loader API Reference

## Core Components

### StaticLoaderOptions

Configuration options for registering a static app.

**TypeScript**
```typescript
interface StaticLoaderOptions {
  appName: string;           // Required: unique app identifier
  rootPath: string;          // Required: absolute path to frontend dist/
  templateEngine?: 'mustache' | 'liquid' | 'edge' | 'none';  // Default: 'none'
  urlPrefix?: string;        // Default: '/assets'
  defaultContext?: Record<string, unknown>;  // Default: {}
  spaMode?: boolean;         // Default: true
  maxAge?: number;           // Default: 86400 (seconds)
  logger?: ILogger;          // Default: null (use built-in)
}
```

**Python**
```python
class StaticLoaderOptions(BaseModel):
    app_name: str            # Required: unique app identifier
    root_path: str           # Required: absolute path to frontend dist/
    template_engine: Literal['mustache', 'liquid', 'edge', 'none'] = 'none'
    url_prefix: str = '/assets'
    default_context: Dict[str, Any] = {}
    spa_mode: bool = True
    max_age: int = 86400     # seconds
    logger: Optional[ILogger] = None
```

### ILogger

Logger interface for structured logging.

**TypeScript**
```typescript
interface ILogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  trace(message: string, context?: Record<string, unknown>): void;
}
```

**Python**
```python
class ILogger(Protocol):
    def info(self, message: str, context: Optional[Dict[str, Any]] = None) -> None: ...
    def warn(self, message: str, context: Optional[Dict[str, Any]] = None) -> None: ...
    def error(self, message: str, context: Optional[Dict[str, Any]] = None) -> None: ...
    def debug(self, message: str, context: Optional[Dict[str, Any]] = None) -> None: ...
    def trace(self, message: str, context: Optional[Dict[str, Any]] = None) -> None: ...
```

### RegisterResult

Result of a single app registration.

**TypeScript**
```typescript
interface RegisterResult {
  appName: string;       // App name that was registered
  success: boolean;      // Whether registration succeeded
  error?: string;        // Error message if failed
  routePrefix: string;   // Route prefix for the app
  rootPath: string;      // Absolute path to root directory
}
```

**Python**
```python
class RegisterResult(BaseModel):
    app_name: str
    success: bool
    error: Optional[str] = None
    route_prefix: str
    root_path: str
```

### MultiAppOptions

Options for registering multiple static apps.

**TypeScript**
```typescript
interface MultiAppOptions {
  apps: StaticLoaderOptions[];
  collisionStrategy?: 'error' | 'warn' | 'skip';  // Default: 'error'
  logger?: ILogger;
}
```

**Python**
```python
class MultiAppOptions(BaseModel):
    apps: List[StaticLoaderOptions]
    collision_strategy: Literal['error', 'warn', 'skip'] = 'error'
    logger: Optional[ILogger] = None
```

## SDK

### Builder Pattern

**TypeScript**
```typescript
import { createStaticAppLoader } from 'static-app-loader';

const config = createStaticAppLoader()
  .appName('dashboard')
  .rootPath('/var/www/dist')
  .spaMode(true)
  .templateEngine('none')
  .build();

await app.register(staticAppLoader, config);
```

**Python**
```python
from static_app_loader import create_static_app_loader, register_static_app

config = (
    create_static_app_loader()
    .app_name('dashboard')
    .root_path('/var/www/dist')
    .spa_mode(True)
    .template_engine('none')
    .build()
)

register_static_app(app, config)
```

### Multi-App Builder

**TypeScript**
```typescript
import { createMultiAppLoader } from 'static-app-loader';

const results = await createMultiAppLoader()
  .addApp(b => b.appName('dashboard').rootPath('/path/to/dashboard'))
  .addApp(b => b.appName('admin').rootPath('/path/to/admin'))
  .onCollision('warn')
  .register(fastify);
```

**Python**
```python
from static_app_loader import create_multi_app_loader

results = (
    create_multi_app_loader()
    .add_app(lambda b: b.app_name('dashboard').root_path('/path/to/dashboard'))
    .add_app(lambda b: b.app_name('admin').root_path('/path/to/admin'))
    .on_collision('warn')
    .register(app)
)
```

### SDK Operations

- `createStaticAppLoader()` / `create_static_app_loader()`: Create a builder for single app configuration
- `createMultiAppLoader()` / `create_multi_app_loader()`: Create a builder for multi-app registration
- `validateConfig(config)` / `validate_config(config)`: Validate configuration without registering
- `registerStaticApp(app, options)` / `register_static_app(app, options)`: Register a single app
- `registerMultipleApps(app, options)` / `register_multiple_apps(app, options)`: Register multiple apps

## Errors

### StaticPathNotFoundError

Thrown when the static root directory does not exist.

**TypeScript**
```typescript
class StaticPathNotFoundError extends StaticAppLoaderError {
  code = 'STATIC_PATH_NOT_FOUND';
  path: string;
}
```

**Python**
```python
class StaticPathNotFoundError(StaticAppLoaderError):
    code = "STATIC_PATH_NOT_FOUND"
    path: str
```

### RouteCollisionError

Thrown when route prefix collision is detected.

**TypeScript**
```typescript
class RouteCollisionError extends StaticAppLoaderError {
  code = 'ROUTE_COLLISION';
  routePrefix: string;
  conflictingApps: string[];
}
```

**Python**
```python
class RouteCollisionError(StaticAppLoaderError):
    code = "ROUTE_COLLISION"
    route_prefix: str
    conflicting_apps: List[str]
```

### UnsupportedTemplateEngineError

Thrown when an unsupported template engine is specified.

### ConfigValidationError

Thrown when configuration validation fails.

### IndexNotFoundError

Thrown when index.html is not found in the root path (SPA mode).

## Utilities

### Path Rewriting

**TypeScript**
```typescript
import { rewriteHtmlPaths } from 'static-app-loader';

const rewritten = rewriteHtmlPaths(html, {
  appName: 'dashboard',
  urlPrefix: '/assets'
});
```

**Python**
```python
from static_app_loader import rewrite_html_paths, PathRewriteOptions

options = PathRewriteOptions(app_name='dashboard', url_prefix='/assets')
rewritten = rewrite_html_paths(html, options)
```

### Logger Factory

**TypeScript**
```typescript
import { logger } from 'static-app-loader';

const log = logger.create('my-package', 'my-file.ts');
log.info('Hello world');
// Output: [my-package:my-file.ts] INFO: Hello world
```

**Python**
```python
from static_app_loader import logger

log = logger.create('my-package', 'my_file.py')
log.info('Hello world')
# Output: [my-package:my_file.py] INFO: Hello world
```

### Template Rendering

**TypeScript**
```typescript
import { injectInitialState } from 'static-app-loader';

const html = injectInitialState(originalHtml, { user: 'test' });
// Injects: <script>window.INITIAL_STATE={"user":"test"};</script>
```

**Python**
```python
from static_app_loader import inject_initial_state

html = inject_initial_state(original_html, {'user': 'test'})
# Injects: <script>window.INITIAL_STATE={"user":"test"};</script>
```
