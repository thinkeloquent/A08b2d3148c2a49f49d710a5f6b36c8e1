#!/usr/bin/env node
/**
 * Example: OpenAI SSE ↔ Gemini NDJSON Bidirectional Translation
 *
 * This example demonstrates:
 * 1. Complete SSE-to-NDJSON translation (OpenAI → Gemini)
 * 2. Complete NDJSON-to-SSE translation (Gemini → OpenAI)
 * 3. Building a proxy that accepts OpenAI SSE and outputs Gemini NDJSON
 * 4. Building a proxy that accepts Gemini NDJSON and outputs OpenAI SSE
 *
 * Use cases:
 * - Create an OpenAI-compatible proxy for Gemini
 * - Migrate applications from OpenAI to Gemini without code changes
 * - Build polyglot streaming applications
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// Import protocol translation
const {
    geminiStreamToOpenAI,
    openAIStreamToGemini,
    translateOpenAIRequestToGemini,
} = await import(
    join(ROOT_DIR, 'packages_mjs/fetch_undici_gemini_openai_protocols/dist/index.js')
);

// Import fetch client with SSE support
const { AsyncClient, Timeout, iterLines, iterSSE } = await import(
    join(ROOT_DIR, 'packages_mjs/fetch_undici/dist/index.js')
);

// Import Gemini constants
const {
    GEMINI_ORIGIN,
    GEMINI_CONNECT_TIMEOUT_MS,
    GEMINI_READ_TIMEOUT_MS,
} = await import(
    join(ROOT_DIR, 'packages_mjs/fetch_undici_gemini_openai_constant/dist/index.js')
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY environment variable not set');
    console.error('Set it with: export GEMINI_API_KEY=your_api_key');
    process.exit(1);
}

// =============================================================================
// Example 1: Gemini NDJSON → OpenAI SSE (Proxy Pattern)
// =============================================================================

console.log('='.repeat(60));
console.log('Example 1: Gemini NDJSON → OpenAI SSE Translation');
console.log('='.repeat(60));

console.log(`
This pattern is used when you want to:
- Accept requests in OpenAI format
- Call Gemini's native API
- Return responses in OpenAI SSE format

Perfect for building an OpenAI-compatible proxy for Gemini.
`);

// Simulate incoming OpenAI request
const openAIRequest = {
    model: 'gemini-2.0-flash',
    messages: [
        { role: 'user', content: 'Count from 1 to 5, one number per line.' },
    ],
    stream: true,
};

console.log('Incoming OpenAI Request:');
console.log(JSON.stringify(openAIRequest, null, 2));

// Translate to Gemini format
const geminiRequest = translateOpenAIRequestToGemini(openAIRequest);
console.log('\nTranslated to Gemini Request:');
console.log(JSON.stringify(geminiRequest.data, null, 2));

// Make request to Gemini
const GEMINI_STREAM_URL = `${GEMINI_ORIGIN}/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse`;

const client = new AsyncClient({
    timeout: new Timeout({ connect: GEMINI_CONNECT_TIMEOUT_MS, read: GEMINI_READ_TIMEOUT_MS }),
});

try {
    const response = await client.post(GEMINI_STREAM_URL, {
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
        },
        json: geminiRequest.data,
    });

    if (!response.isSuccess) {
        const errorText = await response.text();
        console.error('API Error:', response.statusCode, errorText);
    } else {
        console.log('\n--- Translating Gemini → OpenAI SSE ---');
        console.log('(This is what your proxy would send to clients)\n');

        // Collect Gemini chunks
        const geminiChunks = [];
        for await (const line of iterLines(response.body)) {
            if (line.startsWith('data: ')) {
                const jsonLine = line.slice(6).trim();
                if (jsonLine) {
                    geminiChunks.push(jsonLine);
                }
            }
        }

        // Create async iterator for translation
        async function* iterChunks(chunks) {
            for (const chunk of chunks) {
                yield chunk;
            }
        }

        // Translate to OpenAI SSE format
        console.log('OpenAI SSE Output:');
        console.log('-'.repeat(40));

        for await (const sseChunk of geminiStreamToOpenAI(iterChunks(geminiChunks), 'gemini-2.0-flash')) {
            // This is exactly what you'd send to an OpenAI client
            process.stdout.write(sseChunk);
        }

        console.log('-'.repeat(40));
    }
} catch (error) {
    console.error('Error:', error.message);
} finally {
    await client.close();
}

// =============================================================================
// Example 2: OpenAI SSE → Gemini NDJSON
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 2: OpenAI SSE → Gemini NDJSON Translation');
console.log('='.repeat(60));

console.log(`
This pattern is used when you want to:
- Accept OpenAI SSE stream from an OpenAI-compatible API
- Convert it to Gemini NDJSON format for downstream processing

Useful for migration or compatibility scenarios.
`);

// Simulated OpenAI SSE stream (as received from OpenAI API)
const simulatedOpenAIStream = [
    'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","model":"gpt-4","choices":[{"index":0,"delta":{"role":"assistant","content":"The "},"finish_reason":null}]}',
    '',  // Empty line between SSE messages
    'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","model":"gpt-4","choices":[{"index":0,"delta":{"content":"quick "},"finish_reason":null}]}',
    '',
    'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","model":"gpt-4","choices":[{"index":0,"delta":{"content":"brown "},"finish_reason":null}]}',
    '',
    'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","model":"gpt-4","choices":[{"index":0,"delta":{"content":"fox."},"finish_reason":null}]}',
    '',
    'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","model":"gpt-4","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}',
    '',
    'data: [DONE]',
];

console.log('Simulated OpenAI SSE Input:');
console.log('-'.repeat(40));
for (const line of simulatedOpenAIStream) {
    if (line) console.log(line);
}
console.log('-'.repeat(40));

// Create async iterator for the simulated stream
async function* iterOpenAISSE(lines) {
    for (const line of lines) {
        yield line;
    }
}

// Translate to Gemini NDJSON format
console.log('\nTranslated Gemini NDJSON Output:');
console.log('-'.repeat(40));

for await (const ndjsonLine of openAIStreamToGemini(iterOpenAISSE(simulatedOpenAIStream))) {
    // This is Gemini NDJSON format
    console.log(ndjsonLine.trim());
}

console.log('-'.repeat(40));

// =============================================================================
// Example 3: SSE Format Deep Dive
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 3: SSE Format Specification');
console.log('='.repeat(60));

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
│   data: [DONE]\\n              ← End marker (OpenAI specific)     │
│   \\n                                                             │
├─────────────────────────────────────────────────────────────────┤
│ RULES:                                                           │
│ - Each event starts with "data: " prefix                         │
│ - Events separated by blank lines                                │
│ - No trailing comma or array brackets                            │
│ - Stream ends with "data: [DONE]" (OpenAI convention)            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               NEWLINE-DELIMITED JSON (NDJSON) FORMAT             │
├─────────────────────────────────────────────────────────────────┤
│ Content-Type: application/json (streaming)                       │
├─────────────────────────────────────────────────────────────────┤
│ STRUCTURE:                                                       │
│                                                                  │
│   <JSON object>\\n                                                │
│   <JSON object>\\n                                                │
│   <JSON object>\\n                                                │
├─────────────────────────────────────────────────────────────────┤
│ RULES:                                                           │
│ - One complete JSON object per line                              │
│ - Lines separated by single newline                              │
│ - No "data: " prefix                                             │
│ - No explicit end marker                                         │
└─────────────────────────────────────────────────────────────────┘
`);

// =============================================================================
// Example 4: Building a Simple Proxy
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 4: Proxy Implementation Pattern');
console.log('='.repeat(60));

console.log(`
Here's how to build an OpenAI-compatible proxy for Gemini:

\`\`\`javascript
import express from 'express';
import { translateOpenAIRequestToGemini, geminiStreamToOpenAI } from 'fetch-undici-gemini-openai-protocols';
import { AsyncClient } from 'fetch-undici';

const app = express();

app.post('/v1/chat/completions', async (req, res) => {
    const openAIRequest = req.body;

    // 1. Translate request
    const geminiRequest = translateOpenAIRequestToGemini(openAIRequest);

    // 2. Call Gemini
    const client = new AsyncClient();
    const geminiResponse = await client.post(GEMINI_URL, {
        headers: { 'x-goog-api-key': API_KEY },
        json: geminiRequest.data,
    });

    // 3. Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 4. Stream translated response
    for await (const sseChunk of geminiStreamToOpenAI(
        iterLines(geminiResponse.body),
        'gemini-2.0-flash'
    )) {
        res.write(sseChunk);
    }

    res.end();
});
\`\`\`

This allows any OpenAI client to use Gemini transparently!
`);

// =============================================================================
// Example 5: Live Demonstration
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 5: Live SSE Translation Demo');
console.log('='.repeat(60));

const client2 = new AsyncClient({
    timeout: new Timeout({ connect: GEMINI_CONNECT_TIMEOUT_MS, read: GEMINI_READ_TIMEOUT_MS }),
});

try {
    const requestPayload = translateOpenAIRequestToGemini({
        messages: [
            { role: 'user', content: 'Say "Hello, SSE!" in 3 different languages, one per line.' },
        ],
    });

    console.log('\nSending request to Gemini...\n');

    const response = await client2.post(GEMINI_STREAM_URL, {
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
        },
        json: requestPayload.data,
    });

    if (response.isSuccess) {
        console.log('Response (in OpenAI SSE format):');
        console.log('=' .repeat(40));

        // Collect and translate
        const chunks = [];
        for await (const line of iterLines(response.body)) {
            if (line.startsWith('data: ')) {
                const jsonLine = line.slice(6).trim();
                if (jsonLine) chunks.push(jsonLine);
            }
        }

        async function* iter(arr) {
            for (const item of arr) yield item;
        }

        // Output in OpenAI SSE format
        for await (const sse of geminiStreamToOpenAI(iter(chunks), 'gemini-2.0-flash')) {
            process.stdout.write(sse);
        }

        console.log('=' .repeat(40));
    } else {
        const errorText = await response.text();
        console.error('Error:', response.statusCode, errorText);
    }
} catch (error) {
    console.error('Error:', error.message);
} finally {
    await client2.close();
}

console.log('\n' + '='.repeat(60));
console.log('SSE Translation Examples Complete');
console.log('='.repeat(60));
