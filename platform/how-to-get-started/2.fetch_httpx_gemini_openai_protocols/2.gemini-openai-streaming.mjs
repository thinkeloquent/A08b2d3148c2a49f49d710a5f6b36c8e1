#!/usr/bin/env node
/**
 * Example: Full Streaming Translation with Live API Calls
 *
 * This example demonstrates:
 * 1. Making a streaming request to Gemini's native API
 * 2. Translating Gemini NDJSON stream to OpenAI SSE format in real-time
 * 3. Aggregating streaming responses into complete messages
 * 4. Handling tool calls in streaming responses
 *
 * This uses the full stream translation functions (async generators).
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// Import protocol translation
const {
    translateOpenAIRequestToGemini,
    geminiStreamToOpenAI,
    aggregateOpenAIStream,
} = await import(
    join(ROOT_DIR, 'packages_mjs/fetch_undici_gemini_openai_protocols/dist/index.js')
);

// Import fetch client
const { AsyncClient, Timeout, iterLines } = await import(
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
// Example 1: Simple Streaming Chat
// =============================================================================

console.log('='.repeat(60));
console.log('Example 1: Streaming Chat with Format Translation');
console.log('='.repeat(60));

const openAIRequest = {
    model: 'gemini-2.0-flash',
    messages: [
        { role: 'system', content: 'You are a helpful assistant. Keep responses brief.' },
        { role: 'user', content: 'Write a haiku about programming.' },
    ],
    temperature: 0.7,
    max_tokens: 100,
    stream: true,  // Enable streaming
};

console.log('\nOpenAI-style Request:');
console.log(JSON.stringify(openAIRequest, null, 2));

// Translate to Gemini format
const geminiRequest = translateOpenAIRequestToGemini(openAIRequest);
console.log('\nTranslated to Gemini Request:');
console.log(JSON.stringify(geminiRequest.data, null, 2));

// Make streaming request to Gemini
const GEMINI_STREAM_URL = `${GEMINI_ORIGIN}/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse`;

const client = new AsyncClient({
    timeout: new Timeout({ connect: GEMINI_CONNECT_TIMEOUT_MS, read: GEMINI_READ_TIMEOUT_MS }),
});

try {
    console.log('\n--- Starting Streaming Request ---');
    console.log('URL:', GEMINI_STREAM_URL);

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
        process.exit(1);
    }

    console.log('\n--- Gemini NDJSON Stream (raw) ---');

    // Create an async iterator from the response body
    async function* streamLines(body) {
        for await (const line of iterLines(body)) {
            yield line;
        }
    }

    // Collect lines for translation
    const lines = [];
    for await (const line of streamLines(response.body)) {
        // Gemini with alt=sse sends SSE format
        if (line.startsWith('data: ')) {
            const jsonLine = line.slice(6);
            if (jsonLine.trim()) {
                console.log(`Gemini: ${jsonLine.substring(0, 80)}${jsonLine.length > 80 ? '...' : ''}`);
                lines.push(jsonLine);
            }
        }
    }

    console.log('\n--- Translating to OpenAI SSE Format ---');

    // Create async iterator from collected lines
    async function* iterLines2(lines) {
        for (const line of lines) {
            yield line;
        }
    }

    // Translate the stream
    let fullContent = '';
    for await (const openAISSE of geminiStreamToOpenAI(iterLines2(lines), 'gemini-2.0-flash')) {
        console.log(`OpenAI: ${openAISSE.trim()}`);

        // Parse to extract content
        if (openAISSE.startsWith('data: ') && !openAISSE.includes('[DONE]')) {
            try {
                const chunk = JSON.parse(openAISSE.slice(6));
                const content = chunk.choices?.[0]?.delta?.content || '';
                fullContent += content;
            } catch (e) {
                // Ignore parse errors
            }
        }
    }

    console.log('\n--- Aggregated Response ---');
    console.log('Full content:', fullContent);

} catch (error) {
    console.error('Error:', error.message);
} finally {
    await client.close();
}

// =============================================================================
// Example 2: Streaming with Tool Calls
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 2: Streaming with Tool Calls');
console.log('='.repeat(60));

const toolRequest = {
    model: 'gemini-2.0-flash',
    messages: [
        { role: 'system', content: 'You are a helpful assistant. Use tools when needed.' },
        { role: 'user', content: 'What is the weather in Paris?' },
    ],
    tools: [
        {
            type: 'function',
            function: {
                name: 'get_weather',
                description: 'Get the weather for a location',
                parameters: {
                    type: 'object',
                    properties: {
                        location: { type: 'string', description: 'City name' },
                    },
                    required: ['location'],
                },
            },
        },
    ],
    tool_choice: 'auto',
    stream: true,
};

console.log('\nOpenAI-style Request with Tools:');
console.log(JSON.stringify(toolRequest, null, 2));

// Translate to Gemini
const geminiToolRequest = translateOpenAIRequestToGemini(toolRequest);
console.log('\nTranslated to Gemini:');
console.log(JSON.stringify(geminiToolRequest.data, null, 2));

const client2 = new AsyncClient({
    timeout: new Timeout({ connect: GEMINI_CONNECT_TIMEOUT_MS, read: GEMINI_READ_TIMEOUT_MS }),
});

try {
    const response = await client2.post(GEMINI_STREAM_URL, {
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
        },
        json: geminiToolRequest.data,
    });

    if (!response.isSuccess) {
        const errorText = await response.text();
        console.error('API Error:', response.statusCode, errorText);
    } else {
        console.log('\n--- Streaming Response ---');

        // Collect and display chunks
        const lines = [];
        for await (const line of iterLines(response.body)) {
            if (line.startsWith('data: ')) {
                const jsonLine = line.slice(6);
                if (jsonLine.trim()) {
                    console.log(`Raw: ${jsonLine.substring(0, 100)}${jsonLine.length > 100 ? '...' : ''}`);
                    lines.push(jsonLine);
                }
            }
        }

        // Parse and show tool calls
        console.log('\n--- Parsed Tool Calls ---');
        for (const line of lines) {
            try {
                const chunk = JSON.parse(line);
                const parts = chunk.candidates?.[0]?.content?.parts || [];
                for (const part of parts) {
                    if (part.functionCall) {
                        console.log(`Tool Call: ${part.functionCall.name}(${JSON.stringify(part.functionCall.args)})`);
                    }
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }
} catch (error) {
    console.error('Error:', error.message);
} finally {
    await client2.close();
}

// =============================================================================
// Example 3: Stream Aggregation
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 3: Stream Aggregation Demo');
console.log('='.repeat(60));

// Simulate an OpenAI SSE stream
const simulatedSSELines = [
    'data: {"id":"chatcmpl-1","choices":[{"delta":{"role":"assistant","content":"Hello"}}]}',
    'data: {"id":"chatcmpl-1","choices":[{"delta":{"content":" world"}}]}',
    'data: {"id":"chatcmpl-1","choices":[{"delta":{"content":"!"}}]}',
    'data: {"id":"chatcmpl-1","choices":[{"delta":{},"finish_reason":"stop"}]}',
    'data: [DONE]',
];

console.log('\nSimulated OpenAI SSE Stream:');
for (const line of simulatedSSELines) {
    console.log(line);
}

// Create async iterator
async function* iterSSE(lines) {
    for (const line of lines) {
        yield line;
    }
}

// Aggregate the stream
const aggregated = await aggregateOpenAIStream(iterSSE(simulatedSSELines));

console.log('\nAggregated Result:');
console.log(JSON.stringify(aggregated.data, null, 2));

const content = aggregated.data.choices?.[0]?.delta?.content;
console.log('\nFull Message:', content);

console.log('\n' + '='.repeat(60));
console.log('Streaming Examples Complete');
console.log('='.repeat(60));
