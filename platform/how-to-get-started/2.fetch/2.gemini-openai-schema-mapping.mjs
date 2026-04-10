/**
 * Gemini OpenAI-Compatible Schema Mapping Example
 *
 * Uses fetch_undici to demonstrate JSON schema validation and structured outputs
 * with Gemini's OpenAI-compatible endpoint.
 *
 * Run: node 2.gemini-openai-schema-mapping.mjs
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

const { request } = await import(join(ROOT_DIR, 'packages_mjs/fetch_undici/dist/index.js'));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

// Gemini OpenAI-compatible endpoint
const CHAT_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

async function chatCompletion(messages, options = {}) {
  const payload = {
    model: options.model || 'gemini-2.0-flash',
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 1000,
    ...options,
  };

  const { statusCode, body } = await request(CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GEMINI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await body.text();

  if (statusCode >= 400) {
    throw new Error(`${statusCode}: ${text}`);
  }

  return JSON.parse(text);
}

// Helper to extract JSON from response content
function extractJSON(content) {
  if (!content) return null;

  // Try direct parse
  try {
    return JSON.parse(content);
  } catch (e) {
    // Continue to other methods
  }

  // Try extracting from markdown code block
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {
      // Continue
    }
  }

  // Try finding JSON object in text
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      // Continue
    }
  }

  return null;
}

// Simple schema validator
function validateSchema(data, schema) {
  const errors = [];

  if (schema.type === 'object' && typeof data !== 'object') {
    errors.push('Expected object');
    return { valid: false, errors };
  }

  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in data) {
        const value = data[key];
        if (propSchema.type === 'string' && typeof value !== 'string') {
          errors.push(`${key} should be string`);
        }
        if (propSchema.type === 'number' && typeof value !== 'number') {
          errors.push(`${key} should be number`);
        }
        if (propSchema.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`${key} should be boolean`);
        }
        if (propSchema.type === 'array' && !Array.isArray(value)) {
          errors.push(`${key} should be array`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

async function main() {
  console.log('='.repeat(60));
  console.log('Gemini OpenAI-Compatible Schema Mapping Examples');
  console.log('='.repeat(60));
  console.log();

  // Example 1: Basic JSON mode
  console.log('--- Example 1: Basic JSON Mode ---');
  try {
    const response = await chatCompletion([
      { role: 'user', content: 'Generate a user profile with name, email, and age in JSON format.' }
    ], {
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const content = response.choices[0].message.content;
    console.log('Raw response:', content);
    const parsed = extractJSON(content);
    console.log('Parsed JSON:', parsed);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 2: Structured output with schema
  console.log('--- Example 2: Structured Output with Schema ---');
  const weatherSchema = {
    type: 'object',
    properties: {
      city: { type: 'string' },
      temperature: { type: 'number' },
      conditions: { type: 'string' },
      humidity: { type: 'number' },
    },
    required: ['city', 'temperature', 'conditions'],
  };

  try {
    const response = await chatCompletion([
      { role: 'system', content: 'Return ONLY valid JSON matching the schema. No explanation.' },
      { role: 'user', content: 'Generate a weather report for Seattle.' }
    ], {
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'WeatherReport',
          schema: weatherSchema,
          strict: true,
        },
      },
      temperature: 0,
    });

    const content = response.choices[0].message.content;
    console.log('Raw response:', content);
    const parsed = extractJSON(content);
    console.log('Parsed JSON:', parsed);

    // Validate against schema
    const validation = validateSchema(parsed, weatherSchema);
    console.log('Schema validation:', validation.valid ? 'PASSED' : 'FAILED');
    if (!validation.valid) {
      console.log('Errors:', validation.errors);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 3: Array response
  console.log('--- Example 3: Array Response ---');
  try {
    const response = await chatCompletion([
      { role: 'user', content: 'List 3 programming languages with their year created as JSON array. Each item should have "name" and "year" fields.' }
    ], {
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const content = response.choices[0].message.content;
    console.log('Raw response:', content);
    const parsed = extractJSON(content);
    console.log('Parsed JSON:', parsed);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 4: Nested object schema
  console.log('--- Example 4: Nested Object Schema ---');
  const bookSchema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      author: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          birthYear: { type: 'number' },
        },
        required: ['name'],
      },
      genres: { type: 'array' },
      rating: { type: 'number' },
    },
    required: ['title', 'author'],
  };

  try {
    const response = await chatCompletion([
      { role: 'system', content: 'Return ONLY valid JSON. No markdown, no explanation.' },
      { role: 'user', content: 'Generate a book entry for "1984" by George Orwell with genres and rating.' }
    ], {
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const content = response.choices[0].message.content;
    console.log('Raw response:', content);
    const parsed = extractJSON(content);
    console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 5: Schema format reference
  console.log('--- Example 5: OpenAI Response Format Reference ---');
  console.log(`
┌─────────────────────────────────────────────────────────────────┐
│                   OPENAI RESPONSE FORMAT OPTIONS                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. JSON Mode (basic):                                           │
│    response_format: { type: "json_object" }                     │
│                                                                 │
│ 2. JSON Schema (structured):                                    │
│    response_format: {                                           │
│      type: "json_schema",                                       │
│      json_schema: {                                             │
│        name: "SchemaName",                                      │
│        schema: {                                                │
│          type: "object",                                        │
│          properties: { ... },                                   │
│          required: [ ... ]                                      │
│        },                                                       │
│        strict: true                                             │
│      }                                                          │
│    }                                                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ JSON Schema Types:                                              │
│ • "string" - Text values                                        │
│ • "number" - Numeric values (int or float)                      │
│ • "boolean" - true/false                                        │
│ • "array" - List of items                                       │
│ • "object" - Nested objects                                     │
│ • "null" - Null value                                           │
└─────────────────────────────────────────────────────────────────┘
`);

  console.log('='.repeat(60));
  console.log('Schema Mapping Examples Complete');
  console.log('='.repeat(60));
}

main().catch(console.error);
