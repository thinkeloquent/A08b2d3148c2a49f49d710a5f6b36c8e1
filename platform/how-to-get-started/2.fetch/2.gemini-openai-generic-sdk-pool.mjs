/**
 * Gemini OpenAI-Compatible Generic SDK Pool Example
 *
 * Uses fetch_undici Pool with a generic factory pattern for connection management.
 * Demonstrates multi-origin pool management with Gemini's OpenAI-compatible endpoint.
 *
 * Run: node 2.gemini-openai-generic-sdk-pool.mjs
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

const { Pool } = await import(join(ROOT_DIR, 'packages_mjs/fetch_undici/dist/index.js'));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

// Gemini OpenAI-compatible endpoint
const GEMINI_ORIGIN = 'https://generativelanguage.googleapis.com';
const CHAT_PATH = '/v1beta/openai/chat/completions';

// Pool registry for multi-origin management
const pools = new Map();

function getPool(origin, options = {}) {
  if (!pools.has(origin)) {
    const pool = new Pool(origin, {
      connections: options.maxConnections || 100,
      pipelining: options.pipelining || 1,
      keepAliveTimeout: options.keepAliveTimeout || 60000,
      keepAliveMaxTimeout: options.keepAliveMaxTimeout || 60000,
    });
    pools.set(origin, pool);
  }
  return pools.get(origin);
}

async function closePool(origin) {
  if (pools.has(origin)) {
    await pools.get(origin).close();
    pools.delete(origin);
  }
}

async function closeAllPools() {
  for (const [origin, pool] of pools) {
    await pool.close();
  }
  pools.clear();
}

function getActivePoolOrigins() {
  return Array.from(pools.keys());
}

async function main() {
  console.log('='.repeat(60));
  console.log('Gemini OpenAI-Compatible Generic SDK Pool Example');
  console.log('='.repeat(60));
  console.log();

  // Get pool for Gemini origin
  const pool = getPool(GEMINI_ORIGIN, {
    maxConnections: 100,
    keepAliveTimeout: 60000,
  });

  console.log(`Origin: ${GEMINI_ORIGIN}`);
  console.log(`Active pools: ${getActivePoolOrigins().join(', ')}`);
  console.log();

  async function chatCompletion(messages, options = {}) {
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

  // Example 1: Simple chat completion
  console.log('--- Example 1: Simple Chat Completion ---');
  try {
    const response = await chatCompletion([
      { role: 'user', content: 'Say "Hello from Generic SDK Pool!" in exactly 6 words.' }
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
      { role: 'user', content: 'Return a JSON object with keys: service, pool_type, active' }
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

  // Example 3: Raw request with custom headers
  console.log('--- Example 3: Raw Request with Custom Headers ---');
  try {
    const rawResponse = await pool.request({
      path: CHAT_PATH,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Custom-Header': 'custom-value'
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        messages: [
          { role: 'user', content: 'What HTTP method is used for creating resources?' }
        ],
        max_tokens: 100
      })
    });

    console.log('Status:', rawResponse.statusCode);
    const text = await rawResponse.body.text();
    const data = JSON.parse(text);
    console.log('Response:', data.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 4: Multi-turn conversation
  console.log('--- Example 4: Multi-turn Conversation ---');
  try {
    const response = await chatCompletion([
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'My favorite number is 42.' },
      { role: 'assistant', content: 'That is a great number! The answer to life, the universe, and everything.' },
      { role: 'user', content: 'What is my favorite number?' }
    ], { temperature: 0 });

    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 5: Demonstrate pool reuse
  console.log('--- Example 5: Pool Reuse (same origin) ---');
  const pool2 = getPool(GEMINI_ORIGIN); // Same origin, returns cached pool
  console.log('Same pool instance:', pool === pool2);
  console.log('Active pool origins:', getActivePoolOrigins());
  console.log();

  // Clean up
  await closeAllPools();
  console.log('All pools closed.');
  console.log('Active pool origins after close:', getActivePoolOrigins());
}

main().catch(console.error);
