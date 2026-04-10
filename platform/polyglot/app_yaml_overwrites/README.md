# App Yaml Overwrites Polyglot Package

Unified Configuration SDK for Python and Node.js.

## Installation

**Python**:
```bash
pip install app_yaml_overwrites
```

**Node.js**:
```bash
npm install app-yaml-overwrites
```

## Usage

### Standalone (CLI / Tools)

**Python**:
```python
from app_yaml_overwrites import SDK, create_logger

async def main():
    sdk = await SDK.from_files(["config/base.yaml"])
    print(sdk.get("app.name"))
```

**Node.js**:
```typescript
import { SDK, createLogger } from 'app-yaml-overwrites';

async function main() {
    const sdk = await SDK.fromFiles(["config/base.yaml"]);
    console.log(sdk.get("app.name"));
}
```

### Server Integration

See `integrations/fastapi.py` and `integrations/fastify.ts` for unified server integration helpers.
