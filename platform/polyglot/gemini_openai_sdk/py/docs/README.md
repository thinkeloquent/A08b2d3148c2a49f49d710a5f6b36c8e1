# Gemini OpenAI SDK - Python Documentation

Python-specific documentation for the Gemini OpenAI SDK.

## Quick Start

```python
from gemini_openai_sdk import GeminiClient

# Initialize client
client = GeminiClient()

# Chat completion
result = await client.chat("Hello, world!")
print(result["content"])
```

## Installation

```bash
pip install gemini-openai-sdk

# For development
pip install -e ".[dev]"
```

## Environment Setup

```bash
export GEMINI_API_KEY="your-api-key"
```

## Python-Specific Notes

### Async Context

All SDK methods are async and should be called within an async context:

```python
import asyncio

async def main():
    client = GeminiClient()
    result = await client.chat("Hello")
    print(result)

asyncio.run(main())
```

### Type Hints

The SDK uses Python type hints throughout:

```python
from gemini_openai_sdk.types import ChatResponse

async def get_response() -> ChatResponse:
    client = GeminiClient()
    return await client.chat("Hello")
```

### Logging

Use the logger factory pattern:

```python
from gemini_openai_sdk.logger import create

logger = create("my-app", __file__)
logger.info("Starting application")
```

## API Reference

See [../docs/API_REFERENCE.md](../../docs/API_REFERENCE.md) for the complete API reference.

## Examples

See [../examples/](../examples/) for usage examples:

- `basic_usage.py` - Core SDK features
- `fastapi_app.py` - FastAPI integration
