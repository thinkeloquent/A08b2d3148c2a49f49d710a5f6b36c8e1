# fetch-undici Examples

Comprehensive usage examples for the fetch-undici package.

## Running Examples

```bash
# Run individual example
node examples/01-quick-start.mjs

# Run with tsx for TypeScript support
npx tsx examples/01-quick-start.mjs
```

## Example Files

| File | Description |
|------|-------------|
| [01-quick-start.mjs](./01-quick-start.mjs) | Basic GET/POST requests, convenience functions |
| [02-async-client.mjs](./02-async-client.mjs) | AsyncClient usage, configuration, base URL |
| [03-authentication.mjs](./03-authentication.mjs) | Basic, Bearer, Digest, and custom auth |
| [04-streaming.mjs](./04-streaming.mjs) | Response streaming (bytes, text, lines, SSE) |
| [05-sdk-usage.mjs](./05-sdk-usage.mjs) | SDK layer for CLI, LLM Agent, DevTools |
| [06-error-handling.mjs](./06-error-handling.mjs) | Exception hierarchy and error patterns |
| [07-advanced.mjs](./07-advanced.mjs) | Interceptors, mount routing, mocking |
| [08-retry-circuit-breaker.mjs](./08-retry-circuit-breaker.mjs) | Retry patterns, jitter, circuit breaker |
| [09-caching.mjs](./09-caching.mjs) | Response caching, key strategies, middleware |

## Quick Start

```javascript
import { get, post, AsyncClient } from 'fetch-undici'

// Simple GET request
const response = await get('https://api.example.com/users')
console.log(await response.json())

// POST with JSON body
const created = await post('https://api.example.com/users', {
  json: { name: 'Alice', email: 'alice@example.com' }
})

// Using AsyncClient with base URL
const client = new AsyncClient({
  baseUrl: 'https://api.example.com',
  headers: { 'Authorization': 'Bearer token' }
})

const users = await client.get('/users')
await client.close()
```

## API Comparison

### fetch-undici vs httpx (Python)

| httpx (Python) | fetch-undici |
|----------------|--------------|
| `httpx.get(url)` | `get(url)` |
| `httpx.post(url, json={...})` | `post(url, { json: {...} })` |
| `httpx.AsyncClient()` | `new AsyncClient()` |
| `response.raise_for_status()` | `response.raiseForStatus()` |
| `response.iter_bytes()` | `response.aiterBytes()` |
| `BasicAuth('user', 'pass')` | `new BasicAuth('user', 'pass')` |

### fetch-undici vs Undici

| Undici | fetch-undici |
|--------|--------------|
| `request(url, opts)` | `get(url, opts)` |
| Manual header handling | `Headers` class |
| `body.json()` | `response.json()` |
| Manual auth encoding | `BasicAuth`, `BearerAuth` classes |
| Manual error handling | `HTTPStatusError`, `TransportError` |
