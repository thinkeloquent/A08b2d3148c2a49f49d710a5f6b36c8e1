/**
 * Gemini OpenAI-Compatible Proxy Pool Example (Manual Proxy Config)
 *
 * Uses undici ProxyAgent with manually configured proxy settings.
 * Demonstrates singleton pattern for proxy connection management.
 *
 * Run: node 3.gemini-openai-proxy-pool-proxy.mjs
 */
import { ProxyAgent } from 'undici';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

// ============================================================
// MANUAL PROXY CONFIGURATION - Edit these values
// ============================================================
const PROXY_CONFIG = {
  url: 'http://127.0.0.1:8080',      // Proxy URL
  username: null,                     // Proxy username (null if no auth)
  password: null,                     // Proxy password (null if no auth)
};
// ============================================================

// Gemini OpenAI-compatible endpoint
const ORIGIN = 'https://generativelanguage.googleapis.com';
const CHAT_PATH = '/v1beta/openai/chat/completions';

// Singleton proxy agent instance
let proxyAgentInstance = null;

function getProxyAgent() {
  if (!proxyAgentInstance) {
    const options = {
      uri: PROXY_CONFIG.url,
      connections: 100,
      pipelining: 1,
      keepAliveTimeout: 60000,
      keepAliveMaxTimeout: 60000,
    };

    // Add proxy authentication if configured
    if (PROXY_CONFIG.username && PROXY_CONFIG.password) {
      options.token = 'Basic ' + Buffer.from(`${PROXY_CONFIG.username}:${PROXY_CONFIG.password}`).toString('base64');
    }

    proxyAgentInstance = new ProxyAgent(options);
  }
  return proxyAgentInstance;
}

async function closeProxyAgent() {
  if (proxyAgentInstance) {
    await proxyAgentInstance.close();
    proxyAgentInstance = null;
  }
}

async function chatCompletion(messages, options = {}) {
  const proxy = getProxyAgent();

  const payload = {
    model: options.model || 'gemini-2.0-flash',
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 1000,
    ...options,
  };

  const response = await proxy.request({
    origin: ORIGIN,
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
  console.log('Gemini OpenAI-Compatible Proxy Pool Example (Manual Config)');
  console.log('='.repeat(60));
  console.log();

  console.log(`Origin: ${ORIGIN}`);
  console.log(`Endpoint: ${CHAT_PATH}`);
  console.log(`Proxy: ${PROXY_CONFIG.url}`);
  console.log(`Proxy Auth: ${PROXY_CONFIG.username ? 'Yes' : 'No'}`);
  console.log();

  // Example 1: Simple chat completion
  console.log('--- Example 1: Simple Chat Completion ---');
  try {
    const response = await chatCompletion([
      { role: 'user', content: 'Say "Hello from Gemini Proxy Pool!" in exactly 5 words.' }
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
      { role: 'user', content: 'Describe proxy connections.' }
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

  // Example 5: Demonstrate proxy agent reuse
  console.log('--- Example 5: Proxy Agent Reuse ---');
  const agent1 = getProxyAgent();
  const agent2 = getProxyAgent();
  console.log('Same proxy agent instance:', agent1 === agent2);
  console.log();

  // Clean up
  await closeProxyAgent();
  console.log('Proxy agent closed.');
}

main().catch(console.error);
