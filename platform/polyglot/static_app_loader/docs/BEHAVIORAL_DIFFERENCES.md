# Behavioral Differences

This document outlines intentional differences between the Node.js and Python implementations of the static-app-loader package.

## 1. Naming Conventions

Configuration properties follow language-idiomatic naming conventions.

| Language | Property Style | Example |
|----------|---------------|---------|
| **Node.js** | camelCase | `appName`, `rootPath`, `spaMode` |
| **Python** | snake_case | `app_name`, `root_path`, `spa_mode` |

**Reasoning**: Following each language's conventions makes the API feel native to developers. TypeScript/JavaScript universally uses camelCase for properties, while Python's PEP 8 specifies snake_case.

## 2. Plugin Registration Pattern

| Language | Pattern | Signature |
|----------|---------|-----------|
| **Node.js** | Fastify Plugin | `fastify.register(staticAppLoader, options)` |
| **Python** | Function Call | `register_static_app(app, options)` |

**Reasoning**: Fastify uses a plugin system where modules are registered via `fastify.register()`. FastAPI doesn't have a plugin system, so we use direct function calls that mount routes and static files on the app instance.

## 3. Async vs Sync Registration

| Language | Registration | Handler |
|----------|-------------|---------|
| **Node.js** | Async (Promise) | Async route handlers |
| **Python** | Sync | Async route handlers |

**Reasoning**: Fastify's plugin system is inherently async. Python's `register_static_app` performs sync operations (mounting routes), but the route handlers themselves are async for I/O operations.

## 4. Template Engine Mapping

| Engine | Node.js Library | Python Library |
|--------|-----------------|----------------|
| `mustache` | `mustache` | `chevron` |
| `liquid` | `liquidjs` | `python-liquid` |
| `edge` | `edge.js` | `jinja2` (equivalent) |
| `none` | No rendering | No rendering |

**Reasoning**: Each platform uses the most established library for that template engine. Edge.js is Node.js-specific, so Python uses Jinja2 as a functionally equivalent template engine.

## 5. Static File Serving

| Language | Library | Configuration |
|----------|---------|---------------|
| **Node.js** | `@fastify/static` | Automatic MIME types, `maxAge` in ms |
| **Python** | `starlette.staticfiles` | Built into FastAPI, `maxAge` not directly supported |

**Reasoning**: Each framework has its preferred static file serving solution. Fastify uses `@fastify/static` plugin, while FastAPI uses Starlette's built-in `StaticFiles` mount.

## 6. Error Class Naming

| Language | Base Class | Specific Errors |
|----------|------------|-----------------|
| **Node.js** | `StaticAppLoaderError` | `StaticPathNotFoundError`, `RouteCollisionError` |
| **Python** | `StaticAppLoaderError` | `StaticPathNotFoundError`, `RouteCollisionError` |

**Reasoning**: Error class names are kept identical across both languages for consistency. This makes it easier to write documentation and understand error handling across platforms.

## 7. Builder Method Naming

| Concept | Node.js | Python |
|---------|---------|--------|
| Set app name | `.appName()` | `.app_name()` |
| Set root path | `.rootPath()` | `.root_path()` |
| Set SPA mode | `.spaMode()` | `.spa_mode()` |
| Set max age | `.maxAge()` | `.max_age()` |
| Set collision | `.onCollision()` | `.on_collision()` |

**Reasoning**: Builder methods follow the same naming conventions as configuration properties. This maintains consistency within each language's API.

## 8. Serialization Format

| Context | Node.js | Python |
|---------|---------|--------|
| Config export | camelCase JSON | snake_case dict |
| CLI output | camelCase JSON | snake_case JSON |
| Initial state | camelCase JSON | camelCase JSON |

**Reasoning**: Internal serialization follows language conventions. However, `window.INITIAL_STATE` is serialized to camelCase JSON in both languages since it's consumed by JavaScript in the browser.

## 9. Cache TTL Units

| Language | Path Rewriter Cache TTL | Static File maxAge |
|----------|------------------------|-------------------|
| **Node.js** | Milliseconds | Seconds (converted to ms internally) |
| **Python** | Seconds | Seconds |

**Reasoning**: Node.js typically uses milliseconds for time intervals (like `setTimeout`), while Python uses seconds. The `maxAge` configuration accepts seconds in both for user convenience.

## 10. Logger Output

| Language | Format | Stream |
|----------|--------|--------|
| **Node.js** | `[pkg:file] LEVEL: msg {context}` | `console.log/error` |
| **Python** | `[pkg:file] LEVEL: msg {context}` | `print/sys.stderr` |

**Reasoning**: Both use identical output formats for consistency. The underlying mechanism differs (`console` vs `print`) but the output is visually identical.
