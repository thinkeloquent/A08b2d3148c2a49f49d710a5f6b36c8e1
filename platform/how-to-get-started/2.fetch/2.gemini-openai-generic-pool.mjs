/**
 * Gemini OpenAI-Compatible Generic Pool Example
 *
 * Uses fetch_undici Pool for efficient connection reuse with Gemini's OpenAI-compatible endpoint.
 * Demonstrates singleton pattern for connection management.
 *
 * Run: node 2.gemini-openai-generic-pool.mjs
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

const { createPool } = await import(join(ROOT_DIR, 'packages_mjs/fetch_undici/dist/index.js'));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

// Gemini OpenAI-compatible endpoint
const ORIGIN = 'https://generativelanguage.googleapis.com';
const CHAT_PATH = '/v1beta/openai/chat/completions';

// Singleton pool instance
let poolInstance = null;

function getPool() {
  if (!poolInstance) {
    poolInstance = createPool(ORIGIN, {
      connections: 100,
      pipelining: 1,
      keepAliveTimeout: 60000,
      keepAliveMaxTimeout: 60000,
    });
  }
  return poolInstance;
}

async function closePool() {
  if (poolInstance) {
    await poolInstance.close();
    poolInstance = null;
  }
}

async function chatCompletion(messages, options = {}) {
  const pool = getPool();

  const payload = {
    model: options.model || 'gemini-2.0-flash',
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 1000,
    ...options,
  };

  const response = await pool.request({
    path: CHAT_PATH,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GEMINI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.body.text();

  if (response.statusCode >= 400) {
    throw new Error(`${response.statusCode}: ${text}`);
  }

  return JSON.parse(text);
}

async function main() {
  console.log('='.repeat(60));
  console.log('Gemini OpenAI-Compatible Generic Pool Example');
  console.log('='.repeat(60));
  console.log();

  console.log(`Origin: ${ORIGIN}`);
  console.log(`Endpoint: ${CHAT_PATH}`);
  console.log();

  // Example 1: Simple chat completion
  console.log('--- Example 1: Simple Chat Completion ---');
  try {
    const response = await chatCompletion([
      { role: 'user', content: 'Say "Hello from Gemini Pool!" in exactly 5 words.' }
    ], { temperature: 0.7, max_tokens: 50 });

    console.log('Model:', response.model);
    console.log('Response:', response.choices[0].message.content);
    console.log('Finish reason:', response.choices[0].finish_reason);
    if (response.usage) {
      console.log('Usage:', response.usage);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 2: JSON mode
  console.log('--- Example 2: JSON Mode ---');
  try {
    const response = await chatCompletion([
      { role: 'user', content: 'Return a JSON object with keys: name, status, timestamp' }
    ], {
      response_format: { type: 'json_object' },
      temperature: 0
    });

    console.log('Raw response:', response.choices[0].message.content);
    const parsed = JSON.parse(response.choices[0].message.content);
    console.log('Parsed JSON:', parsed);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 3: System message
  console.log('--- Example 3: System Message ---');
  try {
    const response = await chatCompletion([
      { role: 'system', content: 'You are a helpful assistant that responds in haiku format.' },
      { role: 'user', content: 'Describe connection pooling.' }
    ], { temperature: 0.8 });

    console.log('Response:');
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 4: Multi-turn conversation
  console.log('--- Example 4: Multi-turn Conversation ---');
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

  // Example 5: Demonstrate pool reuse
  console.log('--- Example 5: Pool Reuse ---');
  const pool1 = getPool();
  const pool2 = getPool();
  console.log('Same pool instance:', pool1 === pool2);
  console.log();

  // Clean up
  await closePool();
  console.log('Pool closed.');
}

main().catch(console.error);
