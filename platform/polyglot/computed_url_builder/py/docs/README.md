# Computed URL Builder (Python)

A lightweight utility for building integration endpoint URLs from configurations with support for computed values.

## Installation

```bash
pip install computed-url-builder

# With FastAPI support
pip install computed-url-builder[fastapi]
```

## Quick Start

```python
from computed_url_builder import create_url_builder

# Create a builder with static URLs
builder = create_url_builder(
    url_keys={
        'dev': 'https://dev.api.example.com',
        'prod': 'https://api.example.com'
    },
    base_path='/api/v1'
)
print(builder.build('dev'))  # https://dev.api.example.com/api/v1

# Create a builder with computed URLs
builder = create_url_builder(
    url_keys={
        'dev': lambda ctx: f"https://{ctx['tenant']}.dev.api.com",
        'prod': 'https://api.example.com'
    },
    base_path='/api/v1'
)
print(builder.build('dev', {'tenant': 'acme'}))  # https://acme.dev.api.com/api/v1
```

## Context-Based Configuration

```python
from computed_url_builder import UrlBuilder

builder = UrlBuilder.from_context({
    'dev': lambda ctx: f"https://{ctx['region']}.dev.api.com",
    'prod': 'https://api.com'
})
print(builder.build('dev', {'region': 'us-west'}))  # https://us-west.dev.api.com
```

## FastAPI Integration

```python
from fastapi import FastAPI, Depends
from computed_url_builder.fastapi import get_url_builder, UrlBuilderDep

app = FastAPI()

@app.get("/api/proxy")
async def proxy_request(builder: UrlBuilderDep):
    url = builder.build("dev")
    # ... use url
```

## API Reference

### `create_url_builder(url_keys, base_path, logger)`

Factory function to create a URL builder instance.

- `url_keys`: Dict mapping environment names to:
  - strings (host URL)
  - lists of strings (URL parts to join)
  - functions that take context dict and return a string
- `base_path`: Base path appended to string/function URLs (default: '')
- `logger`: Optional custom logger instance

### `builder.build(key, context=None)`

Build a URL for the specified environment key.

- `key`: Environment key (e.g., 'dev', 'prod')
- `context`: Optional dict passed to function-based URL values

### `builder.to_dict()`

Serialize builder state to dictionary.

### `UrlBuilder.from_context(url_keys, base_path, logger)`

Create a builder from a context object with URL configurations.

## Requirements

- Python >= 3.11
- No runtime dependencies (zero deps)
- Optional: FastAPI >= 0.115.0
