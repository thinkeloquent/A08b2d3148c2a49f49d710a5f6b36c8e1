# Gemini OpenAI SDK - Node.js Documentation

Node.js-specific documentation for the Gemini OpenAI SDK.

## Quick Start

```typescript
import { GeminiClient } from 'gemini-openai-sdk';

// Initialize client
const client = new GeminiClient();

// Chat completion
const result = await client.chat('Hello, world!');
console.log(result.content);
```

## Installation

```bash
npm install gemini-openai-sdk
# or
pnpm add gemini-openai-sdk
```

## Environment Setup

```bash
export GEMINI_API_KEY="your-api-key"
```

## Node.js-Specific Notes

### ESM Modules

The SDK uses ES modules with `.mjs` extensions:

```typescript
import { GeminiClient } from 'gemini-openai-sdk';
import { create } from 'gemini-openai-sdk/logger';
```

### Async/Await

All SDK methods are async:

```typescript
async function main() {
  const client = new GeminiClient();
  const result = await client.chat('Hello');
  console.log(result);
}

main().catch(console.error);
```

### Logging

Use the logger factory pattern:

```typescript
import { create } from 'gemini-openai-sdk/logger';

const logger = create('my-app', import.meta.url);
logger.info('Starting application');
```

### Type Definitions

Types are defined using JSDoc comments for TypeScript compatibility:

```typescript
/** @type {import('gemini-openai-sdk').ChatResponse} */
const result = await client.chat('Hello');
```

## API Reference

See [../../../docs/API_REFERENCE.md](../../../docs/API_REFERENCE.md) for the complete API reference.

## Examples

See [../examples/](../examples/) for usage examples:

- `basic-usage.mjs` - Core SDK features
- `fastify-app.mjs` - Fastify integration
