/**
 * Gemini OpenAI-Compatible Streaming Example
 *
 * Uses fetch_undici to demonstrate streaming chat completions with
 * Gemini's OpenAI-compatible endpoint.
 *
 * Run: node 2.gemini-openai-streaming.mjs
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

async function* streamChat(messages, options = {}) {
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
          try {
            yield JSON.parse(data);
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Gemini OpenAI-Compatible Streaming Examples');
  console.log('='.repeat(60));
  console.log();

  // Example 1: Basic streaming
  console.log('--- Example 1: Basic Streaming ---');
  console.log('Response:');
  try {
    let fullContent = '';
    for await (const chunk of streamChat([
      { role: 'system', content: 'You are a helpful assistant. Be concise.' },
      { role: 'user', content: 'Write a haiku about programming.' }
    ], { temperature: 0.8 })) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        process.stdout.write(content);
        fullContent += content;
      }
    }
    console.log('\n');
    console.log('Extracted content:');
    console.log(fullContent);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 2: Streaming with token counting
  console.log('--- Example 2: Streaming with Token Counting ---');
  console.log('Response:');
  try {
    let chunkCount = 0;
    let usage = null;
    for await (const chunk of streamChat([
      { role: 'user', content: 'Count from 1 to 5, with a brief description for each number.' }
    ])) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        process.stdout.write(content);
        chunkCount++;
      }
      if (chunk.usage) {
        usage = chunk.usage;
      }
    }
    console.log('\n');
    console.log(`Chunks received: ${chunkCount}`);
    if (usage) {
      console.log('Usage:', JSON.stringify(usage, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 3: Multi-turn streaming conversation
  console.log('--- Example 3: Multi-turn Streaming Conversation ---');
  console.log('Response:');
  try {
    for await (const chunk of streamChat([
      { role: 'user', content: 'My favorite color is blue.' },
      { role: 'assistant', content: 'Blue is a great color! It is often associated with calmness and trust.' },
      { role: 'user', content: 'What is my favorite color?' }
    ], { temperature: 0 })) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        process.stdout.write(content);
      }
    }
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 4: Streaming format comparison
  console.log('--- Example 4: Streaming Format Comparison ---');
  console.log(`
┌───────────────────────────────────────────────────────────────┐
│                    STREAMING FORMAT COMPARISON                 │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  OpenAI SSE Format (Gemini OpenAI-compatible):                │
│  ─────────────────────────────────────────────                │
│  data: {"choices":[{"delta":{"content":"Hello"}}]}           │
│  data: {"choices":[{"delta":{"content":" World"}}]}          │
│  data: {"choices":[{"delta":{},"finish_reason":"stop"}]}     │
│  data: [DONE]                                                 │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ Key Points:                                                   │
│ • Uses Server-Sent Events (SSE) format                        │
│ • Each chunk has "delta" containing incremental content       │
│ • Stream ends with "data: [DONE]"                            │
│ • finish_reason appears in final content chunk                │
└───────────────────────────────────────────────────────────────┘
`);

  console.log('='.repeat(60));
  console.log('Streaming Examples Complete');
  console.log('='.repeat(60));
}

main().catch(console.error);
