/**
 * Gemini OpenAI-Compatible Structured Output Example
 *
 * Uses fetch_undici to call Gemini's OpenAI-compatible endpoint with JSON schema.
 *
 * Run: node 1.fetch-providers-gemini-openai-structure.mjs
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
const OPENAI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

// JSON schema for structured output
const schema = {
  type: 'object',
  properties: {
    city: { type: 'string' },
    tempF: { type: 'number' },
    summary: { type: 'string' },
  },
  required: ['city', 'tempF', 'summary'],
  additionalProperties: false,
};

// OpenAI-compatible request payload
const payload = {
  model: 'gemini-2.0-flash',
  messages: [
    { role: 'system', content: 'Return ONLY valid JSON matching the schema.' },
    { role: 'user', content: 'Generate a sample weather report for Boston.' },
  ],
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'WeatherReport',
      schema,
      strict: true,
    },
  },
};

async function main() {
  console.log('='.repeat(60));
  console.log('Gemini OpenAI-Compatible Structured Output');
  console.log('='.repeat(60));
  console.log();
  console.log('Endpoint:', OPENAI_ENDPOINT);
  console.log('Model:', payload.model);
  console.log();

  const { statusCode, body } = await request(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GEMINI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await body.text();

  if (statusCode >= 400) {
    console.error('Error:', statusCode, text);
    process.exit(1);
  }

  const data = JSON.parse(text);
  console.log('Status:', statusCode);
  console.log('Model:', data.model);
  console.log('Finish Reason:', data.choices[0].finish_reason);
  console.log();

  const content = data.choices[0].message.content;
  console.log('Raw Response:', content);
  console.log();

  const report = JSON.parse(content);
  console.log('Parsed JSON:', report);

  if (data.usage) {
    console.log();
    console.log('Usage:', data.usage);
  }
}

main().catch(console.error);
