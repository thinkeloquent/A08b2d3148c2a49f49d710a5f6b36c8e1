# Statsig Console API Client — Node.js Usage Guide

## Prerequisites

- Node.js >= 20.0.0
- A Statsig Console API key (from the Statsig dashboard under Project Settings > API Keys)

## Setup

### Environment Variable

```bash
export STATSIG_API_KEY="console-your-key-here"
```

### Direct Configuration

```typescript
import { createStatsigClient } from 'statsig-api-client';

const client = createStatsigClient({
  apiKey: 'console-your-key-here',
});
```

## Common Patterns

### Feature Gate Management

```typescript
const client = createStatsigClient();

// List all gates
const gates = await client.gates.list();

// Create a new gate
const gate = await client.gates.create({
  name: 'dark_mode',
  description: 'Enable dark mode for users',
});

// Update a gate
await client.gates.update('dark_mode', {
  description: 'Updated description',
  enabled: true,
});

// Get overrides
const overrides = await client.gates.getOverrides('dark_mode');

// Delete a gate
await client.gates.delete('dark_mode');

client.close();
```

### Experiment Lifecycle

```typescript
const client = createStatsigClient();

// Create an experiment
const exp = await client.experiments.create({
  name: 'pricing_test',
  description: 'Test new pricing tiers',
});

// Start the experiment
await client.experiments.start('pricing_test');

// Check results (once running)
// Use raw client for endpoints not in the module:
const results = await client.get('/experiments/pricing_test/pulse_results');

// Clean up
await client.experiments.delete('pricing_test');

client.close();
```

### Batch Operations with Pagination

```typescript
import { paginate } from 'statsig-api-client';

const client = createStatsigClient();

// Process experiments page by page (memory efficient)
let total = 0;
for await (const page of paginate(client, '/experiments')) {
  for (const exp of page) {
    console.log(`${exp.name}: ${exp.status}`);
    total++;
  }
}
console.log(`Processed ${total} experiments`);

client.close();
```

### Custom Rate Limit Handling

```typescript
const client = createStatsigClient({
  rateLimitAutoWait: true,
  onRateLimit: (info) => {
    console.warn(`Rate limited. Retry-After: ${info.retryAfter}s`);
    console.warn(`Remaining: ${info.remaining}, Limit: ${info.limit}`);

    // Return false to abort instead of waiting
    if (info.retryAfter > 120) {
      console.error('Wait time too long, aborting');
      return false;
    }
    return true;
  },
});
```

### Error Recovery

```typescript
import { NotFoundError, RateLimitError, ServerError } from 'statsig-api-client';

async function safeGetGate(client, gateId) {
  try {
    return await client.gates.get(gateId);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return null;  // Gate doesn't exist
    }
    if (err instanceof ServerError) {
      console.error(`Server error ${err.statusCode}, retrying...`);
      return client.gates.get(gateId);  // Simple retry
    }
    throw err;  // Re-throw unexpected errors
  }
}
```

## Fastify Integration

See [SERVER_INTEGRATION.md](../../docs/SERVER_INTEGRATION.md) for the complete Fastify lifecycle hook pattern.

### Quick Example

```typescript
import Fastify from 'fastify';
import { createStatsigClient } from 'statsig-api-client';

const server = Fastify();

const statsig = createStatsigClient();
server.decorate('statsig', statsig);
server.decorate('statsigClients', {
  gates: statsig.gates,
  experiments: statsig.experiments,
});

server.get('/api/gates', async (req) => {
  return req.server.statsigClients.gates.list(req.query);
});

server.addHook('onClose', () => statsig.close());

await server.listen({ port: 3000 });
```

## Testing

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run integration tests only
pnpm test:integration
```

Tests use `vitest` with mocked `fetch` via `vi.stubGlobal('fetch', mockFetch)`.
