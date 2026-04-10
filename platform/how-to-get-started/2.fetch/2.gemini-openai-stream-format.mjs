/**
 * Gemini OpenAI-Compatible Stream Format Example
 *
 * Uses fetch_undici to demonstrate the SSE stream format details
 * with Gemini's OpenAI-compatible endpoint.
 *
 * Run: node 2.gemini-openai-stream-format.mjs
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

async function main() {
  console.log('='.repeat(60));
  console.log('Gemini OpenAI-Compatible Stream Format Examples');
  console.log('='.repeat(60));
  console.log();

  // Example 1: Raw SSE format inspection
  console.log('--- Example 1: Raw SSE Format Inspection ---');
  console.log('Streaming raw chunks:');
  console.log();

  try {
    const { statusCode, body } = await request(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: 'Say "Hi" in one word.' }],
        stream: true,
        max_tokens: 10,
      }),
    });

    if (statusCode >= 400) {
      const text = await body.text();
      throw new Error(`${statusCode}: ${text}`);
    }

    let buffer = '';
    let chunkIndex = 0;
    for await (const chunk of body) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          console.log(`Chunk ${chunkIndex++}: "${line}"`);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 2: Parsed SSE chunks
  console.log('--- Example 2: Parsed SSE Chunks ---');
  console.log('Parsing each SSE data line:');
  console.log();

  try {
    const { statusCode, body } = await request(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: 'Count: 1, 2, 3' }],
        stream: true,
        max_tokens: 50,
      }),
    });

    if (statusCode >= 400) {
      const text = await body.text();
      throw new Error(`${statusCode}: ${text}`);
    }

    let buffer = '';
    let chunkIndex = 0;
    for await (const chunk of body) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            console.log(`Chunk ${chunkIndex++}: [DONE] - Stream complete`);
          } else {
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta || {};
              const finishReason = parsed.choices?.[0]?.finish_reason;

              console.log(`Chunk ${chunkIndex++}:`);
              if (delta.role) console.log(`  role: "${delta.role}"`);
              if (delta.content) console.log(`  content: "${delta.content}"`);
              if (finishReason) console.log(`  finish_reason: "${finishReason}"`);
              if (parsed.usage) console.log(`  usage: ${JSON.stringify(parsed.usage)}`);
            } catch (e) {
              console.log(`Chunk ${chunkIndex++}: (parse error)`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 3: Stream accumulator pattern
  console.log('--- Example 3: Stream Accumulator Pattern ---');
  console.log('Accumulating content from stream:');
  console.log();

  try {
    const { statusCode, body } = await request(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: 'Write a very short haiku about code.' }],
        stream: true,
        temperature: 0.8,
      }),
    });

    if (statusCode >= 400) {
      const text = await body.text();
      throw new Error(`${statusCode}: ${text}`);
    }

    // Accumulator state
    const accumulated = {
      id: null,
      model: null,
      role: null,
      content: '',
      finishReason: null,
      usage: null,
    };

    let buffer = '';
    for await (const chunk of body) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);
          if (data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data);
              if (parsed.id) accumulated.id = parsed.id;
              if (parsed.model) accumulated.model = parsed.model;

              const choice = parsed.choices?.[0];
              if (choice) {
                if (choice.delta?.role) accumulated.role = choice.delta.role;
                if (choice.delta?.content) accumulated.content += choice.delta.content;
                if (choice.finish_reason) accumulated.finishReason = choice.finish_reason;
              }
              if (parsed.usage) accumulated.usage = parsed.usage;
            } catch (e) {
              // Skip
            }
          }
        }
      }
    }

    console.log('Accumulated result:');
    console.log(JSON.stringify(accumulated, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 4: SSE format specification
  console.log('--- Example 4: OpenAI SSE Format Specification ---');
  console.log(`
┌─────────────────────────────────────────────────────────────────┐
│                    OPENAI SSE STREAM FORMAT                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ HTTP Headers:                                                   │
│   Content-Type: text/event-stream                               │
│   Cache-Control: no-cache                                       │
│   Connection: keep-alive                                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Stream Structure:                                               │
│                                                                 │
│   data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk",  │
│          "model":"gemini-2.0-flash","choices":[                 │
│            {"index":0,"delta":{"role":"assistant"},...}]}       │
│                                                                 │
│   data: {"id":"chatcmpl-xxx","choices":[                        │
│            {"index":0,"delta":{"content":"Hello"},...}]}        │
│                                                                 │
│   data: {"id":"chatcmpl-xxx","choices":[                        │
│            {"index":0,"delta":{},"finish_reason":"stop"}]}      │
│                                                                 │
│   data: [DONE]                                                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Key Fields:                                                     │
│ • id - Unique stream identifier                                 │
│ • object - Always "chat.completion.chunk" for streaming         │
│ • model - Model name                                            │
│ • choices[].delta.role - Assistant role (first chunk only)      │
│ • choices[].delta.content - Content token                       │
│ • choices[].finish_reason - "stop", "length", "tool_calls"      │
│ • usage - Token counts (may appear in final chunk)              │
└─────────────────────────────────────────────────────────────────┘
`);

  // Example 5: Compare stream vs non-stream
  console.log('--- Example 5: Stream vs Non-Stream Response Comparison ---');
  console.log(`
┌─────────────────────────────────────────────────────────────────┐
│              STREAM vs NON-STREAM RESPONSE COMPARISON            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ NON-STREAM (stream: false or omitted):                          │
│ ────────────────────────────────────────                        │
│ {                                                               │
│   "id": "chatcmpl-xxx",                                         │
│   "object": "chat.completion",                                  │
│   "model": "gemini-2.0-flash",                                  │
│   "choices": [{                                                 │
│     "index": 0,                                                 │
│     "message": {                                                │
│       "role": "assistant",                                      │
│       "content": "Complete response here"                       │
│     },                                                          │
│     "finish_reason": "stop"                                     │
│   }],                                                           │
│   "usage": { "prompt_tokens": 10, "completion_tokens": 5, ... } │
│ }                                                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ STREAM (stream: true):                                          │
│ ──────────────────────                                          │
│ data: {"choices":[{"delta":{"role":"assistant"}}]}              │
│ data: {"choices":[{"delta":{"content":"Complete"}}]}            │
│ data: {"choices":[{"delta":{"content":" response"}}]}           │
│ data: {"choices":[{"delta":{"content":" here"}}]}               │
│ data: {"choices":[{"delta":{},"finish_reason":"stop"}]}         │
│ data: [DONE]                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
`);

  console.log('='.repeat(60));
  console.log('Stream Format Examples Complete');
  console.log('='.repeat(60));
}

main().catch(console.error);
