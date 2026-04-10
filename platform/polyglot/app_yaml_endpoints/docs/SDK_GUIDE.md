# App YAML Endpoints SDK Guide

Configuration-driven endpoint routing SDK for Python 3.11+ and Node.js 20.x (ESM).

## Overview

App YAML Endpoints provides a unified interface for managing API endpoint configurations and generating fetch configurations. It supports:

- Loading configuration from YAML files or objects
- Intent-to-endpoint mapping
- Header merging (default → endpoint → custom)
- Defensive logging with package/file context

## Installation

### Python

```bash
cd py && pip install -e ".[dev]"
```

### Node.js

```bash
cd mjs && npm install
```

## Quick Start

### Python

```python
from app_yaml_endpoints import load_config_from_file, get_fetch_config

# Load configuration
load_config_from_file('./config/endpoint.yaml')

# Get fetch config for a service
config = get_fetch_config('llm001', {"prompt": "Hello"})
print(config.url, config.headers)
```

### Node.js (ESM)

```javascript
import { loadConfigFromFile, getFetchConfig } from 'app-yaml-endpoints';

// Load configuration
loadConfigFromFile('./config/endpoint.yaml');

// Get fetch config for a service
const config = getFetchConfig('llm001', { prompt: 'Hello' });
console.log(config.url, config.headers);
```

## Configuration Format

Configuration is defined in YAML format:

```yaml
endpoints:
  llm001:
    baseUrl: "http://localhost:51000/api/llm/gemini-openai-v1"
    description: "Primary LLM Service"
    method: "POST"
    headers:
      Content-Type: "application/json"
      X-Service-ID: "llm-primary"
    timeout: 30000
    bodyType: "json"

intent_mapping:
  mappings:
    chat: llm001
    agent: agents001
  default_intent: llm001
```

### Endpoint Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| baseUrl | string | required | Base URL for the endpoint |
| description | string | "" | Human-readable description |
| method | string | "POST" | HTTP method |
| headers | object | {} | Default headers |
| timeout | number | 30000 | Timeout in milliseconds |
| bodyType | "json" \| "text" | "json" | Body serialization type |

## Core Functions

### loadConfigFromFile(filePath)

Load configuration from a YAML file.

```python
# Python
config = load_config_from_file('/path/to/endpoint.yaml')
```

```javascript
// Node.js
const config = loadConfigFromFile('/path/to/endpoint.yaml');
```

### loadConfig(config)

Load configuration from a dictionary/object.

```python
# Python
config = load_config({
    "endpoints": {...},
    "intent_mapping": {...}
})
```

### getFetchConfig(serviceId, payload, customHeaders?)

Get complete fetch configuration for a service.

```python
# Python
config = get_fetch_config(
    "llm001",
    {"messages": [...]},
    custom_headers={"X-Request-ID": "123"}
)
```

Returns a `FetchConfig` with:
- `service_id` / `serviceId`: The resolved service ID
- `url`: Full URL for the request
- `method`: HTTP method
- `headers`: Merged headers
- `body`: Serialized body
- `timeout` / `headersTimeout`: Timeout in ms

### resolveIntent(intent)

Resolve an intent string to a service ID.

```python
# Python
service_id = resolve_intent("chat")  # Returns "llm001"
```

### listEndpoints()

List all available endpoint service IDs.

```python
# Python
endpoints = list_endpoints()  # ["llm001", "llm002", ...]
```

## Logging

The SDK uses defensive logging with package and file context.

### Creating a Logger

```python
# Python
from app_yaml_endpoints import LoggerFactory
logger = LoggerFactory.create('my-package', __file__)
logger.info('Message', {'key': 'value'})
```

```javascript
// Node.js
import { LoggerFactory } from 'app-yaml-endpoints';
const logger = LoggerFactory.create('my-package', import.meta.url);
logger.info('Message', { key: 'value' });
```

### Log Levels

- `trace`: Most verbose
- `debug`: Debug information
- `info`: General information
- `warn`: Warnings
- `error`: Errors

### Environment Variables

- `LOG_LEVEL`: Set minimum log level (default: "info")
- `LOG_JSON`: Set to "true" for JSON output

## Error Handling

The SDK throws `ConfigError` for configuration issues:

```python
# Python
from app_yaml_endpoints import ConfigError

try:
    config = get_fetch_config("unknown", {})
except ConfigError as e:
    print(e.message)
    print(e.service_id)   # The requested service ID
    print(e.available)    # List of available service IDs
```

```javascript
// Node.js
import { getFetchConfig, ConfigError } from 'app-yaml-endpoints';

try {
    const config = getFetchConfig('unknown', {});
} catch (err) {
    if (err instanceof ConfigError) {
        console.log(err.message);
        console.log(err.serviceId);
        console.log(err.available);
    }
}
```

## Header Merging Order

Headers are merged in this order (later values override earlier):

1. Default: `Content-Type: application/json`
2. Endpoint headers from configuration
3. Custom headers passed to `getFetchConfig`
