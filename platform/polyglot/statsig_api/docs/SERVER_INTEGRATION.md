# Server Integration Guide for Statsig Console API Client

This guide covers integration patterns for embedding the Statsig Console API Client into web server frameworks. The client acts as a proxy layer, exposing Statsig Console API endpoints through your application's REST API.

## Fastify Integration (Node.js)

The integration uses a lifecycle hook pattern. During Fastify startup, the client is initialized and registered as server decorators, then API proxy routes are mounted under a versioned prefix.

### Pattern: Fastify Lifecycle Hook

```typescript
import {
  createStatsigClient,
} from 'statsig-api-client';

const VENDOR = 'statsig_api';

export async function onStartup(server, config) {
  // Resolve API key from config or environment
  const apiKey = process.env.STATSIG_API_KEY;
  if (!apiKey) {
    console.warn('Statsig API key not found -- routes will NOT be registered.');
    return;
  }

  // Create client with all domain modules attached
  const statsig = createStatsigClient({ apiKey });

  // Decorate server instance for access in route handlers
  server.decorate('statsig', statsig);
  server.decorate('statsigClients', {
    experiments: statsig.experiments,
    gates: statsig.gates,
    metrics: statsig.metrics,
    segments: statsig.segments,
    layers: statsig.layers,
    events: statsig.events,
    tags: statsig.tags,
    reports: statsig.reports,
    auditLogs: statsig.auditLogs,
  });

  // Register routes under a versioned prefix
  const PREFIX = `/~/api/rest/2025-01-01/providers/${VENDOR}`;

  await server.register(
    async function statsigRoutes(scope) {
      // Health endpoint
      scope.get('/health', async () => ({
        status: 'ok',
        vendor: VENDOR,
      }));

      // v1 API proxy routes
      await scope.register(async (v1) => {
        v1.get('/gates', async (req) => {
          return scope.statsigClients.gates.list(req.query);
        });

        v1.get('/gates/:id', async (req) => {
          return scope.statsigClients.gates.get(req.params.id);
        });

        v1.post('/gates', async (req) => {
          return scope.statsigClients.gates.create(req.body);
        });

        v1.get('/experiments', async (req) => {
          return scope.statsigClients.experiments.list(req.query);
        });

        v1.get('/experiments/:id', async (req) => {
          return scope.statsigClients.experiments.get(req.params.id);
        });

        // ... additional routes for all domain modules
      }, { prefix: '/v1' });
    },
    { prefix: PREFIX },
  );

  // Cleanup on server close
  server.addHook('onClose', async () => {
    statsig.close();
  });
}

export async function onShutdown(server) {
  server.log?.info?.('Statsig Console API shutdown complete');
}
```

### Usage

```typescript
import Fastify from 'fastify';
import { onStartup } from './lifecycle/520.statsig_api.lifecycle.mjs';

const server = Fastify({ logger: true });

// Initialize Statsig during startup
await onStartup(server, config);

await server.listen({ port: 3000 });
```

### Accessing the Client in Routes

```typescript
// Via server decorator (available in all route handlers)
server.get('/custom-endpoint', async (req) => {
  const statsig = req.server.statsig;
  const clients = req.server.statsigClients;

  // Use domain modules
  const gates = await clients.gates.list();

  // Or use raw client
  const result = await statsig.get('/dynamic_configs');

  return { gates, result };
});
```

---

## FastAPI Integration (Python)

The integration uses the FastAPI lifecycle hook pattern. The client and domain modules are stored on `app.state` during startup and cleaned up during shutdown.

### Pattern: Lifecycle Hooks

