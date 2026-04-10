# Statsig Console API Client — Python API Reference

## Installation

```bash
pip install -e ".[dev]"
```

Requires Python >= 3.11. Uses `httpx` for async HTTP.

## Quick Start

```python
from statsig_client import StatsigClient
from statsig_client.modules.gates import GatesModule
from statsig_client.modules.experiments import ExperimentsModule

async with StatsigClient(api_key="console-xxx") as client:
    gates = GatesModule(client)
    experiments = ExperimentsModule(client)

    all_gates = await gates.list()
    exp = await experiments.get("my_experiment")
```

## StatsigClient

```python
from statsig_client import StatsigClient

client = StatsigClient(
    api_key="console-xxx",                     # or set STATSIG_API_KEY env var
    base_url="https://statsigapi.net/console/v1",  # default
    rate_limit_auto_wait=True,                 # auto-retry on 429 (default)
    timeout=30.0,                              # seconds (default)
    on_rate_limit=None,                        # optional callback
    proxy=None,                                # HTTP proxy URL
    verify_ssl=True,                           # TLS verification (default)
)
```

### Context Manager

```python
# Recommended: ensures httpx client is properly closed
async with StatsigClient(api_key="console-xxx") as client:
    result = await client.get("/gates")

# Manual close
client = StatsigClient(api_key="console-xxx")
try:
    result = await client.get("/gates")
finally:
    await client.close()
```

### HTTP Methods

```python
data = await client.get("/gates", params={"limit": 10})
created = await client.post("/experiments", json={"name": "test"})
updated = await client.put("/gates/my_gate", json={"enabled": True})
patched = await client.patch("/experiments/exp1", json={"description": "updated"})
deleted = await client.delete("/gates/old_gate")
raw = await client.get_raw("/experiments")   # returns httpx.Response
all_items = await client.list("/gates")       # auto-paginated
```

### Properties

```python
client.last_rate_limit   # RateLimitInfo | None — most recent 429 info
```

## Factory Function

```python
from statsig_client import create_statsig_client, StatsigClientOptions

# From options dataclass
options = StatsigClientOptions(api_key="console-xxx", timeout=60.0)
client = create_statsig_client(options)

# With keyword overrides
client = create_statsig_client(options, timeout=90.0)

# From kwargs only
client = create_statsig_client(api_key="console-xxx")
```

> **Note:** Unlike the Node.js factory, the Python factory returns a plain `StatsigClient` without domain modules attached. Instantiate modules separately.

## Types

### StatsigClientOptions

```python
from statsig_client import StatsigClientOptions

@dataclass
class StatsigClientOptions:
    api_key: str | None = None
    base_url: str = "https://statsigapi.net/console/v1"
    rate_limit_auto_wait: bool = True
    rate_limit_threshold: int = 0
    on_rate_limit: Callable | None = None
    logger: Any = None
    timeout: float = 30.0
    proxy: str | None = None
    verify_ssl: bool = True
```

### RateLimitInfo

```python
from statsig_client import RateLimitInfo

@dataclass(frozen=True)
class RateLimitInfo:
    retry_after: float
    remaining: int | None = None
    limit: int | None = None
    reset_at: str | None = None
    timestamp: str = ""
```

## Domain Modules

### GatesModule

```python
from statsig_client.modules.gates import GatesModule

gates = GatesModule(client)

await gates.list()                              # List all (paginated)
await gates.list(params={"limit": 10})          # With query params
await gates.get("gate_id")                      # Get by ID
await gates.create({"name": "new_gate"})        # Create
await gates.update("gate_id", {...})            # Full update (PUT)
await gates.patch("gate_id", {...})             # Partial update (PATCH)
await gates.delete("gate_id")                   # Delete
await gates.enable("gate_id")                   # Enable
await gates.disable("gate_id")                  # Disable
await gates.get_overrides("gate_id")            # Get overrides
await gates.update_overrides("gate_id", {...})  # Update overrides
await gates.get_rules("gate_id")                # Get rules
await gates.update_rules("gate_id", {...})      # Update rules
await gates.archive("gate_id")                  # Archive
```

