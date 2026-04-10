# Statsig Console API Client — Python Usage Guide

## Prerequisites

- Python >= 3.11
- A Statsig Console API key (from the Statsig dashboard under Project Settings > API Keys)

## Setup

### Environment Variable

```bash
export STATSIG_API_KEY="console-your-key-here"
```

### Direct Configuration

```python
from statsig_client import StatsigClient

async with StatsigClient(api_key="console-your-key-here") as client:
    result = await client.get("/gates")
```

## Common Patterns

### Feature Gate Management

```python
from statsig_client import StatsigClient
from statsig_client.modules.gates import GatesModule

async with StatsigClient(api_key="console-xxx") as client:
    gates = GatesModule(client)

    # List all gates
    all_gates = await gates.list()

    # Create a new gate
    gate = await gates.create({
        "name": "dark_mode",
        "description": "Enable dark mode for users",
    })

    # Enable/disable
    await gates.enable("dark_mode")
    await gates.disable("dark_mode")

    # Get and update overrides
    overrides = await gates.get_overrides("dark_mode")
    await gates.update_overrides("dark_mode", {
        "userIDs": ["user123"],
        "passPercentage": 100,
    })

    # Get and update rules
    rules = await gates.get_rules("dark_mode")

    # Archive
    await gates.archive("dark_mode")

    # Delete
    await gates.delete("dark_mode")
```

### Experiment Lifecycle

```python
from statsig_client import StatsigClient
from statsig_client.modules.experiments import ExperimentsModule

async with StatsigClient(api_key="console-xxx") as client:
    experiments = ExperimentsModule(client)

    # Create
    exp = await experiments.create({
        "name": "pricing_test",
        "description": "Test new pricing tiers",
    })

    # Start
    await experiments.start("pricing_test")

    # Check pulse results
    results = await experiments.pulse_results("pricing_test")

    # Ship or abandon
    await experiments.make_decision("pricing_test", {
        "decision": "ship",
    })

    # Or reset/archive
    # await experiments.reset("pricing_test")
    # await experiments.archive("pricing_test")
```

### Batch Operations with Pagination

```python
from statsig_client import StatsigClient
from statsig_client.pagination import paginate

async with StatsigClient(api_key="console-xxx") as client:
    # Process experiments page by page (memory efficient)
    total = 0
    async for page in paginate(client, "/experiments"):
        for exp in page:
            print(f"{exp['name']}: {exp['status']}")
            total += 1
    print(f"Processed {total} experiments")
```

### Custom Rate Limit Handling

```python
from statsig_client import StatsigClient, RateLimitInfo

def on_rate_limit(info: RateLimitInfo) -> bool:
    print(f"Rate limited. Retry-After: {info.retry_after}s")
    print(f"Remaining: {info.remaining}, Limit: {info.limit}")

    # Return False to abort instead of waiting
    if info.retry_after > 120:
        print("Wait time too long, aborting")
        return False
    return True

async with StatsigClient(
    api_key="console-xxx",
    rate_limit_auto_wait=True,
    on_rate_limit=on_rate_limit,
) as client:
    # ... operations here
    pass
```

### Async Rate Limit Callback

```python
async def on_rate_limit(info: RateLimitInfo) -> bool:
    # Async callbacks are also supported
    await notify_monitoring_system(info)
    return True
```

### Error Recovery

```python
from statsig_client.errors import NotFoundError, ServerError

async def safe_get_gate(gates, gate_id):
    try:
        return await gates.get(gate_id)
    except NotFoundError:
        return None  # Gate doesn't exist
    except ServerError as err:
        print(f"Server error {err.status_code}, retrying...")
        return await gates.get(gate_id)  # Simple retry
```

## FastAPI Integration

See [SERVER_INTEGRATION.md](../../docs/SERVER_INTEGRATION.md) for the complete FastAPI lifecycle hook pattern.

### Quick Example

```python
from fastapi import FastAPI, Request
from statsig_client import StatsigClient
from statsig_client.modules.gates import GatesModule

app = FastAPI()

@app.on_event("startup")
async def startup():
    client = StatsigClient(api_key="console-xxx")
    app.state.statsig = client
    app.state.gates = GatesModule(client)

@app.on_event("shutdown")
async def shutdown():
    await app.state.statsig.close()

@app.get("/api/gates")
async def list_gates(request: Request):
    return await request.app.state.gates.list()
```

## Testing

```bash
# Run all tests
cd py && python -m pytest __tests__/ -v

# Run FastAPI integration tests only
python -m pytest __tests__/test_fastapi_integration.py -v
```

Tests use `pytest` + `pytest-asyncio` + `pytest-httpx` for mocking HTTP requests.
