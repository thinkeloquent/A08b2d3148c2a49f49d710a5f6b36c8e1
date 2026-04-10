/**
 * Gemini OpenAI-Compatible Basic Example
 *
 * Uses fetch_undici to call Gemini's OpenAI-compatible endpoint.
 * Demonstrates basic chat completion with health check.
 *
 * Run: node 1.fetch-providers-gemini-openai.mjs
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

// Gemini OpenAI-compatible endpoints
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';
const MODELS_ENDPOINT = `${BASE_URL}/models`;
const CHAT_ENDPOINT = `${BASE_URL}/chat/completions`;

async function healthCheck() {
  console.log('='.repeat(60));
  console.log('Health Check: List Models');
  console.log('='.repeat(60));
  console.log();

  const { statusCode, body } = await request(MODELS_ENDPOINT, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${GEMINI_API_KEY}`,
    },
  });

  const text = await body.text();

  if (statusCode >= 400) {
    console.error('Error:', statusCode, text);
    return false;
  }

  const data = JSON.parse(text);
  console.log('Status:', statusCode);
  console.log('Models available:', data.data?.length || 0);

  if (data.data && data.data.length > 0) {
    console.log('First 5 models:');
    data.data.slice(0, 5).forEach(m => console.log('  -', m.id));
  }

  return true;
}

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

async function main() {
  // Health check
  const healthy = await healthCheck();
  if (!healthy) {
    console.error('Health check failed');
    process.exit(1);
  }
  console.log();

  // Example 1: Simple chat
  console.log('='.repeat(60));
  console.log('Example 1: Simple Chat Completion');
  console.log('='.repeat(60));
  console.log();

  try {
    const response = await chatCompletion([
      { role: 'user', content: 'Say "Hello from Gemini!" in exactly 4 words.' }
    ], { temperature: 0.7, max_tokens: 50 });

    console.log('Model:', response.model);
    console.log('Response:', response.choices[0].message.content);
    console.log('Finish Reason:', response.choices[0].finish_reason);
    if (response.usage) {
      console.log('Usage:', response.usage);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 2: System message
  console.log('='.repeat(60));
  console.log('Example 2: System Message');
  console.log('='.repeat(60));
  console.log();

  try {
    const response = await chatCompletion([
      { role: 'system', content: 'You are a helpful assistant that responds in haiku format.' },
      { role: 'user', content: 'Describe programming.' }
    ], { temperature: 0.8 });

    console.log('Response:');
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 3: Multi-turn conversation
  console.log('='.repeat(60));
  console.log('Example 3: Multi-turn Conversation');
  console.log('='.repeat(60));
  console.log();

  try {
    const response = await chatCompletion([
      { role: 'user', content: 'My name is Alice.' },
      { role: 'assistant', content: 'Hello Alice! Nice to meet you.' },
      { role: 'user', content: 'What is my name?' }
    ], { temperature: 0 });

    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 4: JSON mode
  console.log('='.repeat(60));
  console.log('Example 4: JSON Mode');
  console.log('='.repeat(60));
  console.log();

  try {
    const response = await chatCompletion([
      { role: 'user', content: 'Return a JSON object with keys: name, age, city' }
    ], {
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    console.log('Raw:', response.choices[0].message.content);
    const parsed = JSON.parse(response.choices[0].message.content);
    console.log('Parsed:', parsed);
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log();
  console.log('='.repeat(60));
  console.log('Examples Complete');
  console.log('='.repeat(60));
}

main().catch(console.error);