### ExperimentsModule

```python
from statsig_client.modules.experiments import ExperimentsModule

experiments = ExperimentsModule(client)

await experiments.list()                                     # List all
await experiments.get("exp_id")                              # Get by ID
await experiments.create({"name": "new_exp"})                # Create
await experiments.update("exp_id", {...})                    # Full update (PUT)
await experiments.patch("exp_id", {...})                     # Partial update (PATCH)
await experiments.delete("exp_id")                           # Delete
await experiments.start("exp_id")                            # Start
await experiments.make_decision("exp_id", {"decision": "ship"})  # Ship/abandon
await experiments.reset("exp_id")                            # Reset
await experiments.archive("exp_id")                          # Archive
await experiments.get_overrides("exp_id")                    # Get overrides
await experiments.update_overrides("exp_id", {...})          # Update overrides
await experiments.pulse_results("exp_id")                    # Get pulse results
await experiments.get_assignment_source("exp_id")            # Assignment source
```

### Other Modules

All modules follow the same pattern:

- **LayersModule** (`statsig_client.modules.layers`): `list`, `get`, `create`, `update`, `delete`
- **SegmentsModule** (`statsig_client.modules.segments`): `list`, `get`, `create`, `update`, `delete`
- **MetricsModule** (`statsig_client.modules.metrics`): `list`, `create`
- **TagsModule** (`statsig_client.modules.tags`): `list`, `create`, `update`, `delete`
- **EventsModule** (`statsig_client.modules.events`): `list`
- **AuditLogsModule** (`statsig_client.modules.audit_logs`): `list`
- **ReportsModule** (`statsig_client.modules.reports`): `list`

## Error Handling

```python
from statsig_client.errors import (
    StatsigError,            # Base class
    AuthenticationError,     # 401
    NotFoundError,           # 404
    RateLimitError,          # 429 (has .retry_after)
    ValidationError,         # 400, 422
    ServerError,             # 5xx
)

try:
    await gates.get("missing")
except NotFoundError as err:
    print(err.status_code)      # 404
    print(err.response_body)    # parsed response body
    print(err.headers)          # response headers
except RateLimitError as err:
    print(err.retry_after)      # seconds to wait
```

### Error Factory

```python
from statsig_client.errors import create_error_from_response

err = create_error_from_response(404, {"message": "Not found"}, {})
# Returns NotFoundError instance
```

## Pagination

```python
from statsig_client.pagination import paginate, list_all

# Async generator — yields each page's data list
async for page in paginate(client, "/experiments"):
    print(f"Page with {len(page)} items")

# Convenience — collects all pages into a flat list
all_items = await list_all(client, "/experiments")
```

## Rate Limiting

```python
from statsig_client import RateLimiter

limiter = RateLimiter(
    auto_wait=True,        # Default
    max_retries=3,         # Default
    on_rate_limit=None,    # Optional callback
)

# Access last rate limit info
info = limiter.last_rate_limit  # RateLimitInfo | None
```

## Logger

```python
from statsig_client.logger import create_logger

log = create_logger("my_package", "my_module")
log.debug("debug message", {"key": "value"})
log.info("info message")
log.warning("warning message")
log.error("error message")
```

Set `LOG_LEVEL` environment variable to control output: `DEBUG`, `INFO`, `WARNING`, `ERROR`.

Sensitive keys (`token`, `secret`, `password`, `key`, `auth`, `credential`) are automatically redacted in log context.

## Constants

```python
from statsig_client import DEFAULT_BASE_URL, DEFAULT_TIMEOUT

DEFAULT_BASE_URL   # "https://statsigapi.net/console/v1"
DEFAULT_TIMEOUT    # 30.0 (seconds)
```
