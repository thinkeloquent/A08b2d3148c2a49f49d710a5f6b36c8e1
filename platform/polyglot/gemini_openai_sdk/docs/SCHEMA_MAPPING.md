# Schema Mapping

This document describes the schema mapping and validation capabilities of the Gemini OpenAI SDK.

## Overview

Schema mapping enables structured JSON output with automatic validation against JSON Schema. The SDK validates model responses against your schema and reports any validation errors.

## Comparison: `schemaMapping()` vs `structure()`

| Feature | `schemaMapping()` | `structure()` |
|---------|------------------|---------------|
| Response format | `json_object` mode | `json_schema` mode (strict) |
| Validation | Post-generation | Built into generation |
| Error handling | Returns validation errors | Model follows schema |
| Flexibility | More flexible | Stricter adherence |
| Use case | Validate existing JSON | Enforce exact schema |

## API Reference

### Python

```python
async def schema_mapping(
    prompt: str,
    schema: Dict[str, Any],
    model: Optional[str] = None,
) -> ChatResponse
```

### Node.js

```javascript
async schemaMapping(prompt, schema, options = {})
```

## Response Structure

```javascript
{
  success: true,
  content: '{"name": "John", "age": 30}',
  model: "gemini-2.0-flash",
  parsed: {
    name: "John",
    age: 30
  },
  schema: { ... },           // Echo of input schema
  validation: {
    valid: true,
    errors: []               // Empty when valid
  },
  usage: {
    prompt_tokens: 15,
    completion_tokens: 20,
    total_tokens: 35
  },
  execution_time_ms: 850
}
```

### Validation Failure Response

```javascript
{
  success: true,             // API call succeeded
  content: '{"name": "John"}',
  parsed: { name: "John" },
  validation: {
    valid: false,
    errors: [
      "'age' is a required property"
    ]
  }
}
```

## Usage Examples

### Python

```python
from gemini_openai_sdk import GeminiClient

async def validate_user_data():
    client = GeminiClient()

    schema = {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "age": {"type": "integer", "minimum": 0},
            "email": {"type": "string", "format": "email"}
        },
        "required": ["name", "age"]
    }

    result = await client.schema_mapping(
        "Extract user info: John Doe, 30 years old, john@example.com",
        schema
    )

    if result.success and result.validation["valid"]:
        user = result.parsed
        print(f"Name: {user['name']}, Age: {user['age']}")
    else:
        print(f"Validation errors: {result.validation['errors']}")
```

### Node.js

```javascript
import { GeminiClient } from 'gemini-openai-sdk';

async function validateUserData() {
  const client = new GeminiClient();

  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'integer', minimum: 0 },
      email: { type: 'string', format: 'email' }
    },
    required: ['name', 'age']
  };

  const result = await client.schemaMapping(
    'Extract user info: John Doe, 30 years old, john@example.com',
    schema
  );

  if (result.success && result.validation.valid) {
    const { name, age } = result.parsed;
    console.log(`Name: ${name}, Age: ${age}`);
  } else {
    console.log('Validation errors:', result.validation.errors);
  }
}
```

## JSON Schema Support

### Basic Types

```javascript
const schema = {
  type: 'object',
  properties: {
    // String with constraints
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },

    // Integer with range
    age: {
      type: 'integer',
      minimum: 0,
      maximum: 150
    },

    // Number with precision
    score: {
      type: 'number',
      minimum: 0,
      maximum: 100
    },

    // Boolean
    active: {
      type: 'boolean'
    },

    // Enum values
    status: {
      type: 'string',
      enum: ['pending', 'approved', 'rejected']
    }
  },
  required: ['name', 'age']
};
```

### Nested Objects

```javascript
const schema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            zip: { type: 'string' }
          },
          required: ['city']
        }
      },
      required: ['name']
    }
  }
};
```

### Arrays

```javascript
const schema = {
  type: 'object',
  properties: {
    // Array of strings
    tags: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 10
    },

    // Array of objects
    users: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' }
        },
        required: ['id', 'name']
      }
    }
  }
};
```

## Validation Error Handling

### Check Validation Status

```python
result = await client.schema_mapping(prompt, schema)

if not result.success:
    # API error
    print(f"API Error: {result.error}")
elif not result.validation["valid"]:
    # Validation failed
    for error in result.validation["errors"]:
        print(f"Validation Error: {error}")
else:
    # Success - use parsed data
    process_data(result.parsed)
```

### Common Validation Errors

| Error | Cause |
|-------|-------|
| `'X' is a required property` | Missing required field |
| `X is not of type 'string'` | Wrong data type |
| `X is less than the minimum` | Number below minimum |
| `X is not one of ['a', 'b']` | Value not in enum |
| `[] is too short` | Array below minItems |

## Best Practices

### 1. Define Clear Schemas

```javascript
// Good: Specific constraints
const schema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address'
    }
  },
  required: ['email'],
  additionalProperties: false  // Reject extra fields
};
```

### 2. Include Descriptions

```javascript
const schema = {
  type: 'object',
  properties: {
    sentiment: {
      type: 'string',
      enum: ['positive', 'negative', 'neutral'],
      description: 'Overall sentiment of the text'
    },
    confidence: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      description: 'Confidence score from 0 to 1'
    }
  }
};
```

### 3. Handle Partial Matches

```python
result = await client.schema_mapping(prompt, schema)

if result.parsed:
    # Use what we got, even if validation failed
    partial_data = result.parsed

    if not result.validation["valid"]:
        # Log validation issues but continue
        log_validation_errors(result.validation["errors"])
```

### 4. Fallback Strategy

```python
async def extract_with_fallback(prompt, strict_schema, loose_schema):
    # Try strict schema first
    result = await client.schema_mapping(prompt, strict_schema)

    if result.validation["valid"]:
        return result.parsed

    # Fall back to looser schema
    result = await client.schema_mapping(prompt, loose_schema)
    return result.parsed
```

## Comparison with JSON Mode

### Schema Mapping (with validation)

```python
result = await client.schema_mapping(prompt, schema)
# Returns: parsed data + validation result
```

### JSON Mode (no schema)

```python
result = await client.json_mode(prompt)
# Returns: parsed JSON, no validation
```

### Structure (strict schema)

```python
result = await client.structure(prompt, schema)
# Returns: model output follows schema exactly
```

## Related Documentation

- [STRUCTURE.md](./STRUCTURE.md) - Structured output with strict schemas
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API reference
- [SDK_GUIDE.md](./SDK_GUIDE.md) - General SDK usage guide
