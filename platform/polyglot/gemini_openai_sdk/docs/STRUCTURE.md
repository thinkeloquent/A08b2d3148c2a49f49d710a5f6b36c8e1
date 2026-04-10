# Structured Outputs

This document describes the structured output capabilities of the Gemini OpenAI SDK, including JSON mode and JSON Schema enforcement.

## Overview

Structured outputs ensure the model returns data in a specific format. The SDK provides multiple methods:

| Method | Format Enforcement | Validation | Use Case |
|--------|-------------------|------------|----------|
| `structure()` | Strict JSON Schema | Built-in | Exact schema conformance |
| `jsonMode()` | JSON object | None | Flexible JSON output |
| `schemaMapping()` | JSON object | Post-generation | Validate against schema |

## JSON Structured Output

### structure() Method

Enforces strict schema compliance at generation time.

**Python:**
```python
async def structure(
    prompt: str,
    schema: Dict[str, Any],
    model: Optional[str] = None,
) -> ChatResponse
```

**Node.js:**
```javascript
async structure(prompt, schema, options = {})
```

**Example:**
```python
from gemini_openai_sdk import GeminiClient

async def extract_person():
    client = GeminiClient()

    schema = {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "age": {"type": "integer"},
            "email": {"type": "string"}
        },
        "required": ["name", "age"]
    }

    result = await client.structure(
        "Extract info: John Smith, 35, john@email.com",
        schema
    )

    if result.success:
        person = result.parsed
        print(f"Name: {person['name']}, Age: {person['age']}")
```

**Response:**
```javascript
{
  success: true,
  content: '{"name": "John Smith", "age": 35, "email": "john@email.com"}',
  model: "gemini-2.0-flash",
  parsed: {
    name: "John Smith",
    age: 35,
    email: "john@email.com"
  },
  schema: { ... },  // Echo of input schema
  usage: {
    prompt_tokens: 20,
    completion_tokens: 15,
    total_tokens: 35
  },
  execution_time_ms: 850
}
```

### jsonMode() Method

Returns JSON without schema enforcement.

**Python:**
```python
async def json_mode(
    prompt: str,
    model: Optional[str] = None,
) -> ChatResponse
```

**Node.js:**
```javascript
async jsonMode(prompt, options = {})
```

**Example:**
```javascript
const result = await client.jsonMode(
  'Create a JSON object with name, age, and hobbies for a fictional person'
);

if (result.success) {
  console.log(result.parsed);
  // { name: "Alice", age: 28, hobbies: ["reading", "hiking"] }
}
```

## YAML to JSON Conversion

The SDK can handle YAML input and convert it to JSON output.

### Prompt-Based Conversion

```python
async def yaml_to_json():
    client = GeminiClient()

    yaml_content = """
    name: John Doe
    age: 30
    address:
      street: 123 Main St
      city: Boston
      state: MA
    skills:
      - Python
      - JavaScript
      - SQL
    """

    schema = {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "age": {"type": "integer"},
            "address": {
                "type": "object",
                "properties": {
                    "street": {"type": "string"},
                    "city": {"type": "string"},
                    "state": {"type": "string"}
                }
            },
            "skills": {
                "type": "array",
                "items": {"type": "string"}
            }
        }
    }

    result = await client.structure(
        f"Convert this YAML to JSON:\n\n{yaml_content}",
        schema
    )

    if result.success:
        json_data = result.parsed
        print(json.dumps(json_data, indent=2))
```

### Helper Function for YAML Conversion

```python
import yaml

async def convert_yaml_to_json(yaml_string: str, schema: dict = None):
    """Convert YAML string to validated JSON using Gemini."""
    client = GeminiClient()

    # If no schema provided, use flexible JSON mode
    if schema is None:
        result = await client.json_mode(
            f"Convert this YAML to equivalent JSON:\n\n{yaml_string}"
        )
    else:
        result = await client.structure(
            f"Convert this YAML to JSON matching the schema:\n\n{yaml_string}",
            schema
        )

    if result.success:
        return result.parsed
    else:
        raise ValueError(f"Conversion failed: {result.error}")
```

```javascript
// Node.js version
async function convertYamlToJson(yamlString, schema = null) {
  const client = new GeminiClient();

  let result;
  if (schema === null) {
    result = await client.jsonMode(
      `Convert this YAML to equivalent JSON:\n\n${yamlString}`
    );
  } else {
    result = await client.structure(
      `Convert this YAML to JSON matching the schema:\n\n${yamlString}`,
      schema
    );
  }

  if (result.success) {
    return result.parsed;
  }
  throw new Error(`Conversion failed: ${result.error}`);
}
```

## Schema Patterns

### Basic Object Schema

```javascript
const personSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    age: { type: 'integer', minimum: 0, maximum: 150 }
  },
  required: ['firstName', 'lastName']
};
```