```python
import os
from typing import Any

from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import JSONResponse

from statsig_client import StatsigClient, create_statsig_client
from statsig_client.modules.experiments import ExperimentsModule
from statsig_client.modules.gates import GatesModule
from statsig_client.modules.metrics import MetricsModule
from statsig_client.modules.segments import SegmentsModule
from statsig_client.modules.layers import LayersModule
from statsig_client.modules.events import EventsModule
from statsig_client.modules.tags import TagsModule
from statsig_client.modules.reports import ReportsModule
from statsig_client.modules.audit_logs import AuditLogsModule

VENDOR = "statsig_api"


async def onStartup(app: FastAPI, config: dict[str, Any]) -> None:
    # Resolve API key
    api_key = os.environ.get("STATSIG_API_KEY")
    if not api_key:
        print("Statsig API key not found -- routes will NOT be registered.")
        return

    # Create client and domain modules
    statsig = create_statsig_client(api_key=api_key)

    experiments = ExperimentsModule(statsig)
    gates = GatesModule(statsig)
    metrics = MetricsModule(statsig)
    segments = SegmentsModule(statsig)
    layers = LayersModule(statsig)
    events = EventsModule(statsig)
    tags = TagsModule(statsig)
    reports = ReportsModule(statsig)
    audit_logs = AuditLogsModule(statsig)

    # Store on app.state for access in route handlers
    app.state.statsig = statsig
    app.state.statsig_clients = {
        "experiments": experiments,
        "gates": gates,
        "metrics": metrics,
        "segments": segments,
        "layers": layers,
        "events": events,
        "tags": tags,
        "reports": reports,
        "audit_logs": audit_logs,
    }

    # Register routes
    PREFIX = f"/~/api/rest/2025-01-01/providers/{VENDOR}"
    router = APIRouter(prefix=PREFIX)

    @router.get("/health")
    async def health():
        return JSONResponse({"status": "ok", "vendor": VENDOR})

    v1 = APIRouter(prefix="/v1")

    @v1.get("/gates")
    async def list_gates(request: Request):
        return await request.app.state.statsig_clients["gates"].list(
            params=dict(request.query_params)
        )

    @v1.get("/gates/{gate_id}")
    async def get_gate(gate_id: str, request: Request):
        return await request.app.state.statsig_clients["gates"].get(gate_id)

    @v1.post("/gates")
    async def create_gate(request: Request):
        body = await request.json()
        return await request.app.state.statsig_clients["gates"].create(body)

    @v1.get("/experiments")
    async def list_experiments(request: Request):
        return await request.app.state.statsig_clients["experiments"].list(
            params=dict(request.query_params)
        )

    # ... additional routes for all domain modules

    router.include_router(v1)
    app.include_router(router)


async def onShutdown(app: FastAPI, config: dict[str, Any]) -> None:
    client = getattr(app.state, "statsig", None)
    if client:
        await client.close()
```

### Usage

```python
from fastapi import FastAPI

app = FastAPI()

@app.on_event("startup")
async def startup():
    await onStartup(app, config)

@app.on_event("shutdown")
async def shutdown():
    await onShutdown(app, config)
```

### Accessing the Client in Routes

```python
from fastapi import Request

@app.get("/custom-endpoint")
async def custom_endpoint(request: Request):
    statsig = request.app.state.statsig
    clients = request.app.state.statsig_clients

    # Use domain modules
    gates = await clients["gates"].list()

    # Or use raw client
    result = await statsig.get("/dynamic_configs")

    return {"gates": gates, "result": result}
```

---

## Registered Endpoints

Both integrations register the same set of proxy endpoints:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/v1/experiments` | List experiments |
| `POST` | `/v1/experiments` | Create experiment |
| `GET` | `/v1/experiments/:id` | Get experiment |
| `PATCH` | `/v1/experiments/:id` | Update experiment |
| `DELETE` | `/v1/experiments/:id` | Delete experiment |
| `PUT` | `/v1/experiments/:id/start` | Start experiment |
| `PUT` | `/v1/experiments/:id/make_decision` | Make decision |
| `GET` | `/v1/experiments/:id/pulse_results` | Get pulse results |
| `GET` | `/v1/gates` | List gates |
| `POST` | `/v1/gates` | Create gate |
| `GET` | `/v1/gates/:id` | Get gate |
| `PUT` | `/v1/gates/:id/enable` | Enable gate |
| `PUT` | `/v1/gates/:id/disable` | Disable gate |
| `GET` | `/v1/metrics/list` | List metrics |
| `POST` | `/v1/metrics` | Create metric |
| `GET` | `/v1/segments` | List segments |
| `POST` | `/v1/segments` | Create segment |
| `GET` | `/v1/layers` | List layers |
| `GET` | `/v1/tags` | List tags |
| `GET` | `/v1/events` | List events |
| `GET` | `/v1/reports` | List reports |
| `GET` | `/v1/audit_logs` | List audit logs |

All endpoints are prefixed with `/~/api/rest/{api_release_date}/providers/statsig_api`.
