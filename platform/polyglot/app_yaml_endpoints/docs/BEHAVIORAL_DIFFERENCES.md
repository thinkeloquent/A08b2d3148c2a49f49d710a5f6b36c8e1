# Behavioral Differences: Python vs Node.js

This document outlines the behavioral differences between the Python and Node.js implementations of App YAML Endpoints.

## Field Naming Conventions

The Python implementation uses snake_case internally, while Node.js uses camelCase:

| Concept | Python | Node.js |
|---------|--------|---------|
| Base URL | `base_url` | `baseUrl` |
| Service ID | `service_id` | `serviceId` |
| Body Type | `body_type` | `bodyType` |
| Timeout Field | `timeout` | `headersTimeout` |

### Serialization

Both implementations serialize to camelCase when calling `to_dict()` or returning objects:

```python
# Python
config = get_fetch_config("llm001", {})
config.to_dict()  # Returns {"serviceId": ..., "baseUrl": ...}
```

```javascript
// Node.js
const config = getFetchConfig('llm001', {});
// Already uses camelCase: { serviceId: ..., baseUrl: ... }
```

## Logger Context

### Python

```python
from app_yaml_endpoints import LoggerFactory
logger = LoggerFactory.create('my-pkg', __file__)
# Context: {"pkg": "my-pkg", "file": "filename.py"}
```

### Node.js

```javascript
import { LoggerFactory } from 'app-yaml-endpoints';
const logger = LoggerFactory.create('my-pkg', import.meta.url);
// Context: { pkg: 'my-pkg', file: 'filename.mjs' }
```

The Node.js version handles `file://` URLs from `import.meta.url` automatically.

## FetchConfig Timeout Field

| Implementation | Field Name | Value |
|----------------|------------|-------|
| Python | `timeout` | Timeout in ms |
| Node.js | `headersTimeout` | Timeout in ms |

This difference aligns with common HTTP client conventions:
- Python's `httpx` uses `timeout`
- Node.js's `undici` uses `headersTimeout`

## Error Handling

### Python

```python
from app_yaml_endpoints import ConfigError

try:
    get_fetch_config("unknown", {})
except ConfigError as e:
    print(e.service_id)  # snake_case
    print(e.available)
```

### Node.js

```javascript
import { ConfigError } from 'app-yaml-endpoints';

try {
    getFetchConfig('unknown', {});
} catch (err) {
    console.log(err.serviceId);  // camelCase
    console.log(err.available);
}
```

## Module Imports

### Python

```python
from app_yaml_endpoints import (
    load_config,
    load_config_from_file,  # snake_case
    get_fetch_config,
    get_endpoint,
    list_endpoints,
    resolve_intent,
)
```

### Node.js

```javascript
import {
    loadConfig,
    loadConfigFromFile,  // camelCase
    getFetchConfig,
    getEndpoint,
    listEndpoints,
    resolveIntent,
} from 'app-yaml-endpoints';
```

## Environment Variables

Both implementations respect the same environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Minimum log level | "info" |
| `LOG_JSON` | JSON output format | "false" |

## Type System

### Python

Uses Python dataclasses with type hints:

```python
@dataclass
class FetchConfig:
    service_id: str
    url: str
    method: str
    headers: dict[str, str]
    body: str
    timeout: int
```

### Node.js

Uses TypeScript type definitions in `.d.ts`:

```typescript
export interface FetchConfig {
    serviceId: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    headersTimeout: number;
}
```

## YAML Parsing

| Implementation | Library | Notes |
|----------------|---------|-------|
| Python | `pyyaml` | Uses `safe_load` for security |
| Node.js | `js-yaml` | Uses default `load` |

Both handle missing files gracefully by returning empty configuration.

## Path Handling

### Python

```python
from pathlib import Path
load_config_from_file(Path("./config/endpoint.yaml"))
load_config_from_file("./config/endpoint.yaml")  # Also works
```

### Node.js

```javascript
import path from 'path';
loadConfigFromFile('./config/endpoint.yaml');
loadConfigFromFile(path.resolve('./config/endpoint.yaml'));
```

## Default Configuration

When loading a missing file, both return:

```yaml
endpoints: {}
intent_mapping: {}
```

## Intent Resolution Fallback

Both implementations use `"llm001"` as the hardcoded fallback when:
1. The intent is not in the mappings
2. No `default_intent` is configured
