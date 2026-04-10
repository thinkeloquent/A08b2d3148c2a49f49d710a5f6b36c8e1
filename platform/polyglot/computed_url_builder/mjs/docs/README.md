# Computed URL Builder (Node.js)

A lightweight utility for building integration endpoint URLs from configurations with support for computed values.

## Installation

```bash
npm install @thinkeloquent/computed-url-builder
```

## Quick Start

```javascript
import createUrlBuilder from '@thinkeloquent/computed-url-builder';

// Create a builder with static URLs
const builder = createUrlBuilder(
  {
    dev: 'https://dev.api.example.com',
    prod: 'https://api.example.com'
  },
  '/api/v1'
);
console.log(builder.build('dev'));  // https://dev.api.example.com/api/v1

// Create a builder with computed URLs
const dynamicBuilder = createUrlBuilder(
  {
    dev: (ctx) => `https://${ctx.tenant}.dev.api.com`,
    prod: 'https://api.example.com'
  },
  '/api/v1'
);
console.log(dynamicBuilder.build('dev', { tenant: 'acme' }));  // https://acme.dev.api.com/api/v1
```

## Context-Based Configuration

```javascript
const builder = createUrlBuilder.fromContext({
  dev: (ctx) => `https://${ctx.region}.dev.api.com`,
  prod: 'https://api.com'
});
console.log(builder.build('dev', { region: 'us-west' }));  // https://us-west.dev.api.com
```

## Fastify Integration

```javascript
import Fastify from 'fastify';
import urlBuilderPlugin from '@thinkeloquent/computed-url-builder/fastify';

const fastify = Fastify();

await fastify.register(urlBuilderPlugin, {
  fromEnv: true,
  envPrefix: 'URL_BUILDER_'
});

fastify.get('/', async (request, reply) => {
  const url = fastify.urlBuilder.build('dev');
  // ... use url
});
```

## API Reference

### `createUrlBuilder(urlKeys, basePath, options)`

Factory function to create a URL builder instance.

- `urlKeys`: Object mapping environment names to:
  - strings (host URL)
  - arrays of strings (URL parts to join)
  - functions that take context object and return a string
- `basePath`: Base path appended to string/function URLs (default: '')
- `options.logger`: Optional custom logger instance

### `builder.build(key, context = {})`

Build a URL for the specified environment key.

- `key`: Environment key (e.g., 'dev', 'prod')
- `context`: Optional object passed to function-based URL values

### `builder.toJSON()`

Serialize builder state to object.

### `createUrlBuilder.fromContext(urlKeys, basePath, options)`

Create a builder from a context object with URL configurations.

## TypeScript Support

TypeScript declarations are included. Import types:

```typescript
import createUrlBuilder, { UrlKeys, UrlBuilder } from '@thinkeloquent/computed-url-builder';
```

## Requirements

- Node.js >= 20.0.0
- No runtime dependencies (zero deps)
- Optional: Fastify ^4.0.0
