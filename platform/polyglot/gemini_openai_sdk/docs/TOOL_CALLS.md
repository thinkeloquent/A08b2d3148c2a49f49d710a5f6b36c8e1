# Tool Calls (Function Calling)

This document describes the tool calling (function calling) capabilities of the Gemini OpenAI SDK.

## Overview

Tool calling enables the model to invoke external functions during a conversation. The SDK provides:

- OpenAI-compatible tool definitions
- Automatic tool execution
- Custom tool registration
- Tool result handling

## Architecture

```
User Prompt
    │
    ▼
┌──────────────────────────────────────┐
│         GeminiClient.toolCall()       │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│           Gemini API                  │
│    (Determines which tools to call)   │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│        processToolCalls()             │
│    (Parses and executes tools)        │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│        Tool Executors                 │
│   (executeWeather, executeCalculate)  │
└───────────────┬──────────────────────┘
                │
                ▼
           Tool Results
```

## API Reference

### Python

```python
async def tool_call(
    prompt: str,
    tools: Optional[List[Dict[str, Any]]] = None,
    model: Optional[str] = None,
) -> ChatResponse
```

### Node.js

```javascript
async toolCall(prompt, options = {})

// Options:
// - tools: Custom tool definitions (uses defaults if not provided)
// - model: Model type override
```

## Tool Definition Format

Tools follow the OpenAI function calling format:

```javascript
const weatherTool = {
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get the current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g., San Francisco, CA'
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'Temperature unit'
        }
      },
      required: ['location']
    }
  }
};
```

## Response Structure

```javascript
{
  success: true,
  model: "gemini-2.0-flash",
  finish_reason: "tool_calls",
  content: null,  // null when tools are called
  tool_calls: [
    {
      tool_call_id: "call_abc123",
      function_name: "get_weather",
      arguments: {
        location: "San Francisco, CA",
        unit: "celsius"
      },
      result: {
        location: "San Francisco, CA",
        temperature: 22,
        unit: "celsius",
        conditions: "sunny",
        humidity: 45
      }
    }
  ],
  execution_time_ms: 1150
}
```

## Built-in Tools

### Weather Tool

```javascript
// Definition
{
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get the current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City and state' },
        unit: { type: 'string', enum: ['celsius', 'fahrenheit'] }
      },
      required: ['location']
    }
  }
}

// Returns simulated weather data:
{
  location: "San Francisco, CA",
  temperature: 22,  // or 72 for fahrenheit
  unit: "celsius",
  conditions: "sunny",
  humidity: 45
}
```

### Calculator Tool

```javascript
// Definition
{
  type: 'function',
  function: {
    name: 'calculate',
    description: 'Perform a mathematical calculation',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'The mathematical expression to evaluate'
        }
      },
      required: ['expression']
    }
  }
}

// Returns:
{
  expression: "2 + 2 * 3",
  result: 8
}
```

## Usage Examples

### Python - Basic Tool Call

```python
from gemini_openai_sdk import GeminiClient

async def check_weather():
    client = GeminiClient()

    result = await client.tool_call("What's the weather in Tokyo?")

    if result.success:
        for tool in result.tool_calls:
            print(f"Called: {tool.function_name}")
            print(f"Args: {tool.arguments}")
            print(f"Result: {tool.result}")
```

### Node.js - Basic Tool Call

```javascript
import { GeminiClient } from 'gemini-openai-sdk';

async function checkWeather() {
  const client = new GeminiClient();

  const result = await client.toolCall("What's the weather in Tokyo?");

  if (result.success) {
    for (const tool of result.tool_calls) {
      console.log('Called:', tool.function_name);
      console.log('Args:', tool.arguments);
      console.log('Result:', tool.result);
    }
  }
}
```

### Custom Tools

```python
from gemini_openai_sdk import GeminiClient
from gemini_openai_sdk.tools import register_tool

# Define custom tool executor
def search_database(args):
    query = args.get('query', '')
    # Your database search logic here
    return {"results": [...], "count": 5}

# Register the tool
register_tool('search_database', search_database)

# Define tool for API
search_tool = {
    "type": "function",
    "function": {
        "name": "search_database",
        "description": "Search the product database",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query"
                },
                "limit": {
                    "type": "integer",
                    "description": "Max results",
                    "default": 10
                }
            },
            "required": ["query"]
        }
    }
}

# Use custom tool
async def search():
    client = GeminiClient()
    result = await client.tool_call(
        "Find products matching 'laptop'",
        tools=[search_tool]
    )
```

