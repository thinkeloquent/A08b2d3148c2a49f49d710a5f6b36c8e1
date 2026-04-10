#!/usr/bin/env node
/**
 * Example: OpenAI ↔ Gemini Streaming Format Translation
 *
 * This example demonstrates:
 * 1. Converting individual Gemini streaming chunks to OpenAI SSE format
 * 2. Converting individual OpenAI SSE chunks to Gemini NDJSON format
 * 3. Understanding the structural differences between streaming formats
 *
 * Key Differences:
 * - OpenAI: Server-Sent Events (SSE) with "data: {...}\n\n" format, ends with "data: [DONE]"
 * - Gemini: Newline-delimited JSON (NDJSON) with one JSON object per line
 *
 * This example focuses on CHUNK-LEVEL translation (not full stream).
 * See 2.gemini-openai-streaming.mjs for full streaming translation.
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// Import protocol translation
const {
    geminiChunkToOpenAI,
    openAIChunkToGemini,
    StreamAccumulator,
} = await import(
    join(ROOT_DIR, 'packages_mjs/fetch_undici_gemini_openai_protocols/dist/index.js')
);

// =============================================================================
// Example 1: Gemini Chunk → OpenAI Chunk
// =============================================================================

console.log('='.repeat(60));
console.log('Example 1: Gemini Chunk → OpenAI SSE Chunk Translation');
console.log('='.repeat(60));

// Simulated Gemini streaming chunks (as they arrive in NDJSON format)
const geminiChunks = [
    // First chunk - contains initial content
    {
        candidates: [
            {
                content: {
                    role: 'model',
                    parts: [{ text: 'Hello! ' }],
                },
                index: 0,
            },
        ],
    },
    // Second chunk - more content
    {
        candidates: [
            {
                content: {
                    role: 'model',
                    parts: [{ text: 'How can I ' }],
                },
                index: 0,
            },
        ],
    },
    // Third chunk - even more content
    {
        candidates: [
            {
                content: {
                    role: 'model',
                    parts: [{ text: 'help you today?' }],
                },
                index: 0,
            },
        ],
    },
    // Final chunk - with finish reason
    {
        candidates: [
            {
                content: {
                    role: 'model',
                    parts: [{ text: '' }],
                },
                finishReason: 'STOP',
                index: 0,
            },
        ],
        usageMetadata: {
            promptTokenCount: 10,
            candidatesTokenCount: 8,
            totalTokenCount: 18,
        },
    },
];

console.log('\nSimulated Gemini NDJSON chunks arriving over the wire:');
console.log('(Each line is a separate JSON object)');
console.log('-'.repeat(40));

let isFirst = true;
const streamId = `chatcmpl-${Date.now()}`;

for (const chunk of geminiChunks) {
    // What Gemini sends (NDJSON line)
    console.log(`\nGemini chunk: ${JSON.stringify(chunk)}`);

    // Translate to OpenAI format
    const result = geminiChunkToOpenAI(chunk, {
        id: streamId,
        model: 'gemini-2.0-flash',
        isFirst,
    });
    isFirst = false;

    // What we'd send in OpenAI SSE format
    const sseFormat = `data: ${JSON.stringify(result.data)}\n\n`;
    console.log(`OpenAI SSE:  ${sseFormat.trim()}`);
}

// OpenAI streams end with [DONE]
console.log('\nOpenAI SSE:  data: [DONE]\n');

// =============================================================================
// Example 2: OpenAI Chunk → Gemini Chunk
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 2: OpenAI SSE Chunk → Gemini NDJSON Chunk Translation');
console.log('='.repeat(60));

// Simulated OpenAI SSE chunks (parsed from "data: {...}" lines)
const openAIChunks = [
    // First chunk with role
    {
        id: 'chatcmpl-abc123',
        object: 'chat.completion.chunk',
        created: Date.now(),
        model: 'gpt-4',
        choices: [
            {
                index: 0,
                delta: { role: 'assistant', content: 'The ' },
                finish_reason: null,
            },
        ],
    },
    // Content chunks
    {
        id: 'chatcmpl-abc123',
        object: 'chat.completion.chunk',
        created: Date.now(),
        model: 'gpt-4',
        choices: [
            {
                index: 0,
                delta: { content: 'weather ' },
                finish_reason: null,
            },
        ],
    },
    {
        id: 'chatcmpl-abc123',
        object: 'chat.completion.chunk',
        created: Date.now(),
        model: 'gpt-4',
        choices: [
            {
                index: 0,
                delta: { content: 'is sunny.' },
                finish_reason: null,
            },
        ],
    },
    // Final chunk
    {
        id: 'chatcmpl-abc123',
        object: 'chat.completion.chunk',
        created: Date.now(),
        model: 'gpt-4',
        choices: [
            {
                index: 0,
                delta: {},
                finish_reason: 'stop',
            },
        ],
    },
];

console.log('\nSimulated OpenAI SSE chunks arriving over the wire:');
console.log('(Each "data: ..." line contains a JSON object)');
console.log('-'.repeat(40));

// Create accumulator for stateful translation
const accumulator = new StreamAccumulator();

for (const chunk of openAIChunks) {
    // What OpenAI sends (SSE format)
    console.log(`\nOpenAI SSE:  data: ${JSON.stringify(chunk)}`);

    // Translate to Gemini format
    const result = openAIChunkToGemini(chunk, accumulator);

    if (result.data) {
        // What we'd send in Gemini NDJSON format
        console.log(`Gemini NDJSON: ${JSON.stringify(result.data)}`);
    } else {
        console.log(`Gemini NDJSON: (no output - accumulated)`);
    }
}

// =============================================================================
// Example 3: Chunk with Tool Calls
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 3: Streaming Chunk with Tool Calls');
console.log('='.repeat(60));

// Gemini chunk with function call
const geminiToolCallChunk = {
    candidates: [
        {
            content: {
                role: 'model',
                parts: [
                    {
                        functionCall: {
                            name: 'get_weather',
                            args: { location: 'Tokyo' },
                        },
                    },
                ],
            },
            finishReason: 'STOP',
            index: 0,
        },
    ],
};

console.log('\nGemini chunk with function call:');
console.log(JSON.stringify(geminiToolCallChunk, null, 2));

const toolCallResult = geminiChunkToOpenAI(geminiToolCallChunk, {
    id: `chatcmpl-${Date.now()}`,
    model: 'gemini-2.0-flash',
    isFirst: true,
});

console.log('\nTranslated to OpenAI SSE format:');
console.log(JSON.stringify(toolCallResult.data, null, 2));

// =============================================================================
// Example 4: Format Comparison Summary
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 4: Format Comparison Summary');
console.log('='.repeat(60));

console.log(`
┌─────────────────────────────────────────────────────────────────┐
│                    STREAMING FORMAT COMPARISON                   │
├─────────────────────────────────────────────────────────────────┤
│ Aspect              │ OpenAI SSE           │ Gemini NDJSON       │
├─────────────────────────────────────────────────────────────────┤
│ Line Format         │ data: {...}\\n\\n      │ {...}\\n             │
│ Content-Type        │ text/event-stream    │ application/json    │
│ End Marker          │ data: [DONE]\\n\\n     │ (none)              │
│ Role Location       │ First chunk delta    │ Every chunk content │
│ Content Key         │ delta.content        │ parts[].text        │
│ Function Calls      │ delta.tool_calls[]   │ parts[].functionCall│
│ Finish Reason       │ finish_reason        │ finishReason        │
│ Usage Stats         │ Separate final chunk │ Last chunk metadata │
└─────────────────────────────────────────────────────────────────┘
`);

console.log('OpenAI SSE Example Stream:');
console.log('-'.repeat(40));
console.log('data: {"id":"chatcmpl-1","choices":[{"delta":{"role":"assistant","content":"Hi"}}]}');
console.log('');
console.log('data: {"id":"chatcmpl-1","choices":[{"delta":{"content":" there"}}]}');
console.log('');
console.log('data: {"id":"chatcmpl-1","choices":[{"delta":{},"finish_reason":"stop"}]}');
console.log('');
console.log('data: [DONE]');
console.log('');

console.log('\nGemini NDJSON Example Stream:');
console.log('-'.repeat(40));
console.log('{"candidates":[{"content":{"role":"model","parts":[{"text":"Hi"}]}}]}');
console.log('{"candidates":[{"content":{"role":"model","parts":[{"text":" there"}]}}]}');
console.log('{"candidates":[{"content":{"role":"model","parts":[]},"finishReason":"STOP"}],"usageMetadata":{...}}');

console.log('\n' + '='.repeat(60));
console.log('Stream Format Examples Complete');
console.log('='.repeat(60));
