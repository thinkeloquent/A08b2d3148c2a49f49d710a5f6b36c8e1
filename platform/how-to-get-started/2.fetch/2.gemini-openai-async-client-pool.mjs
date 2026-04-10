/**
 * Gemini OpenAI-Compatible Connection Pool Example
 *
 * Uses fetch_undici Pool for connection reuse with Gemini's OpenAI-compatible endpoint.
 *
 * Run: node 2.gemini-openai-async-client-pool.mjs
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
const ORIGIN = 'https://generativelanguage.googleapis.com';
const CHAT_PATH = '/v1beta/openai/chat/completions';

async function main() {
  console.log('='.repeat(60));
  console.log('Gemini OpenAI-Compatible Connection Pool Example');
  console.log('='.repeat(60));
  console.log();

  // Create connection pool with optimized settings
  const pool = new Pool(ORIGIN, {
    connections: 10,           // Max connections
    pipelining: 1,             // Pipelining depth
    keepAliveTimeout: 60000,   // 60s keepalive
    keepAliveMaxTimeout: 60000,
  });

  console.log('Origin:', ORIGIN);
  console.log('Path:', CHAT_PATH);
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
      { role: 'user', content: 'Say "Hello from Pool!" in exactly 4 words.' }
    ], { temperature: 0.7, max_tokens: 50 });

    console.log('Status: 200');
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
      { role: 'user', content: 'Return a JSON object with keys: client_type, pool_enabled, http2' }
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

  // Example 3: System message with conversation
  console.log('--- Example 3: System Message ---');
  try {
    const response = await chatCompletion([
      { role: 'system', content: 'You are a helpful assistant that explains technical concepts simply.' },
      { role: 'user', content: 'Explain HTTP/2 connection pooling in one sentence.' }
    ], { temperature: 0.5, max_tokens: 100 });

    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 4: Multi-turn conversation
  console.log('--- Example 4: Multi-turn Conversation ---');
  try {
    const response = await chatCompletion([
      { role: 'user', content: 'Remember: the secret code is ALPHA-7.' },
      { role: 'assistant', content: 'Got it! I will remember that the secret code is ALPHA-7.' },
      { role: 'user', content: 'What is the secret code?' }
    ], { temperature: 0 });

    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 5: Multiple requests (demonstrates pool reuse)
  console.log('--- Example 5: Parallel Requests (Pool Reuse) ---');
  try {
    const requests = [
      chatCompletion([{ role: 'user', content: 'What is 2+2?' }], { max_tokens: 10 }),
      chatCompletion([{ role: 'user', content: 'What is 3+3?' }], { max_tokens: 10 }),
      chatCompletion([{ role: 'user', content: 'What is 4+4?' }], { max_tokens: 10 }),
    ];

    const results = await Promise.all(requests);
    results.forEach((r, i) => {
      console.log(`Request ${i + 1}:`, r.choices[0].message.content.trim());
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Clean up
  await pool.close();
  console.log('Pool closed.');
}

main().catch(console.error);
