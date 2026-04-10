# Gemini OpenAI SDK - API Reference

This document provides the complete API reference for the Gemini OpenAI SDK, showing type signatures and interfaces for both Python and Node.js implementations.

## Core Components

### GeminiClient

The main client class for interacting with the Gemini API using OpenAI-compatible interface.

**Node.js**
```typescript
class GeminiClient {
  constructor(options?: {
    apiKey?: string;
    model?: string;
    systemPrompt?: string;
    loggerInstance?: Logger;
  });

  // Chat completion
  async chat(prompt: string, options?: ChatOptions): Promise<ChatResponse>;

  // Streaming
  async stream(prompt: string, options?: StreamOptions): Promise<StreamResponse>;
  async *streamGenerator(prompt: string, options?: StreamOptions): AsyncGenerator<string>;

  // Structured output
  async structure(prompt: string, schema: object, options?: StructureOptions): Promise<StructureResponse>;

  // Tool calling
  async toolCall(prompt: string, options?: ToolCallOptions): Promise<ToolCallResponse>;

  // JSON mode
  async jsonMode(prompt: string, options?: JsonModeOptions): Promise<JsonModeResponse>;

  // Conversation
  async conversation(messages: Message[], options?: ConversationOptions): Promise<ConversationResponse>;

  // Health check
  healthCheck(): HealthStatus;
}
```

**Python**
```python
class GeminiClient:
    def __init__(
        self,
        api_key: str | None = None,
        model: str = "flash",
        system_prompt: str | None = None,
        logger_instance: Logger | None = None,
    ) -> None: ...

    # Chat completion
    async def chat(
        self,
        prompt: str,
        model: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
        use_system_prompt: bool = True,
    ) -> ChatResponse: ...

    # Streaming
    async def stream(
        self,
        prompt: str,
        model: str | None = None,
        temperature: float | None = None,
    ) -> StreamResponse: ...

    async def stream_generator(
        self,
        prompt: str,
        model: str | None = None,
        temperature: float | None = None,
    ) -> AsyncGenerator[str, None]: ...

    # Structured output
    async def structure(
        self,
        prompt: str,
        schema: dict,
        model: str | None = None,
    ) -> StructureResponse: ...

    # Tool calling
    async def tool_call(
        self,
        prompt: str,
        tools: list | None = None,
        model: str | None = None,
    ) -> ToolCallResponse: ...

    # JSON mode
    async def json_mode(
        self,
        prompt: str,
        model: str | None = None,
    ) -> JsonModeResponse: ...

    # Conversation
    async def conversation(
        self,
        messages: list[dict],
        model: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> ConversationResponse: ...

    # Health check
    def health_check(self) -> HealthStatus: ...
```

### ChatResponse

Response object returned by chat operations.

**Node.js**
```typescript
interface ChatResponse {
  success: boolean;
  content?: string;
  model?: string;
  finish_reason?: string;
  usage?: UsageStats;
  execution_time_ms?: number;
  error?: string;
}
```

**Python**
```python
@dataclass
class ChatResponse:
    success: bool
    content: str | None = None
    model: str | None = None
    finish_reason: str | None = None
    usage: UsageStats | None = None
    execution_time_ms: float | None = None
    error: str | None = None
```

### UsageStats

Token usage statistics.

**Node.js**
```typescript
interface UsageStats {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
```

**Python**
```python
@dataclass
class UsageStats:
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
```

### ToolResult

Result of a tool call execution.

**Node.js**
```typescript
interface ToolResult {
  id: string;
  function: string;
  arguments: object;
  result: any;
}
```

**Python**
```python
@dataclass
class ToolResult:
    id: str
    function: str
    arguments: dict
    result: Any
```

## Logger Module

### create()

Factory function to create an SDK logger instance.

**Node.js**
```typescript
function create(
  packageName: string,
  filename: string,
  loggerInstance?: Logger
): SDKLogger;
```

**Python**
```python
def create(
    package_name: str,
    filename: str,
    logger_instance: logging.Logger | None = None,
) -> SDKLogger: ...
```

