# Statsig Console API Client — Node.js API Reference

## Installation

```bash
pnpm install statsig-api-client
```

Requires Node.js >= 20.0.0.

## Quick Start

```typescript
import { createStatsigClient } from 'statsig-api-client';

const client = createStatsigClient({
  apiKey: process.env.STATSIG_API_KEY,
});

const gates = await client.gates.list();
const experiment = await client.experiments.get('my_experiment');

client.close();
```

## StatsigClient

```typescript
import { StatsigClient } from 'statsig-api-client';

const client = new StatsigClient({
  apiKey: 'console-xxx',           // or set STATSIG_API_KEY env var
  baseUrl: 'https://statsigapi.net/console/v1',  // default
  rateLimitAutoWait: true,         // auto-retry on 429 (default: true)
  timeout: 30000,                  // request timeout in ms (default: 30000)
  onRateLimit: (info) => {         // optional callback
    console.log(`Rate limited, retry in ${info.retryAfter}s`);
    return true;                   // return false to abort
  },
});
```

### HTTP Methods

```typescript
const data = await client.get('/gates', { params: { limit: 10 } });
const created = await client.post('/experiments', { name: 'test' });
const updated = await client.put('/gates/my_gate', { enabled: true });
const patched = await client.patch('/experiments/exp1', { description: 'updated' });
const deleted = await client.delete('/gates/old_gate');
const raw = await client.getRaw('/experiments');  // returns full Response
const all = await client.list('/gates');          // auto-paginated
```

### Properties

```typescript
client.lastRateLimit  // RateLimitInfo | null — most recent 429 info
```

## Factory Function

```typescript
import { createStatsigClient } from 'statsig-api-client';

const client = createStatsigClient({ apiKey: 'console-xxx' });

// All domain modules are attached:
client.experiments   // ExperimentsModule
client.gates         // GatesModule
client.layers        // LayersModule
client.segments      // SegmentsModule
client.metrics       // MetricsModule
client.events        // EventsModule
client.tags          // TagsModule
client.auditLogs     // AuditLogsModule
client.reports       // ReportsModule
```

## Domain Modules

### GatesModule

```typescript
const gates = client.gates;

await gates.list();                           // List all gates (paginated)
await gates.list({ limit: 10 });              // With query params
await gates.get('gate_id');                   // Get by ID
await gates.create({ name: 'new_gate' });     // Create
await gates.update('gate_id', { ... });       // Full update (PUT)
await gates.patch('gate_id', { ... });        // Partial update (PATCH)
await gates.delete('gate_id');                // Delete
await gates.getOverrides('gate_id');          // Get overrides
await gates.updateOverrides('gate_id', { ... }); // Update overrides
```

### ExperimentsModule

```typescript
const experiments = client.experiments;

await experiments.list();                              // List all
await experiments.get('exp_id');                        // Get by ID
await experiments.create({ name: 'new_exp' });          // Create
await experiments.update('exp_id', { ... });             // Full update (PUT)
await experiments.patch('exp_id', { ... });              // Partial update (PATCH)
await experiments.delete('exp_id');                      // Delete
await experiments.start('exp_id');                       // Start experiment
await experiments.getOverrides('exp_id');                // Get overrides
await experiments.updateOverrides('exp_id', { ... });    // Update overrides
```

### Other Modules

All modules follow the same pattern with at minimum a `list()` method:

- **LayersModule**: `list`, `get`, `create`, `update`, `delete`
- **SegmentsModule**: `list`, `get`, `create`, `update`, `delete`
- **MetricsModule**: `list`, `create`
- **TagsModule**: `list`, `create`, `update`, `delete`
- **EventsModule**: `list`
- **AuditLogsModule**: `list`
- **ReportsModule**: `list`

## Error Handling

```typescript
import {
  StatsigError,
  AuthenticationError,   // 401
  NotFoundError,         // 404
  RateLimitError,        // 429 (has .retryAfter)
  ValidationError,       // 400, 422
  ServerError,           // 5xx
} from 'statsig-api-client';

try {
  await client.gates.get('missing');
} catch (err) {
  if (err instanceof NotFoundError) {
    console.error(err.statusCode);     // 404
    console.error(err.responseBody);   // parsed response body
    console.error(err.headers);        // response headers
    console.error(err.toJSON());       // structured error object
  }
}
```

## Pagination

```typescript
import { paginate, listAll } from 'statsig-api-client';

// Async generator — yields each page's data array
for await (const page of paginate(client, '/experiments')) {
  console.log(`Page with ${page.length} items`);
}

// Convenience — collects all pages into a flat array
const all = await listAll(client, '/experiments');
```

## Rate Limiting

```typescript
import { RateLimiter, parseRetryAfter, buildRateLimitInfo } from 'statsig-api-client';

// parseRetryAfter parses Retry-After header values
parseRetryAfter('30');     // 30
parseRetryAfter(null);     // 60 (default)

// buildRateLimitInfo constructs RateLimitInfo from headers
const info = buildRateLimitInfo({
  'retry-after': '10',
  'x-ratelimit-remaining': '5',
  'x-ratelimit-limit': '100',
});
```

## Logger

```typescript
import { createLogger } from 'statsig-api-client';

const log = createLogger('my-package', 'my-module');
log.debug('debug message', { key: 'value' });
log.info('info message');
log.warn('warning message');
log.error('error message');
```

Set `LOG_LEVEL` environment variable to control output: `DEBUG`, `INFO`, `WARN`, `ERROR`.

## Constants

```typescript
import { DEFAULT_BASE_URL, DEFAULT_TIMEOUT, DEFAULT_MAX_RETRIES } from 'statsig-api-client';

DEFAULT_BASE_URL    // 'https://statsigapi.net/console/v1'
DEFAULT_TIMEOUT     // 30000 (ms)
DEFAULT_MAX_RETRIES // 3
```

## Types (JSDoc)

The package uses JSDoc typedefs for IDE support:

- `StatsigClientOptions` — Client constructor options
- `RequestOptions` — Per-request options (headers, params, timeout)
- `RateLimitInfo` — Rate limit state snapshot
- `PaginatedResponse` — Response with data array and pagination metadata
- `PaginationMeta` — Pagination cursor with nextPage URL
