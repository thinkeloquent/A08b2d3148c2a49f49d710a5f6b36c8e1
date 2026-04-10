# Statsig Console API Client — SDK Guide

The Statsig Console API Client provides a high-level SDK for interacting with the Statsig Console API v1. It supports managing feature gates, experiments, segments, layers, metrics, tags, events, audit logs, and reports. The SDK is available in both Node.js and Python with equivalent functionality.

## Usage

### Node.js

```typescript
import { createStatsigClient } from 'statsig-api-client';

// Initialize with factory (attaches all domain modules)
const client = createStatsigClient({
  apiKey: process.env.STATSIG_API_KEY,
});

// List all feature gates
const gates = await client.gates.list();
console.log(`Found ${gates.length} gates`);

// Get a specific experiment
const experiment = await client.experiments.get('homepage_redesign');
console.log(`Experiment status: ${experiment.status}`);

// Create a new gate
const newGate = await client.gates.create({
  name: 'new_feature_rollout',
  description: 'Gradual rollout of new feature',
});

// Clean up
client.close();
```

### Python

```python
from statsig_client import StatsigClient
from statsig_client.modules.gates import GatesModule
from statsig_client.modules.experiments import ExperimentsModule

# Initialize with context manager (ensures cleanup)
async with StatsigClient(api_key="console-xxx") as client:
    gates_mod = GatesModule(client)
    experiments_mod = ExperimentsModule(client)

    # List all feature gates
    gates = await gates_mod.list()
    print(f"Found {len(gates)} gates")

    # Get a specific experiment
    experiment = await experiments_mod.get("homepage_redesign")
    print(f"Experiment status: {experiment['status']}")

    # Create a new gate
    new_gate = await gates_mod.create({
        "name": "new_feature_rollout",
        "description": "Gradual rollout of new feature",
    })
```

## Error Handling

Both implementations map HTTP error responses to typed exceptions.

### Node.js

```typescript
import {
  createStatsigClient,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
} from 'statsig-api-client';

const client = createStatsigClient({ apiKey: 'console-xxx' });

try {
  const gate = await client.gates.get('nonexistent_gate');
} catch (err) {
  if (err instanceof NotFoundError) {
    console.error(`Gate not found (${err.statusCode})`);
  } else if (err instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (err instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${err.retryAfter}s`);
  }
}
```

### Python

```python
from statsig_client import StatsigClient
from statsig_client.errors import (
    AuthenticationError,
    NotFoundError,
    RateLimitError,
)
from statsig_client.modules.gates import GatesModule

async with StatsigClient(api_key="console-xxx") as client:
    gates = GatesModule(client)

    try:
        gate = await gates.get("nonexistent_gate")
    except NotFoundError as err:
        print(f"Gate not found ({err.status_code})")
    except AuthenticationError:
        print("Invalid API key")
    except RateLimitError as err:
        print(f"Rate limited. Retry after {err.retry_after}s")
```

## Rate Limiting

The SDK handles HTTP 429 responses automatically by default. When a 429 is received, the client waits for the duration specified in the `Retry-After` header, then retries the request (up to 3 retries).

### Node.js

```typescript
const client = createStatsigClient({
  apiKey: process.env.STATSIG_API_KEY,
  rateLimitAutoWait: true,       // Default: true
  onRateLimit: (info) => {
    console.log(`Rate limited. Waiting ${info.retryAfter}s...`);
    return true;                 // Return false to abort retry
  },
});
```

### Python

```python
def on_rate_limit(info):
    print(f"Rate limited. Waiting {info.retry_after}s...")
    return True  # Return False to abort retry

client = StatsigClient(
    api_key="console-xxx",
    rate_limit_auto_wait=True,   # Default: True
    on_rate_limit=on_rate_limit,
)
```

## Pagination

List endpoints automatically paginate through all results. Use `client.list()` or module `.list()` methods to get all items across all pages.

### Node.js

```typescript
// Automatic pagination via module
const allGates = await client.gates.list();

// Manual pagination with async generator
import { paginate } from 'statsig-api-client';

for await (const page of paginate(client, '/experiments')) {
  for (const experiment of page) {
    console.log(experiment.name);
  }
}
```

### Python

```python
from statsig_client.pagination import paginate

# Automatic pagination via module
all_gates = await gates_mod.list()

# Manual pagination with async generator
async for page in paginate(client, "/experiments"):
    for experiment in page:
        print(experiment["name"])
```

## Raw HTTP Methods

For endpoints not covered by domain modules, use the client's HTTP methods directly.

### Node.js

```typescript
// GET with query parameters
const result = await client.get('/dynamic_configs', {
  params: { limit: 10, page: 1 },
});

// POST with body
const created = await client.post('/segments', { name: 'power_users' });

// Raw response (access headers, status)
const raw = await client.getRaw('/experiments');
console.log(`Status: ${raw.status}`);
```

### Python

```python
# GET with query parameters
result = await client.get("/dynamic_configs", params={"limit": 10, "page": 1})

# POST with body
created = await client.post("/segments", json={"name": "power_users"})

# Raw response (access headers, status)
raw = await client.get_raw("/experiments")
print(f"Status: {raw.status_code}")
```

## Features

- **Gate Operations**: `list`, `get`, `create`, `update`, `patch`, `delete`, `getOverrides`, `updateOverrides`
- **Experiment Operations**: `list`, `get`, `create`, `update`, `patch`, `delete`, `start`, `getOverrides`, `updateOverrides`
- **Layer Operations**: `list`, `get`, `create`, `update`, `delete`
- **Segment Operations**: `list`, `get`, `create`, `update`, `delete`
- **Metric Operations**: `list`, `create`
- **Tag Operations**: `list`, `create`, `update`, `delete`
- **Event Operations**: `list`
- **Audit Log Operations**: `list`
- **Report Operations**: `list`
- **Rate Limiting**: Automatic 429 handling with configurable retry and callback
- **Pagination**: Automatic cursor-based pagination across all list endpoints
- **Error Mapping**: Typed error hierarchy with status code, body, and headers
- **Structured Logging**: Configurable logger with sensitive key redaction