### SDKLogger

Logger class with standard log levels.

**Node.js**
```typescript
class SDKLogger {
  debug(message: string, data?: object): void;
  info(message: string, data?: object): void;
  warn(message: string, data?: object): void;
  error(message: string, data?: object, error?: Error): void;
}
```

**Python**
```python
class SDKLogger:
    def debug(self, message: str, data: dict | None = None) -> None: ...
    def info(self, message: str, data: dict | None = None) -> None: ...
    def warn(self, message: str, data: dict | None = None) -> None: ...
    def error(self, message: str, data: dict | None = None, error: Exception | None = None) -> None: ...
```

## Agent Module

### invoke()

Invoke an SDK action by name.

**Node.js**
```typescript
async function invoke(
  action: string,
  params?: object
): Promise<object>;
```

**Python**
```python
async def invoke(
    action: str,
    params: dict | None = None,
) -> dict: ...
```

### Available Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `chat` | Send a chat message | `prompt`, `model`, `temperature`, `max_tokens` |
| `stream` | Stream a response | `prompt`, `model`, `temperature` |
| `structure` | Get structured JSON | `prompt`, `schema`, `model` |
| `tool_call` | Execute with tools | `prompt`, `tools`, `model` |
| `json_mode` | Get JSON response | `prompt`, `model` |
| `conversation` | Multi-turn chat | `messages`, `model`, `temperature` |
| `health` | Health check | None |

## Helper Functions

### getApiKey() / get_api_key()

Get the Gemini API key from environment.

**Node.js**
```typescript
function getApiKey(): string | null;
```

**Python**
```python
def get_api_key() -> str | None: ...
```

### getModel() / get_model()

Resolve model type to full model name.

**Node.js**
```typescript
function getModel(modelType: string | null): string;
```

**Python**
```python
def get_model(model_type: str | None) -> str: ...
```

### extractJSON() / extract_json()

Extract JSON from a string, handling markdown code blocks.

**Node.js**
```typescript
function extractJSON(content: string | null): object | null;
```

**Python**
```python
def extract_json(content: str | None) -> dict | None: ...
```

### validateSchema() / validate_schema()

Validate data against a JSON schema.

**Node.js**
```typescript
function validateSchema(data: object, schema: object): ValidationResult;
```

**Python**
```python
def validate_schema(data: dict, schema: dict) -> ValidationResult: ...
```

## Constants

### MODELS

Available model types and their full names.

**Node.js**
```typescript
const MODELS: {
  flash: string;   // 'gemini-2.0-flash'
  pro: string;     // 'gemini-2.0-pro'
  thinking: string; // 'gemini-2.0-flash-thinking-exp'
};
```

**Python**
```python
MODELS: dict[str, str] = {
    "flash": "gemini-2.0-flash",
    "pro": "gemini-2.0-pro",
    "thinking": "gemini-2.0-flash-thinking-exp",
}
```

### DEFAULTS

Default configuration values.

**Node.js**
```typescript
const DEFAULTS: {
  temperature: number;  // 0.7
  max_tokens: number;   // 1000
  timeout_ms: number;   // 30000
};
```

**Python**
```python
DEFAULTS: dict[str, Any] = {
    "temperature": 0.7,
    "max_tokens": 1000,
    "timeout_ms": 30000,
}
```

## Tool Definitions

### DEFAULT_TOOLS

Built-in tool definitions for function calling.

**Node.js**
```typescript
const DEFAULT_TOOLS: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get the current weather for a location',
      parameters: { ... }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calculate',
      description: 'Perform a mathematical calculation',
      parameters: { ... }
    }
  }
];
```

**Python**
```python
DEFAULT_TOOLS: list[dict] = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a location",
            "parameters": { ... }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "Perform a mathematical calculation",
            "parameters": { ... }
        }
    }
]
```

### registerTool() / register_tool()

Register a custom tool executor.

**Node.js**
```typescript
function registerTool(name: string, executor: (args: object) => any): void;
```

**Python**
```python
def register_tool(name: str, executor: Callable[[dict], Any]) -> None: ...
```
