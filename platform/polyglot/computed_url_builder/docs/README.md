# Computed URL Builder

A polyglot utility for building integration endpoint URLs from configurations with support for computed values.

Available for:
- **Python** (FastAPI integration)
- **Node.js** (Fastify integration)

## Features

- Build URLs from static or computed configurations
- Support for string URLs, URL arrays, or functions that compute URLs
- Pass context to functions for dynamic URL generation
- Defensive programming with extensive logging
- Zero runtime dependencies
- Framework integrations (FastAPI, Fastify)

## Common Interface

Both Python and Node.js implementations share the same interface:

| Operation | Python | Node.js |
|-----------|--------|---------|
| Create Builder | `create_url_builder(url_keys, base_path)` | `createUrlBuilder(urlKeys, basePath)` |
| Build URL | `builder.build(key, context)` | `builder.build(key, context)` |
| From Context | `UrlBuilder.from_context(url_keys)` | `createUrlBuilder.fromContext(urlKeys)` |
| Serialize | `builder.to_dict()` | `builder.toJSON()` |

## URL Configuration

### String URLs

When using string URLs, the `basePath` is appended:

```
config: { dev: 'https://dev.api.com' }, basePath: '/v1'
result: 'https://dev.api.com/v1'
```

### Array URLs

When using array URLs, elements are joined (basePath is ignored):

```
config: { dev: ['https://dev.api.com', '/v2/special'] }
result: 'https://dev.api.com/v2/special'
```

### Function URLs (Computed)

When using functions, the function receives context and returns the URL:

```
config: { dev: (ctx) => `https://${ctx.tenant}.api.com` }, basePath: '/v1'
builder.build('dev', { tenant: 'acme' })
result: 'https://acme.api.com/v1'
```

## Quick Start

### Python

```python
from computed_url_builder import create_url_builder

# Static URLs
builder = create_url_builder(
    {'dev': 'https://dev.api.com', 'prod': 'https://api.com'},
    '/api/v1'
)
url = builder.build('dev')  # https://dev.api.com/api/v1

# Computed URLs with context
builder = create_url_builder({
    'dev': lambda ctx: f"https://{ctx['tenant']}.dev.api.com",
    'prod': 'https://api.com'
}, '/api/v1')
url = builder.build('dev', {'tenant': 'acme'})  # https://acme.dev.api.com/api/v1
```

### Node.js

```javascript
import createUrlBuilder from '@thinkeloquent/computed-url-builder';

// Static URLs
const builder = createUrlBuilder(
  { dev: 'https://dev.api.com', prod: 'https://api.com' },
  '/api/v1'
);
const url = builder.build('dev');  // https://dev.api.com/api/v1

// Computed URLs with context
const dynamicBuilder = createUrlBuilder({
  dev: (ctx) => `https://${ctx.tenant}.dev.api.com`,
  prod: 'https://api.com'
}, '/api/v1');
const url = dynamicBuilder.build('dev', { tenant: 'acme' });  // https://acme.dev.api.com/api/v1
```

## From Context

Create builders using the `fromContext` factory method:

```python
# Python
from computed_url_builder import UrlBuilder

builder = UrlBuilder.from_context({
    'dev': lambda ctx: f"https://{ctx['region']}.api.com",
    'prod': 'https://api.com'
})
```

```javascript
// Node.js
const builder = createUrlBuilder.fromContext({
  dev: (ctx) => `https://${ctx.region}.api.com`,
  prod: 'https://api.com'
});
```

## Logging

Both implementations support defensive programming with extensive logging:

```python
# Python
from computed_url_builder import create_url_builder, create_logger

logger = create_logger('my-app', __file__)
builder = create_url_builder(url_keys, base_path, logger=logger)
```

```javascript
// Node.js
import createUrlBuilder, { createLogger } from '@thinkeloquent/computed-url-builder';

const logger = createLogger('my-app', import.meta.url);
const builder = createUrlBuilder(urlKeys, basePath, { logger });
```

## License

ISC
