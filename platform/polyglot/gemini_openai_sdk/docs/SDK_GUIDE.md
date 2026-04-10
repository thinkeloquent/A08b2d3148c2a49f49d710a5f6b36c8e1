# Gemini OpenAI SDK Guide

The Gemini OpenAI SDK provides a high-level API for CLI tools, LLM Agents, and Developer Tools to interact with Google's Gemini API using an OpenAI-compatible interface.

## Installation

### Node.js

```bash
npm install gemini-openai-sdk
# or
pnpm add gemini-openai-sdk
```

### Python

```bash
pip install gemini-openai-sdk
# or
pip install -e ".[dev]"  # for development
```

## Quick Start

### Node.js

```typescript
import { GeminiClient } from 'gemini-openai-sdk';

// Initialize client (uses GEMINI_API_KEY from environment)
const client = new GeminiClient();

// Simple chat
const result = await client.chat('What is the capital of France?');
if (result.success) {
  console.log('Response:', result.content);
}
```

### Python

```python
from gemini_openai_sdk import GeminiClient

# Initialize client (uses GEMINI_API_KEY from environment)
client = GeminiClient()

# Simple chat
result = await client.chat("What is the capital of France?")
if result["success"]:
    print(f"Response: {result['content']}")
```

## Usage

### Basic Chat

Send a single prompt and get a response.

#### Node.js

```typescript
import { GeminiClient } from 'gemini-openai-sdk';

const client = new GeminiClient();

const result = await client.chat('Hello, world!', {
  model: 'flash',        // or 'pro', 'thinking'
  temperature: 0.7,
  maxTokens: 1000,
});

if (result.success) {
  console.log('Response:', result.content);
  console.log('Model:', result.model);
  console.log('Usage:', result.usage);
}
```

#### Python

```python
from gemini_openai_sdk import GeminiClient

client = GeminiClient()

result = await client.chat(
    "Hello, world!",
    model="flash",        # or 'pro', 'thinking'
    temperature=0.7,
    max_tokens=1000,
)

if result["success"]:
    print(f"Response: {result['content']}")
    print(f"Model: {result['model']}")
    print(f"Usage: {result['usage']}")
```

### Streaming

Stream responses for real-time output.

#### Node.js

```typescript
// Accumulated result
const result = await client.stream('Tell me a story');
console.log('Content:', result.content);
console.log('Chunks:', result.chunk_count);

// Generator for real-time chunks
for await (const chunk of client.streamGenerator('Tell me a story')) {
  const data = JSON.parse(chunk);
  process.stdout.write(data.choices[0]?.delta?.content || '');
}
```

#### Python

```python
# Accumulated result
result = await client.stream("Tell me a story")
print(f"Content: {result['content']}")
print(f"Chunks: {result['chunk_count']}")

# Generator for real-time chunks
async for chunk in client.stream_generator("Tell me a story"):
    data = json.loads(chunk)
    print(data["choices"][0]["delta"].get("content", ""), end="")
```

### Structured Output

Get JSON output matching a schema.

#### Node.js

```typescript
const schema = {
  type: 'object',
  properties: {
    make: { type: 'string' },
    model: { type: 'string' },
    year: { type: 'integer' },
    horsepower: { type: 'integer' },
  },
  required: ['make', 'model', 'year'],
};

const result = await client.structure(
  'Extract info: The 2024 Tesla Model S has 670 horsepower',
  schema
);

console.log('Parsed:', result.parsed);
// { make: 'Tesla', model: 'Model S', year: 2024, horsepower: 670 }
```

#### Python

```python
schema = {
    "type": "object",
    "properties": {
        "make": {"type": "string"},
        "model": {"type": "string"},
        "year": {"type": "integer"},
        "horsepower": {"type": "integer"},
    },
    "required": ["make", "model", "year"],
}

result = await client.structure(
    "Extract info: The 2024 Tesla Model S has 670 horsepower",
    schema
)

print(f"Parsed: {result['parsed']}")
# {'make': 'Tesla', 'model': 'Model S', 'year': 2024, 'horsepower': 670}
```

### Tool Calling

Execute functions based on model decisions.

#### Node.js

```typescript
const result = await client.toolCall('What is the weather in San Francisco?');

if (result.tool_calls) {
  for (const tool of result.tool_calls) {
    console.log(`Tool: ${tool.function}`);
    console.log(`Arguments:`, tool.arguments);
    console.log(`Result:`, tool.result);
  }
}
```

#### Python

```python
result = await client.tool_call("What is the weather in San Francisco?")

if result.get("tool_calls"):
    for tool in result["tool_calls"]:
        print(f"Tool: {tool['function']}")
        print(f"Arguments: {tool['arguments']}")
        print(f"Result: {tool['result']}")
```

### Multi-turn Conversation

Maintain context across multiple turns.

#### Node.js

```typescript
const messages = [
  { role: 'user', content: 'My name is Alice.' },
  { role: 'assistant', content: 'Hello Alice!' },
  { role: 'user', content: 'What is my name?' },
];

const result = await client.conversation(messages);
console.log('Response:', result.assistant_message?.content);
// Should remember the name is Alice
```

#### Python

```python
messages = [
    {"role": "user", "content": "My name is Alice."},
    {"role": "assistant", "content": "Hello Alice!"},
    {"role": "user", "content": "What is my name?"},
]

result = await client.conversation(messages)
print(f"Response: {result['assistant_message']['content']}")
# Should remember the name is Alice
```

## Features

### CLI Operations

- `chat`: Send a chat message
- `stream`: Stream a response
- `structure`: Get structured JSON output
- `tool-call`: Execute with function calling
- `json`: Get JSON object response
- `health`: Check SDK health

### Agent Operations

- `invoke('chat', params)`: Programmatic chat
- `invoke('stream', params)`: Programmatic streaming
- `invoke('structure', params)`: Programmatic structured output
- `invoke('health')`: Health check

### Dev Tools

- `createDebugClient()`: Client with verbose logging
- `inspectRequest()`: Preview API request
- `mockResponse()`: Create mock responses for testing
- `showConfig()`: Display SDK configuration
- `validateEnvironment()`: Check setup

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Gemini API key | Yes |
| `LOG_LEVEL` | Logging level (DEBUG, INFO, WARN, ERROR) | No |

### Client Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `apiKey` | string | API key (overrides env) | - |
| `model` | string | Default model type | 'flash' |
| `systemPrompt` | string | System prompt | Built-in |
| `loggerInstance` | Logger | Custom logger | - |

## CLI Usage

### Node.js

```bash
gemini-openai chat "Hello, world!"
gemini-openai chat -m pro "Explain quantum computing"
gemini-openai stream "Tell me a story"
gemini-openai health
gemini-openai config
```

### Python

```bash
gemini-openai chat "Hello, world!"
gemini-openai chat -m pro "Explain quantum computing"
gemini-openai stream "Tell me a story"
gemini-openai health
gemini-openai config
```

## Error Handling

All methods return a consistent response object:

```typescript
interface Response {
  success: boolean;
  content?: string;
  error?: string;
  // ... other fields
}
```

Check `success` before accessing other fields:

```typescript
const result = await client.chat('Hello');
if (result.success) {
  // Use result.content
} else {
  console.error('Error:', result.error);
}
```
