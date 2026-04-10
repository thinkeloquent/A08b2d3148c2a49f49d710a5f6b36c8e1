# Server Provider Cache - Polyglot Multi-Instance Factory

> **Version**: 1.0.0
> **Package**: `server-provider-cache` (npm) / `server_provider_cache` (pip)
> **Location**: `polyglot/server_provider_cache/`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Installation](#2-installation)
3. [Quick Start](#3-quick-start)
4. [Core Concepts](#4-core-concepts)
5. [API Reference](#5-api-reference)
6. [Server Integration](#6-server-integration)
7. [Real-World Examples](#7-real-world-examples)
8. [Configuration](#8-configuration)
9. [Best Practices](#9-best-practices)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Overview

Server Provider Cache is a polyglot multi-instance cache factory for Node.js and Python applications. It provides:

- **Multi-Instance Factory Pattern**: Create multiple isolated cache instances with independent TTLs
- **Pre-defined Cache Names**: Standardized constants for common cache use cases
- **Read-Through Caching**: `getOrSet` / `get_or_set` for atomic fetch-and-cache operations
- **Framework Integration**: Lifecycle hooks for Fastify and FastAPI
- **Polyglot Parity**: Identical API surface in both Node.js and Python

### Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        CacheFactory                                │
├────────────────────────────────────────────────────────────────────┤
│  Registry: Map<string, ICacheService>                              │
│  ├── 'providers' → CacheService { ttl: 600,  backend: memory }    │
│  ├── 'services'  → CacheService { ttl: 300,  backend: memory }    │
│  ├── 'config'    → CacheService { ttl: 3600, backend: memory }    │
│  ├── 'sessions'  → CacheService { ttl: 1800, backend: memory }    │
│  └── 'tokens'    → CacheService { ttl: 900,  backend: memory }    │
├────────────────────────────────────────────────────────────────────┤
│  create(name, options) → ICacheService                             │
│  get(name) → ICacheService                                         │
│  has(name) → boolean                                               │
│  destroy(name) → void                                              │
│  destroyAll() → void                                               │
└────────────────────────────────────────────────────────────────────┘
```

---

## 2. Installation

### Node.js

```bash
# From the polyglot package (local)
cd polyglot/server_provider_cache/mjs
npm install

# In your project
npm install --save ../polyglot/server_provider_cache/mjs
```

### Python

```bash
# From the polyglot package (local)
cd polyglot/server_provider_cache/py
poetry install

# Or via pip (editable)
pip install -e polyglot/server_provider_cache/py
```

### Development (Both)

```bash
cd polyglot/server_provider_cache
make install      # Install all dependencies
make test         # Run all tests
make test-coverage # Run with coverage
```

---

## 3. Quick Start

### Node.js (ESM)

```javascript
import { createCacheFactory, CacheNames } from 'server-provider-cache';

// Create factory
const factory = createCacheFactory({
    defaults: { backend: 'memory', defaultTtl: 300 }
});

// Create cache instances
factory.create(CacheNames.PROVIDERS, { defaultTtl: 600 });
factory.create(CacheNames.CONFIG, { defaultTtl: 3600 });

// Use the cache
const providers = factory.get(CacheNames.PROVIDERS);

// Basic operations
await providers.set('oauth:google', { token: 'xyz', expires: Date.now() + 3600000 });
const token = await providers.get('oauth:google');
await providers.del('oauth:google');

// Read-through caching
const data = await providers.getOrSet('user:123', async () => {
    return await fetchUserFromDB(123);
}, 600);

// Cleanup
await factory.destroyAll();
```

### Python

```python
import asyncio
from server_provider_cache import create_cache_factory, CacheNames

async def main():
    # Create factory
    factory = create_cache_factory(
        defaults={'backend': 'memory', 'default_ttl': 300}
    )

    # Create cache instances
    factory.create(CacheNames.PROVIDERS, default_ttl=600)
    factory.create(CacheNames.CONFIG, default_ttl=3600)

    # Use the cache
    providers = factory.get(CacheNames.PROVIDERS)

    # Basic operations
    await providers.set('oauth:google', {'token': 'xyz', 'expires': 3600})
    token = await providers.get('oauth:google')
    await providers.delete('oauth:google')

    # Read-through caching
    async def fetch_user():
        return await fetch_user_from_db(123)

    data = await providers.get_or_set('user:123', fetch_user, 600)

    # Cleanup
    await factory.destroy_all()

asyncio.run(main())
```

---

## 4. Core Concepts

### 4.1 CacheNames Constants

Pre-defined cache instance names ensure consistency across your codebase:

| Constant | Value | Suggested TTL | Use Case |
|----------|-------|---------------|----------|
| `CacheNames.PROVIDERS` | `'providers'` | 600s (10 min) | OAuth tokens, API credentials |
| `CacheNames.SERVICES` | `'services'` | 300s (5 min) | Service discovery, health checks |
| `CacheNames.CONFIG` | `'config'` | 3600s (1 hour) | Feature flags, app settings |
| `CacheNames.SESSIONS` | `'sessions'` | 1800s (30 min) | User sessions, auth state |
| `CacheNames.TOKENS` | `'tokens'` | 900s (15 min) | JWT tokens, refresh tokens |

### 4.2 Instance Isolation

Each cache instance is completely isolated:

```javascript
// Node.js
const providers = factory.get(CacheNames.PROVIDERS);
const config = factory.get(CacheNames.CONFIG);

// Same key, different caches - no collision
await providers.set('google', { type: 'oauth', token: 'abc' });
await config.set('google', { enabled: true, clientId: '123' });

console.log(await providers.get('google')); // { type: 'oauth', token: 'abc' }
console.log(await config.get('google'));    // { enabled: true, clientId: '123' }
```

### 4.3 Read-Through Caching

The `getOrSet` pattern provides atomic read-through caching:

```javascript
// On cache MISS: fetchFn is called, result is cached, then returned
// On cache HIT: cached value is returned, fetchFn is NOT called
const user = await cache.getOrSet('user:123', async () => {
    console.log('Fetching from database...'); // Only on cache miss
    return await db.users.findById(123);
}, 600);
```

**Error Handling**: If `fetchFn` throws, the error propagates and nothing is cached:

```javascript
try {
    await cache.getOrSet('flaky:api', async () => {
        throw new Error('Network timeout');
    }, 300);
} catch (err) {
    // Error propagates, value is NOT cached
    // Next call will retry the fetchFn
}
```

### 4.4 TTL (Time-To-Live)

Each cache instance has a default TTL, which can be overridden per-operation:

```javascript
// Create with 5 minute default TTL
const cache = factory.create('my-cache', { defaultTtl: 300 });

// Uses default TTL (300s)
await cache.set('key1', 'value1');

// Override with custom TTL (60s)
await cache.set('key2', 'value2', 60);

// Override in getOrSet
await cache.getOrSet('key3', fetchFn, 120);
```

---

## 5. API Reference

### 5.1 CacheFactory

#### Constructor

```javascript
// Node.js
const factory = createCacheFactory({
    defaults: {
        backend: 'memory',    // 'memory' | 'redis' (redis not yet implemented)
        defaultTtl: 300       // Default TTL in seconds
    }
});
```

```python
# Python
factory = create_cache_factory(
    defaults={
        'backend': 'memory',
        'default_ttl': 300
    }
)
```

#### Methods

| Method | Node.js | Python | Description |
|--------|---------|--------|-------------|
| Create cache | `factory.create(name, opts)` | `factory.create(name, **opts)` | Create new cache instance |
| Get cache | `factory.get(name)` | `factory.get(name)` | Get existing cache (throws if not found) |
| Check exists | `factory.has(name)` | `factory.has(name)` | Check if cache exists |
| Destroy one | `await factory.destroy(name)` | `await factory.destroy(name)` | Destroy specific cache |
| Destroy all | `await factory.destroyAll()` | `await factory.destroy_all()` | Destroy all caches |
| List names | `factory.getNames()` | `factory.get_names()` | Get all cache names |
| Count | `factory.getCount()` | `factory.get_count()` | Get number of caches |

### 5.2 CacheService

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Cache instance name (readonly) |
| `defaultTtl` | `number` | Default TTL in seconds (readonly) |
| `backend` | `string` | Backend type (readonly) |

#### Methods

| Method | Node.js | Python | Description |
|--------|---------|--------|-------------|
| Get | `await cache.get(key)` | `await cache.get(key)` | Get value (undefined/None if not found) |
| Set | `await cache.set(key, value, ttl?)` | `await cache.set(key, value, ttl=None)` | Set value with optional TTL override |
| Delete | `await cache.del(key)` | `await cache.delete(key)` | Delete a key |
| Clear | `await cache.clear()` | `await cache.clear()` | Clear all keys |
| Keys | `await cache.keys()` | `await cache.keys()` | Get all keys |
| Size | `await cache.size()` | `await cache.size()` | Get entry count |
| Get or Set | `await cache.getOrSet(key, fn, ttl?)` | `await cache.get_or_set(key, fn, ttl=None)` | Read-through cache |
| Destroy | `await cache.destroy()` | `await cache.destroy()` | Cleanup resources |

---

## 6. Server Integration

### 6.1 Fastify Integration

The cache service is available via lifecycle hook at `fastify_server/config/lifecycle/20-cache-service.mjs`.

#### Automatic Setup

The lifecycle hook automatically:
1. Creates a `CacheFactory` with configuration from app config or environment
2. Creates all 5 default cache instances (providers, services, config, sessions, tokens)
3. Decorates `server.cache` with the factory
4. Decorates `server.CacheNames` with the constants
5. Registers cleanup on server close

#### Usage in Routes

```javascript
// routes/providers.mjs
export default async function providerRoutes(fastify, options) {

    // GET /providers/:id - with read-through caching
    fastify.get('/providers/:id', async (request, reply) => {
        const { id } = request.params;
        const providers = request.server.cache.get(request.server.CacheNames.PROVIDERS);

        const provider = await providers.getOrSet(
            `provider:${id}`,
            async () => {
                // This only runs on cache miss
                return await fetchProviderFromDatabase(id);
            },
            600 // 10 minute TTL
        );

        return provider;
    });

    // POST /providers/:id/invalidate - cache invalidation
    fastify.post('/providers/:id/invalidate', async (request, reply) => {
        const { id } = request.params;
        const providers = request.server.cache.get(request.server.CacheNames.PROVIDERS);

        await providers.del(`provider:${id}`);

        return { success: true, message: `Cache invalidated for provider ${id}` };
    });

    // GET /cache/stats - cache statistics
    fastify.get('/cache/stats', async (request, reply) => {
        const factory = request.server.cache;
        const stats = {};

        for (const name of factory.getNames()) {
            const cache = factory.get(name);
            stats[name] = {
                size: await cache.size(),
                keys: await cache.keys(),
                defaultTtl: cache.defaultTtl
            };
        }

        return stats;
    });
}
```

#### Plugin Pattern

```javascript
// plugins/cache-helpers.mjs
import fp from 'fastify-plugin';

async function cacheHelpers(fastify, options) {
    // Add helper to get specific cache
    fastify.decorate('getCache', (name) => {
        return fastify.cache.get(name);
    });

    // Add helper for provider cache specifically
    fastify.decorate('providerCache', fastify.cache.get(fastify.CacheNames.PROVIDERS));
}

export default fp(cacheHelpers, {
    name: 'cache-helpers',
    dependencies: [] // Loaded after lifecycle hooks
});
```

### 6.2 FastAPI Integration

The cache service is available via lifecycle hook at `fastapi_server/config/lifecycle/20_cache_service.py`.

#### Automatic Setup

The lifecycle hook automatically:
1. Creates a `CacheFactory` with configuration from app config or environment
2. Creates all 5 default cache instances
3. Stores factory in `app.state.cache`
4. Stores `CacheNames` in `app.state.CacheNames`
5. Registers cleanup on shutdown

#### Usage in Routes

```python
# routes/providers.py
from fastapi import APIRouter, Request, HTTPException
from typing import Any

router = APIRouter(prefix="/providers", tags=["providers"])


@router.get("/{provider_id}")
async def get_provider(request: Request, provider_id: str) -> dict[str, Any]:
    """Get provider with read-through caching."""
    providers = request.app.state.cache.get(request.app.state.CacheNames.PROVIDERS)

    async def fetch_provider():
        # This only runs on cache miss
        return await fetch_provider_from_database(provider_id)

    provider = await providers.get_or_set(
        f"provider:{provider_id}",
        fetch_provider,
        600  # 10 minute TTL
    )

    return provider


@router.post("/{provider_id}/invalidate")
async def invalidate_provider(request: Request, provider_id: str) -> dict[str, Any]:
    """Invalidate provider cache."""
    providers = request.app.state.cache.get(request.app.state.CacheNames.PROVIDERS)

    await providers.delete(f"provider:{provider_id}")

    return {"success": True, "message": f"Cache invalidated for provider {provider_id}"}


@router.get("/cache/stats")
async def cache_stats(request: Request) -> dict[str, Any]:
    """Get cache statistics."""
    factory = request.app.state.cache
    stats = {}

    for name in factory.get_names():
        cache = factory.get(name)
        stats[name] = {
            "size": await cache.size(),
            "keys": await cache.keys(),
            "default_ttl": cache.default_ttl
        }

    return stats
```

#### Dependency Injection Pattern

```python
# dependencies/cache.py
from fastapi import Request, Depends
from typing import Annotated
from server_provider_cache import CacheService, CacheNames


def get_cache_factory(request: Request):
    """Get the cache factory from app state."""
    return request.app.state.cache


def get_providers_cache(request: Request) -> CacheService:
    """Get the providers cache instance."""
    return request.app.state.cache.get(CacheNames.PROVIDERS)


def get_config_cache(request: Request) -> CacheService:
    """Get the config cache instance."""
    return request.app.state.cache.get(CacheNames.CONFIG)


def get_sessions_cache(request: Request) -> CacheService:
    """Get the sessions cache instance."""
    return request.app.state.cache.get(CacheNames.SESSIONS)


# Type aliases for dependency injection
ProvidersCache = Annotated[CacheService, Depends(get_providers_cache)]
ConfigCache = Annotated[CacheService, Depends(get_config_cache)]
SessionsCache = Annotated[CacheService, Depends(get_sessions_cache)]
```

```python
# routes/providers.py (using dependencies)
from fastapi import APIRouter
from dependencies.cache import ProvidersCache

router = APIRouter(prefix="/providers", tags=["providers"])


@router.get("/{provider_id}")
async def get_provider(provider_id: str, cache: ProvidersCache) -> dict:
    """Get provider with injected cache dependency."""

    async def fetch_provider():
        return await fetch_provider_from_database(provider_id)

    return await cache.get_or_set(f"provider:{provider_id}", fetch_provider, 600)
```

---

## 7. Real-World Examples

### 7.1 OAuth Token Caching (Node.js)

```javascript
// services/oauth.mjs
import { CacheNames } from 'server-provider-cache';

export class OAuthService {
    #cache;
    #httpClient;

    constructor(cacheFactory, httpClient) {
        this.#cache = cacheFactory.get(CacheNames.PROVIDERS);
        this.#httpClient = httpClient;
    }

    async getAccessToken(provider, clientId, clientSecret) {
        const cacheKey = `oauth:${provider}:${clientId}`;

        return await this.#cache.getOrSet(cacheKey, async () => {
            console.log(`Fetching new token for ${provider}...`);

            const response = await this.#httpClient.post(
                `https://${provider}.com/oauth/token`,
                {
                    grant_type: 'client_credentials',
                    client_id: clientId,
                    client_secret: clientSecret
                }
            );

            return {
                accessToken: response.data.access_token,
                tokenType: response.data.token_type,
                expiresAt: Date.now() + (response.data.expires_in * 1000)
            };
        }, 550); // Cache for slightly less than token expiry (10 min - 50s buffer)
    }

    async invalidateToken(provider, clientId) {
        await this.#cache.del(`oauth:${provider}:${clientId}`);
    }
}
```

### 7.2 Feature Flags (Python)

```python
# services/feature_flags.py
from server_provider_cache import CacheNames, CacheFactory
from typing import Any


class FeatureFlagService:
    def __init__(self, cache_factory: CacheFactory, feature_api_client):
        self._cache = cache_factory.get(CacheNames.CONFIG)
        self._api_client = feature_api_client

    async def is_enabled(self, flag_name: str, user_id: str | None = None) -> bool:
        """Check if a feature flag is enabled."""
        cache_key = f"flag:{flag_name}"
        if user_id:
            cache_key = f"flag:{flag_name}:user:{user_id}"

        async def fetch_flag():
            return await self._api_client.get_flag(flag_name, user_id)

        flag_data = await self._cache.get_or_set(cache_key, fetch_flag, 60)
        return flag_data.get("enabled", False)

    async def get_variant(self, flag_name: str, user_id: str) -> str | None:
        """Get the variant for an A/B test."""
        cache_key = f"variant:{flag_name}:user:{user_id}"

        async def fetch_variant():
            return await self._api_client.get_variant(flag_name, user_id)

        variant_data = await self._cache.get_or_set(cache_key, fetch_variant, 300)
        return variant_data.get("variant")

    async def invalidate_user_flags(self, user_id: str) -> None:
        """Invalidate all cached flags for a user."""
        keys = await self._cache.keys()
        user_keys = [k for k in keys if f":user:{user_id}" in k]
        for key in user_keys:
            await self._cache.delete(key)
```

### 7.3 Service Discovery (Node.js)

```javascript
// services/discovery.mjs
import { CacheNames } from 'server-provider-cache';

export class ServiceDiscovery {
    #cache;
    #consul;

    constructor(cacheFactory, consulClient) {
        this.#cache = cacheFactory.get(CacheNames.SERVICES);
        this.#consul = consulClient;
    }

    async getServiceEndpoint(serviceName) {
        return await this.#cache.getOrSet(
            `service:${serviceName}:endpoint`,
            async () => {
                const services = await this.#consul.catalog.service.nodes(serviceName);
                if (!services.length) {
                    throw new Error(`Service ${serviceName} not found`);
                }

                // Simple round-robin - pick random healthy instance
                const healthy = services.filter(s => s.Status === 'passing');
                const instance = healthy[Math.floor(Math.random() * healthy.length)];

                return {
                    host: instance.ServiceAddress || instance.Address,
                    port: instance.ServicePort,
                    url: `http://${instance.ServiceAddress || instance.Address}:${instance.ServicePort}`
                };
            },
            30 // Short TTL for service discovery
        );
    }

    async getServiceHealth(serviceName) {
        return await this.#cache.getOrSet(
            `service:${serviceName}:health`,
            async () => {
                const health = await this.#consul.health.service(serviceName);
                return {
                    healthy: health.filter(h => h.Checks.every(c => c.Status === 'passing')).length,
                    total: health.length,
                    lastCheck: new Date().toISOString()
                };
            },
            15 // Very short TTL for health checks
        );
    }
}
```

### 7.4 Session Management (Python)

```python
# services/session.py
from server_provider_cache import CacheNames, CacheFactory
from typing import Any
import uuid
import json


class SessionService:
    def __init__(self, cache_factory: CacheFactory):
        self._cache = cache_factory.get(CacheNames.SESSIONS)

    async def create_session(self, user_id: str, metadata: dict[str, Any] | None = None) -> str:
        """Create a new session and return the session ID."""
        session_id = str(uuid.uuid4())

        session_data = {
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }

        await self._cache.set(f"session:{session_id}", session_data, 1800)  # 30 min

        # Also maintain user -> sessions mapping
        user_sessions = await self._cache.get(f"user_sessions:{user_id}") or []
        user_sessions.append(session_id)
        await self._cache.set(f"user_sessions:{user_id}", user_sessions, 1800)

        return session_id

    async def get_session(self, session_id: str) -> dict[str, Any] | None:
        """Get session data by ID."""
        return await self._cache.get(f"session:{session_id}")

    async def refresh_session(self, session_id: str) -> bool:
        """Refresh session TTL (sliding expiration)."""
        session = await self._cache.get(f"session:{session_id}")
        if session:
            await self._cache.set(f"session:{session_id}", session, 1800)
            return True
        return False

    async def destroy_session(self, session_id: str) -> None:
        """Destroy a session."""
        session = await self._cache.get(f"session:{session_id}")
        if session:
            # Remove from user's session list
            user_id = session.get("user_id")
            if user_id:
                user_sessions = await self._cache.get(f"user_sessions:{user_id}") or []
                user_sessions = [s for s in user_sessions if s != session_id]
                await self._cache.set(f"user_sessions:{user_id}", user_sessions, 1800)

            await self._cache.delete(f"session:{session_id}")

    async def destroy_all_user_sessions(self, user_id: str) -> int:
        """Destroy all sessions for a user."""
        user_sessions = await self._cache.get(f"user_sessions:{user_id}") or []

        for session_id in user_sessions:
            await self._cache.delete(f"session:{session_id}")

        await self._cache.delete(f"user_sessions:{user_id}")

        return len(user_sessions)
```

### 7.5 API Response Caching (Node.js)

```javascript
// middleware/cache.mjs
export function cacheMiddleware(cacheFactory, options = {}) {
    const {
        cacheName = 'config',
        ttl = 60,
        keyGenerator = (req) => `api:${req.method}:${req.url}`,
        condition = (req) => req.method === 'GET'
    } = options;

    const cache = cacheFactory.get(cacheName);

    return async function(request, reply) {
        if (!condition(request)) {
            return; // Skip caching for this request
        }

        const cacheKey = keyGenerator(request);
        const cached = await cache.get(cacheKey);

        if (cached) {
            reply.header('X-Cache', 'HIT');
            reply.header('X-Cache-Key', cacheKey);
            return reply.send(cached);
        }

        // Store original send
        const originalSend = reply.send.bind(reply);

        // Intercept response
        reply.send = async function(payload) {
            // Only cache successful responses
            if (reply.statusCode >= 200 && reply.statusCode < 300) {
                await cache.set(cacheKey, payload, ttl);
                reply.header('X-Cache', 'MISS');
            }
            return originalSend(payload);
        };
    };
}

// Usage
fastify.addHook('preHandler', cacheMiddleware(fastify.cache, {
    cacheName: 'config',
    ttl: 300,
    keyGenerator: (req) => `api:${req.routerPath}:${JSON.stringify(req.query)}`,
    condition: (req) => req.method === 'GET' && !req.headers['cache-control']?.includes('no-cache')
}));
```

---

## 8. Configuration

### 8.1 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CACHE_DEFAULT_TTL` | `300` | Default TTL in seconds |
| `CACHE_BACKEND` | `memory` | Backend type (`memory` or `redis`) |
| `CACHE_LOG_LEVEL` | `10` (DEBUG) | Log level (10=DEBUG, 20=INFO, 30=WARN, 40=ERROR) |
| `REDIS_URL` | - | Redis connection URL (future) |

### 8.2 App Config (YAML)

```yaml
# common/config/server.dev.yaml
cache:
  defaultTtl: 300
  backend: memory
  ttls:
    providers: 600
    services: 300
    config: 3600
    sessions: 1800
    tokens: 900
```

### 8.3 Programmatic Configuration

```javascript
// Node.js
const factory = createCacheFactory({
    defaults: {
        backend: 'memory',
        defaultTtl: 300
    }
});

// Override per-cache
factory.create('hot-data', { defaultTtl: 30 });
factory.create('cold-data', { defaultTtl: 3600 });
```

```python
# Python
factory = create_cache_factory(
    defaults={
        'backend': 'memory',
        'default_ttl': 300
    }
)

# Override per-cache
factory.create('hot-data', default_ttl=30)
factory.create('cold-data', default_ttl=3600)
```

---

## 9. Best Practices

### 9.1 Key Naming Conventions

Use consistent, hierarchical key naming:

```
{entity}:{id}                    → provider:google
{entity}:{id}:{attribute}        → provider:google:token
{entity}:{id}:{sub}:{subid}      → user:123:session:abc
{scope}:{entity}:{id}            → v2:provider:google
```

### 9.2 TTL Strategy

| Data Type | Suggested TTL | Reason |
|-----------|---------------|--------|
| Static config | 1 hour+ | Rarely changes |
| Feature flags | 1-5 min | Needs quick propagation |
| OAuth tokens | Token lifetime - buffer | Prevent stale tokens |
| Service discovery | 15-60s | Balance freshness vs load |
| User sessions | 30 min sliding | Security + UX |
| API responses | Varies | Based on data volatility |

### 9.3 Error Handling

Always handle potential cache failures gracefully:

```javascript
// Bad - cache failure breaks the app
const data = await cache.get('key');

// Good - fallback to source on cache failure
async function getData(key, fetchFn) {
    try {
        return await cache.getOrSet(key, fetchFn, 300);
    } catch (cacheError) {
        console.error('Cache error, falling back to source:', cacheError);
        return await fetchFn();
    }
}
```

### 9.4 Cache Invalidation

Implement explicit invalidation for data consistency:

```javascript
// After updating data, invalidate related cache entries
async function updateProvider(providerId, data) {
    await db.providers.update(providerId, data);

    // Invalidate all related cache entries
    const cache = factory.get(CacheNames.PROVIDERS);
    await cache.del(`provider:${providerId}`);
    await cache.del(`provider:${providerId}:config`);
    await cache.del(`provider:${providerId}:endpoints`);
}
```

### 9.5 Monitoring

Track cache performance:

```javascript
// Wrap cache with metrics
function createMonitoredCache(cache, metrics) {
    return {
        async get(key) {
            const start = Date.now();
            const value = await cache.get(key);
            metrics.timing('cache.get', Date.now() - start);
            metrics.increment(value ? 'cache.hit' : 'cache.miss');
            return value;
        },
        // ... wrap other methods
    };
}
```

---

## 10. Troubleshooting

### 10.1 Common Issues

**Cache always misses:**
- Check TTL is not 0 or negative
- Verify keys are consistent (case-sensitive)
- Check for clock skew in distributed systems

**Memory growing unbounded:**
- Ensure TTLs are set appropriately
- Call `destroy()` on removed cache instances
- Monitor `cache.size()` over time

**Stale data after update:**
- Implement explicit cache invalidation
- Consider shorter TTLs for volatile data
- Use cache-aside pattern for writes

### 10.2 Debug Logging

Enable debug logging to trace cache operations:

```bash
# Node.js
CACHE_LOG_LEVEL=10 node server.mjs

# Python
CACHE_LOG_LEVEL=10 python -m uvicorn main:app
```

Log output format:
```
[DEBUG] [server-provider-cache:service] [providers] cache hit: oauth:google
[DEBUG] [server-provider-cache:service] [providers] cache miss: oauth:github, fetching...
[DEBUG] [server-provider-cache:service] [providers] set: oauth:github (ttl=600s)
```

### 10.3 Multi-Worker Limitations

The in-memory backend does **NOT** share data across workers:

```
Worker 1: cache.set('key', 'value')  →  Worker 1 memory
Worker 2: cache.get('key')           →  undefined (different memory)
```

**Solutions:**
1. Use Redis backend (when implemented)
2. Use sticky sessions to route same users to same workers
3. Accept eventual consistency for non-critical data

---

## Appendix: Interface Parity Reference

### Factory Methods

| Operation | Node.js | Python |
|-----------|---------|--------|
| Create factory | `createCacheFactory(opts)` | `create_cache_factory(defaults=opts)` |
| Create cache | `factory.create(name, opts)` | `factory.create(name, **opts)` |
| Get cache | `factory.get(name)` | `factory.get(name)` |
| Check exists | `factory.has(name)` | `factory.has(name)` |
| Destroy cache | `await factory.destroy(name)` | `await factory.destroy(name)` |
| Destroy all | `await factory.destroyAll()` | `await factory.destroy_all()` |
| Get names | `factory.getNames()` | `factory.get_names()` |
| Get count | `factory.getCount()` | `factory.get_count()` |

### Cache Methods

| Operation | Node.js | Python |
|-----------|---------|--------|
| Get | `await cache.get(key)` | `await cache.get(key)` |
| Set | `await cache.set(key, val, ttl?)` | `await cache.set(key, val, ttl=None)` |
| Delete | `await cache.del(key)` | `await cache.delete(key)` |
| Clear | `await cache.clear()` | `await cache.clear()` |
| Keys | `await cache.keys()` | `await cache.keys()` |
| Size | `await cache.size()` | `await cache.size()` |
| Get or Set | `await cache.getOrSet(key, fn, ttl?)` | `await cache.get_or_set(key, fn, ttl=None)` |
| Destroy | `await cache.destroy()` | `await cache.destroy()` |

---

*Document Version: 1.0.0 | Last Updated: 2026-01-12*
