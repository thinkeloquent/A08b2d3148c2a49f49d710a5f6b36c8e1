/**
 * Gemini OpenAI-Compatible SSE Streaming Example
 *
 * Uses fetch_undici to demonstrate Server-Sent Events (SSE) streaming
 * with Gemini's OpenAI-compatible endpoint.
 *
 * Run: node 2.gemini-openai-SSE.mjs
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

async function* streamSSE(body) {
  let buffer = '';
  for await (const chunk of body) {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          return;
        }
        if (data) {
          yield data;
        }
      }
    }
  }
}

async function streamChatCompletion(messages, options = {}) {
  const payload = {
    model: options.model || 'gemini-2.0-flash',
    messages,
    stream: true,
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

  if (statusCode >= 400) {
    const text = await body.text();
    throw new Error(`${statusCode}: ${text}`);
  }

  return streamSSE(body);
}

async function main() {
  console.log('='.repeat(60));
  console.log('Gemini OpenAI-Compatible SSE Streaming Examples');
  console.log('='.repeat(60));
  console.log();

  // Example 1: Basic SSE streaming
  console.log('--- Example 1: Basic SSE Streaming ---');
  console.log('Streaming response:');
  try {
    const stream = await streamChatCompletion([
      { role: 'user', content: 'Count from 1 to 5, one number per line.' }
    ]);

    let fullContent = '';
    for await (const data of stream) {
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          process.stdout.write(content);
          fullContent += content;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
    console.log('\n');
    console.log('Full content:', fullContent.trim());
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 2: SSE with system message
  console.log('--- Example 2: SSE with System Message ---');
  console.log('Streaming response:');
  try {
    const stream = await streamChatCompletion([
      { role: 'system', content: 'You are a pirate. Always respond like a pirate would.' },
      { role: 'user', content: 'How do you greet someone?' }
    ], { temperature: 0.9 });

    for await (const data of stream) {
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          process.stdout.write(content);
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 3: SSE with token counting
  console.log('--- Example 3: SSE with Token Counting ---');
  console.log('Streaming response:');
  try {
    const stream = await streamChatCompletion([
      { role: 'user', content: 'Write a haiku about coding.' }
    ], { temperature: 0.8 });

    let chunkCount = 0;
    let usage = null;
    for await (const data of stream) {
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          process.stdout.write(content);
          chunkCount++;
        }
        if (parsed.usage) {
          usage = parsed.usage;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
    console.log('\n');
    console.log(`Chunks received: ${chunkCount}`);
    if (usage) {
      console.log('Usage:', usage);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 4: Raw SSE data inspection
  console.log('--- Example 4: Raw SSE Data Inspection ---');
  console.log('Raw SSE chunks:');
  try {
    const stream = await streamChatCompletion([
      { role: 'user', content: 'Say "Hi" in one word.' }
    ], { max_tokens: 10 });

    for await (const data of stream) {
      console.log('data:', data.slice(0, 100) + (data.length > 100 ? '...' : ''));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 5: SSE Format explanation
  console.log('--- Example 5: SSE Format Specification ---');
  console.log(`
┌─────────────────────────────────────────────────────────────────┐
│                  SERVER-SENT EVENTS (SSE) FORMAT                 │
├─────────────────────────────────────────────────────────────────┤
│ Content-Type: text/event-stream                                  │
│ Cache-Control: no-cache                                          │
│ Connection: keep-alive                                           │
├─────────────────────────────────────────────────────────────────┤
│ STRUCTURE:                                                       │
│                                                                  │
│   data: <JSON object>\\n                                          │
│   \\n                          ← Empty line between events        │
│   data: <JSON object>\\n                                          │
│   \\n                                                             │
│   data: [DONE]\\n              ← End marker (OpenAI convention)   │
│   \\n                                                             │
├─────────────────────────────────────────────────────────────────┤
│ OpenAI SSE Chunk Structure:                                      │
│ {                                                                │
│   "id": "chatcmpl-xxx",                                          │
│   "object": "chat.completion.chunk",                             │
│   "model": "gemini-2.0-flash",                                   │
│   "choices": [{                                                  │
│     "index": 0,                                                  │
│     "delta": { "content": "Hello" },                             │
│     "finish_reason": null                                        │
│   }]                                                             │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
`);

  console.log('='.repeat(60));
  console.log('SSE Streaming Examples Complete');
  console.log('='.repeat(60));
}

main().catch(console.error);