### Node.js - Custom Tools

```javascript
import { GeminiClient, registerTool } from 'gemini-openai-sdk';

// Define custom tool executor
function searchDatabase(args) {
  const { query, limit = 10 } = args;
  // Your database search logic here
  return { results: [], count: 0 };
}

// Register the tool
registerTool('search_database', searchDatabase);

// Define tool for API
const searchTool = {
  type: 'function',
  function: {
    name: 'search_database',
    description: 'Search the product database',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'integer', description: 'Max results', default: 10 }
      },
      required: ['query']
    }
  }
};

// Use custom tool
async function search() {
  const client = new GeminiClient();
  const result = await client.toolCall(
    "Find products matching 'laptop'",
    { tools: [searchTool] }
  );
}
```

## Tool Registration API

### Python

```python
from gemini_openai_sdk.tools import (
    register_tool,
    execute_tool,
    get_available_tools,
    process_tool_calls
)

# Register a tool
register_tool('my_tool', my_executor_function)

# Execute a tool manually
result = execute_tool('my_tool', {'arg': 'value'})

# Get registered tools
tools = get_available_tools()  # ['get_weather', 'calculate', 'my_tool']

# Process raw tool calls from API
results = process_tool_calls(tool_calls_from_api)
```

### Node.js

```javascript
import {
  registerTool,
  executeTool,
  getAvailableTools,
  processToolCalls
} from 'gemini-openai-sdk/tools';

// Register a tool
registerTool('my_tool', myExecutorFunction);

// Execute a tool manually
const result = executeTool('my_tool', { arg: 'value' });

// Get registered tools
const tools = getAvailableTools();  // ['get_weather', 'calculate', 'my_tool']

// Process raw tool calls from API
const results = processToolCalls(toolCallsFromApi);
```

## Security Considerations

### Calculator Safety

The built-in calculator uses safe evaluation:

```javascript
// Only allows: 0-9, +, -, *, /, ., (, ), space
const allowedChars = new Set('0123456789+-*/.() ');

// Rejects unsafe expressions
executeCalculate({ expression: 'require("fs")' });
// Returns: { expression: '...', error: 'Invalid expression - unsafe characters' }
```

### Custom Tool Security

When implementing custom tools:

1. **Validate all inputs**
2. **Sanitize user-provided data**
3. **Limit resource access**
4. **Log all tool executions**

```python
def secure_tool(args):
    # Validate required fields
    if 'query' not in args:
        return {"error": "query is required"}

    # Sanitize input
    query = sanitize(args['query'])

    # Rate limit
    if rate_limit_exceeded():
        return {"error": "Rate limit exceeded"}

    # Execute with limited permissions
    return execute_safely(query)
```

## Error Handling

### Tool Execution Errors

```python
result = await client.tool_call("Calculate: 1/0")

for tool in result.tool_calls:
    if 'error' in tool.result:
        print(f"Tool error: {tool.result['error']}")
```

### Unknown Tool Errors

```javascript
// If model calls unregistered tool
{
  tool_call_id: "call_xyz",
  function_name: "unknown_function",
  arguments: {},
  result: {
    error: "Unknown function: unknown_function"
  }
}
```

### API Errors

```python
result = await client.tool_call("Hello")

if not result.success:
    print(f"API Error: {result.error}")
```

## Best Practices

1. **Clear Descriptions**: Write detailed tool descriptions for better model selection
2. **Specific Parameters**: Use strict parameter schemas with descriptions
3. **Error Handling**: Always check for errors in tool results
4. **Logging**: Log tool calls for debugging and auditing
5. **Timeout Handling**: Set appropriate timeouts for long-running tools

## Related Documentation

- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API reference
- [SDK_GUIDE.md](./SDK_GUIDE.md) - General SDK usage guide
- [STRUCTURE.md](./STRUCTURE.md) - Structured outputs
