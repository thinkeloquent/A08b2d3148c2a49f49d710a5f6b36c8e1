# API Reference

## Configuration Functions

### loadConfigFromFile

Load configuration from a YAML file.

**Python:**
```python
def load_config_from_file(file_path: str | Path) -> dict[str, Any]
```

**Node.js:**
```javascript
function loadConfigFromFile(filePath: string): Record<string, unknown>
```

**Parameters:**
- `file_path`: Path to the YAML configuration file

**Returns:** Configuration dictionary

**Throws:** `ConfigError` if YAML parsing fails

---

### loadConfig

Load configuration from a dictionary object.

**Python:**
```python
def load_config(config: dict[str, Any]) -> dict[str, Any]
```

**Node.js:**
```javascript
function loadConfig(config: Record<string, unknown>): Record<string, unknown>
```

**Parameters:**
- `config`: Configuration object with `endpoints` and optional `intent_mapping`

**Returns:** The stored configuration

---

### getConfig

Get the current configuration.

**Python:**
```python
def get_config() -> dict[str, Any]
```

**Node.js:**
```javascript
function getConfig(): Record<string, unknown>
```

**Throws:** `ConfigError` if configuration not loaded

---

### listEndpoints

List all available endpoint service IDs.

**Python:**
```python
def list_endpoints() -> list[str]
```

**Node.js:**
```javascript
function listEndpoints(): string[]
```

---

### getEndpoint

Get endpoint configuration for a service ID.

**Python:**
```python
def get_endpoint(service_id: str) -> EndpointConfig | None
```

**Node.js:**
```javascript
function getEndpoint(serviceId: string): EndpointConfig | null
```

**Parameters:**
- `service_id`: Service ID (e.g., 'llm001' or 'endpoints.llm001')

**Returns:** `EndpointConfig` or `None`/`null` if not found

---

### resolveIntent

Resolve an intent to a service ID.

**Python:**
```python
def resolve_intent(intent: str) -> str
```

**Node.js:**
```javascript
function resolveIntent(intent: string): string
```

**Parameters:**
- `intent`: Intent string (e.g., 'chat', 'agent')

**Returns:** Resolved service ID

---

### getFetchConfig

Get complete fetch configuration for a service.

**Python:**
```python
def get_fetch_config(
    service_id: str,
    payload: Any,
    custom_headers: dict[str, str] | None = None
) -> FetchConfig
```

**Node.js:**
```javascript
function getFetchConfig(
    serviceId: string,
    payload: unknown,
    customHeaders?: Record<string, string> | null
): FetchConfig
```

**Parameters:**
- `service_id`: Target service ID
- `payload`: Request payload (JSON serialized)
- `custom_headers`: Optional headers to merge

**Returns:** `FetchConfig` ready for HTTP client

**Throws:** `ConfigError` if service not found

---

## Data Types

### EndpointConfig

Configuration for a single endpoint.

| Field | Python | Node.js | Type | Description |
|-------|--------|---------|------|-------------|
| Base URL | `base_url` | `baseUrl` | string | Endpoint URL |
| Description | `description` | `description` | string | Human-readable name |
| Method | `method` | `method` | string | HTTP method |
| Headers | `headers` | `headers` | dict/object | Default headers |
| Timeout | `timeout` | `timeout` | number | Timeout in ms |
| Body Type | `body_type` | `bodyType` | "json" \| "text" | Serialization |

### FetchConfig

Complete fetch configuration for HTTP request.

| Field | Python | Node.js | Type | Description |
|-------|--------|---------|------|-------------|
| Service ID | `service_id` | `serviceId` | string | Resolved service |
| URL | `url` | `url` | string | Full URL |
| Method | `method` | `method` | string | HTTP method |
| Headers | `headers` | `headers` | dict/object | Merged headers |
| Body | `body` | `body` | string | Serialized body |
| Timeout | `timeout` | `headersTimeout` | number | Timeout in ms |

---

## Logger Classes

### Logger

Logger with package and file context.

**Constructor:**
```python
# Python
Logger(package: str, filename: str, handler=None, level="info", json_output=False)
```

```javascript
// Node.js
new Logger(pkg, filename, handler = null, level = 'info', jsonOutput = false)
```

**Methods:**
- `trace(msg, data?)` - Trace level
- `debug(msg, data?)` - Debug level
- `info(msg, data?)` - Info level
- `warn(msg, data?)` - Warning level
- `error(msg, data?)` - Error level

### LoggerFactory

Factory for creating loggers with consistent defaults.

**Static Method:**
```python
# Python
LoggerFactory.create(package, filename, handler=None, level=None, json_output=None)
```

```javascript
// Node.js
LoggerFactory.create(pkg, filename, handler = null, level = null, jsonOutput = null)
```

---

## Exceptions

### ConfigError

Error raised for configuration issues.

**Properties:**
- `message`: Error message
- `service_id` / `serviceId`: Related service ID (if applicable)
- `available`: List of available service IDs
