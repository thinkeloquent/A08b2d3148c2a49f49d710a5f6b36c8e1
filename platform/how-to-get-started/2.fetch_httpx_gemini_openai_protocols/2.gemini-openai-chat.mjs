#!/usr/bin/env node
/**
 * Example: OpenAI ↔ Gemini Chat Message Translation
 *
 * This example demonstrates:
 * 1. Converting OpenAI chat messages to Gemini format
 * 2. Converting Gemini responses back to OpenAI format
 * 3. Using the protocol translation layer with fetch-undici
 *
 * The translation handles:
 * - Role mapping (assistant → model, system → systemInstruction)
 * - Message content structure differences
 * - System message extraction
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// Import protocol translation
const {
    translateOpenAIRequestToGemini,
    translateGeminiResponseToOpenAI,
    openAIMessagesToGemini,
    geminiToOpenAIMessages,
} = await import(
    join(ROOT_DIR, 'packages_mjs/fetch_undici_gemini_openai_protocols/dist/index.js')
);

// Import fetch client
const { AsyncClient, BearerAuth, Timeout } = await import(
    join(ROOT_DIR, 'packages_mjs/fetch_undici/dist/index.js')
);

// Import Gemini constants
const {
    GEMINI_ORIGIN,
    GEMINI_CONNECT_TIMEOUT_MS,
    GEMINI_READ_TIMEOUT_THINKING_MS,
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
// Example 1: Basic Message Translation
// =============================================================================

console.log('='.repeat(60));
console.log('Example 1: Basic OpenAI → Gemini Message Translation');
console.log('='.repeat(60));

// OpenAI-style messages
const openAIMessages = [
    { role: 'system', content: 'You are a helpful assistant that speaks like a pirate.' },
    { role: 'user', content: 'What is the weather like today?' },
    { role: 'assistant', content: 'Arrr, I be not knowin\' the current weather, matey!' },
    { role: 'user', content: 'Tell me a joke about the sea.' },
];

console.log('\nOpenAI Messages:');
console.log(JSON.stringify(openAIMessages, null, 2));

// Translate to Gemini format
const geminiResult = openAIMessagesToGemini(openAIMessages);

console.log('\nGemini Contents:');
console.log(JSON.stringify(geminiResult.data.contents, null, 2));

console.log('\nGemini System Instruction:');
console.log(JSON.stringify(geminiResult.data.system_instruction, null, 2));

if (geminiResult.warnings.length > 0) {
    console.log('\nWarnings:', geminiResult.warnings);
}

// =============================================================================
// Example 2: Full Request Translation
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 2: Full OpenAI Request → Gemini Request Translation');
console.log('='.repeat(60));

// OpenAI-style chat completion request
const openAIRequest = {
    model: 'gpt-4',
    messages: [
        { role: 'system', content: 'You are a concise assistant.' },
        { role: 'user', content: 'Explain quantum computing in one sentence.' },
    ],
    temperature: 0.7,
    max_tokens: 100,
    top_p: 0.9,
};

console.log('\nOpenAI Request:');
console.log(JSON.stringify(openAIRequest, null, 2));

// Translate to Gemini format
const geminiRequestResult = translateOpenAIRequestToGemini(openAIRequest);

console.log('\nGemini Request:');
console.log(JSON.stringify(geminiRequestResult.data, null, 2));

// =============================================================================
// Example 3: Make Actual API Call
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 3: Live API Call with Protocol Translation');
console.log('='.repeat(60));

// Create OpenAI-style request
const chatRequest = {
    model: 'gemini-2.0-flash',
    messages: [
        { role: 'system', content: 'You are a helpful assistant. Be concise.' },
        { role: 'user', content: 'What is 2 + 2? Reply with just the number.' },
    ],
    temperature: 0.1,
    max_tokens: 50,
};

console.log('\nOpenAI-style Request:');
console.log(JSON.stringify(chatRequest, null, 2));

// Translate to Gemini
const translatedRequest = translateOpenAIRequestToGemini(chatRequest);
console.log('\nTranslated to Gemini Request:');
console.log(JSON.stringify(translatedRequest.data, null, 2));

// Make API call to Gemini's native endpoint
const GEMINI_URL = `${GEMINI_ORIGIN}/v1beta/models/gemini-2.0-flash:generateContent`;

const client = new AsyncClient({
    timeout: new Timeout({ connect: GEMINI_CONNECT_TIMEOUT_MS, read: GEMINI_READ_TIMEOUT_THINKING_MS }),
});

try {
    const response = await client.post(GEMINI_URL, {
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
        },
        json: translatedRequest.data,
    });

    if (response.isSuccess) {
        const geminiResponse = await response.json();
        console.log('\nGemini Native Response:');
        console.log(JSON.stringify(geminiResponse, null, 2));

        // Translate response back to OpenAI format
        const openAIResponse = translateGeminiResponseToOpenAI(geminiResponse, 'gemini-2.0-flash');
        console.log('\nTranslated to OpenAI Response:');
        console.log(JSON.stringify(openAIResponse.data, null, 2));

        // Extract the message content (OpenAI style)
        const content = openAIResponse.data.choices?.[0]?.message?.content;
        console.log('\nExtracted Content:', content);
    } else {
        const errorText = await response.text();
        console.error('\nAPI Error:', response.statusCode, errorText);
    }
} catch (error) {
    console.error('\nRequest Error:', error.message);
} finally {
    await client.close();
}

// =============================================================================
// Example 4: Gemini → OpenAI Message Translation
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 4: Gemini → OpenAI Message Translation');
console.log('='.repeat(60));

// Gemini-style contents
const geminiContents = [
    {
        role: 'user',
        parts: [{ text: 'Hello, how are you?' }],
    },
    {
        role: 'model',
        parts: [{ text: 'I am doing well, thank you for asking!' }],
    },
];

const geminiSystemInstruction = {
    parts: [{ text: 'You are a friendly assistant.' }],
};

console.log('\nGemini Contents:');
console.log(JSON.stringify(geminiContents, null, 2));

console.log('\nGemini System Instruction:');
console.log(JSON.stringify(geminiSystemInstruction, null, 2));

// Translate back to OpenAI format
const openAIResult = geminiToOpenAIMessages(geminiContents, geminiSystemInstruction);

console.log('\nOpenAI Messages:');
console.log(JSON.stringify(openAIResult.data, null, 2));

console.log('\n' + '='.repeat(60));
console.log('Chat Translation Examples Complete');
console.log('='.repeat(60));