### Nested Objects

```javascript
const addressSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        contact: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            phone: { type: 'string' }
          }
        }
      }
    }
  }
};
```

### Arrays

```javascript
const listSchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          price: { type: 'number' }
        },
        required: ['id', 'name']
      },
      minItems: 1,
      maxItems: 100
    }
  }
};
```

### Enums and Constants

```javascript
const statusSchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['pending', 'approved', 'rejected']
    },
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'critical']
    }
  }
};
```

### Union Types (oneOf)

```javascript
const responseSchema = {
  type: 'object',
  properties: {
    result: {
      oneOf: [
        { type: 'string' },
        { type: 'number' },
        {
          type: 'object',
          properties: {
            value: { type: 'string' },
            confidence: { type: 'number' }
          }
        }
      ]
    }
  }
};
```

## Common Use Cases

### 1. Data Extraction

```python
schema = {
    "type": "object",
    "properties": {
        "entities": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "type": {"type": "string", "enum": ["person", "organization", "location"]},
                    "context": {"type": "string"}
                }
            }
        }
    }
}

result = await client.structure(
    f"Extract all named entities from this text:\n\n{article_text}",
    schema
)
```

### 2. Sentiment Analysis

```python
schema = {
    "type": "object",
    "properties": {
        "sentiment": {
            "type": "string",
            "enum": ["positive", "negative", "neutral", "mixed"]
        },
        "confidence": {
            "type": "number",
            "minimum": 0,
            "maximum": 1
        },
        "aspects": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "aspect": {"type": "string"},
                    "sentiment": {"type": "string"}
                }
            }
        }
    }
}

result = await client.structure(
    f"Analyze the sentiment of this review:\n\n{review_text}",
    schema
)
```

### 3. Content Classification

```javascript
const schema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['technology', 'business', 'science', 'sports', 'entertainment']
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 5
    },
    summary: {
      type: 'string',
      maxLength: 200
    }
  },
  required: ['category', 'tags', 'summary']
};

const result = await client.structure(
  `Classify this article:\n\n${articleContent}`,
  schema
);
```

### 4. Form Data Parsing

```python
schema = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "phone": {"type": "string"},
        "message": {"type": "string"},
        "preferredContact": {
            "type": "string",
            "enum": ["email", "phone", "either"]
        }
    },
    "required": ["name", "email", "message"]
}

result = await client.structure(
    f"Parse this contact form submission:\n\n{form_text}",
    schema
)
```

## Error Handling

### Schema Validation Errors

```python
result = await client.structure(prompt, schema)

if not result.success:
    print(f"API Error: {result.error}")
elif result.parsed is None:
    print("Failed to parse JSON from response")
else:
    # Success - use result.parsed
    process_data(result.parsed)
```

### Handling Malformed JSON

```javascript
const result = await client.structure(prompt, schema);

if (result.success) {
  if (result.parsed) {
    processData(result.parsed);
  } else {
    // Raw content available but not valid JSON
    console.log('Raw response:', result.content);
    // Try manual extraction
    const extracted = extractJSON(result.content);
  }
}
```

## Best Practices

### 1. Provide Clear Descriptions

```javascript
const schema = {
  type: 'object',
  properties: {
    sentiment: {
      type: 'string',
      enum: ['positive', 'negative', 'neutral'],
      description: 'Overall emotional tone of the text'
    },
    confidence: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      description: 'Confidence score from 0 (uncertain) to 1 (certain)'
    }
  }
};
```

### 2. Use Reasonable Constraints

```javascript
// Good: Reasonable limits
const schema = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 10
    }
  }
};

// Avoid: Overly restrictive
const badSchema = {
  type: 'object',
  properties: {
    description: {
      type: 'string',
      minLength: 100,  // Too specific
      maxLength: 105   // Hard to satisfy
    }
  }
};
```

### 3. Handle Optional Fields

```python
schema = {
    "type": "object",
    "properties": {
        "required_field": {"type": "string"},
        "optional_field": {"type": "string"}
    },
    "required": ["required_field"]  # Only required_field is mandatory
}

result = await client.structure(prompt, schema)

# Always check for optional fields
optional_value = result.parsed.get("optional_field", "default")
```

### 4. Validate After Parsing

```python
from jsonschema import validate, ValidationError

result = await client.structure(prompt, schema)

if result.parsed:
    try:
        validate(instance=result.parsed, schema=schema)
        process_validated_data(result.parsed)
    except ValidationError as e:
        log_validation_error(e)
        handle_partial_data(result.parsed)
```

## Related Documentation

- [SCHEMA_MAPPING.md](./SCHEMA_MAPPING.md) - Post-generation validation
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API reference
- [SDK_GUIDE.md](./SDK_GUIDE.md) - General SDK usage guide
