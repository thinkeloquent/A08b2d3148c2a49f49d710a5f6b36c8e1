#!/usr/bin/env node
/**
 * Example: OpenAI ↔ Gemini Response Schema Mapping
 *
 * This example demonstrates:
 * 1. Converting complete OpenAI responses to Gemini format
 * 2. Converting complete Gemini responses to OpenAI format
 * 3. Handling finish reasons, usage statistics, and structured output
 * 4. Extracting JSON from responses (including markdown code blocks)
 *
 * The translation handles:
 * - Response ID generation
 * - Finish reason mapping (stop ↔ STOP, length ↔ MAX_TOKENS, etc.)
 * - Usage statistics translation
 * - Candidate/choice mapping
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// Import protocol translation
const {
    geminiToOpenAIResponse,
    openAIToGeminiResponse,
    mapGeminiFinishReason,
    mapOpenAIFinishReason,
    geminiUsageToOpenAI,
    openAIUsageToGemini,
    extractJSON,
    validateAgainstSchema,
    translateOpenAIRequestToGemini,
} = await import(
    join(ROOT_DIR, 'packages_mjs/fetch_undici_gemini_openai_protocols/dist/index.js')
);

// Import fetch client
const { AsyncClient, Timeout } = await import(
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

// =============================================================================
// Example 1: Finish Reason Mapping
// =============================================================================

console.log('='.repeat(60));
console.log('Example 1: Finish Reason Mapping');
console.log('='.repeat(60));

const geminiFinishReasons = ['STOP', 'MAX_TOKENS', 'SAFETY', 'RECITATION', 'OTHER', null];
const openAIFinishReasons = ['stop', 'length', 'content_filter', 'tool_calls', 'function_call', null];

console.log('\nGemini → OpenAI Finish Reason Mapping:');
for (const reason of geminiFinishReasons) {
    const mapped = mapGeminiFinishReason(reason);
    console.log(`  ${reason} → ${mapped}`);
}

console.log('\nOpenAI → Gemini Finish Reason Mapping:');
for (const reason of openAIFinishReasons) {
    const mapped = mapOpenAIFinishReason(reason);
    console.log(`  ${reason} → ${mapped}`);
}

// =============================================================================
// Example 2: Usage Statistics Translation
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 2: Usage Statistics Translation');
console.log('='.repeat(60));

// Gemini usage metadata
const geminiUsage = {
    promptTokenCount: 150,
    candidatesTokenCount: 75,
    totalTokenCount: 225,
};

console.log('\nGemini Usage Metadata:');
console.log(JSON.stringify(geminiUsage, null, 2));

const openAIUsage = geminiUsageToOpenAI(geminiUsage);
console.log('\nTranslated to OpenAI Usage:');
console.log(JSON.stringify(openAIUsage, null, 2));

// OpenAI usage
const openAIUsageData = {
    prompt_tokens: 100,
    completion_tokens: 50,
    total_tokens: 150,
};

console.log('\nOpenAI Usage:');
console.log(JSON.stringify(openAIUsageData, null, 2));

const geminiUsageData = openAIUsageToGemini(openAIUsageData);
console.log('\nTranslated to Gemini Usage Metadata:');
console.log(JSON.stringify(geminiUsageData, null, 2));

// =============================================================================
// Example 3: Complete Response Translation (Gemini → OpenAI)
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 3: Gemini → OpenAI Response Translation');
console.log('='.repeat(60));

// Simulated Gemini generateContent response
const geminiResponse = {
    candidates: [
        {
            content: {
                role: 'model',
                parts: [
                    { text: 'The weather in San Francisco is typically mild and pleasant.' },
                ],
            },
            finishReason: 'STOP',
            index: 0,
        },
    ],
    usageMetadata: {
        promptTokenCount: 25,
        candidatesTokenCount: 15,
        totalTokenCount: 40,
    },
};

console.log('\nGemini Response:');
console.log(JSON.stringify(geminiResponse, null, 2));

const openAIResponseResult = geminiToOpenAIResponse(geminiResponse, 'gemini-2.0-flash');

console.log('\nTranslated to OpenAI Response:');
console.log(JSON.stringify(openAIResponseResult.data, null, 2));

// =============================================================================
// Example 4: Complete Response Translation (OpenAI → Gemini)
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 4: OpenAI → Gemini Response Translation');
console.log('='.repeat(60));

// Simulated OpenAI chat completion response
const openAIResponse = {
    id: 'chatcmpl-123456',
    object: 'chat.completion',
    created: 1700000000,
    model: 'gpt-4',
    choices: [
        {
            index: 0,
            message: {
                role: 'assistant',
                content: 'Hello! How can I assist you today?',
            },
            finish_reason: 'stop',
        },
    ],
    usage: {
        prompt_tokens: 10,
        completion_tokens: 8,
        total_tokens: 18,
    },
};

console.log('\nOpenAI Response:');
console.log(JSON.stringify(openAIResponse, null, 2));

const geminiResponseResult = openAIToGeminiResponse(openAIResponse);

console.log('\nTranslated to Gemini Response:');
console.log(JSON.stringify(geminiResponseResult.data, null, 2));

// =============================================================================
// Example 5: Response with Tool Calls Translation
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 5: Response with Tool Calls Translation');
console.log('='.repeat(60));

// Gemini response with function calls
const geminiWithFunctionCalls = {
    candidates: [
        {
            content: {
                role: 'model',
                parts: [
                    {
                        functionCall: {
                            name: 'get_weather',
                            args: { location: 'Tokyo', unit: 'celsius' },
                        },
                    },
                ],
            },
            finishReason: 'STOP',
            index: 0,
        },
    ],
    usageMetadata: {
        promptTokenCount: 50,
        candidatesTokenCount: 20,
        totalTokenCount: 70,
    },
};

console.log('\nGemini Response with Function Call:');
console.log(JSON.stringify(geminiWithFunctionCalls, null, 2));

const openAIWithToolCalls = geminiToOpenAIResponse(geminiWithFunctionCalls, 'gemini-2.0-flash');

console.log('\nTranslated to OpenAI Response:');
console.log(JSON.stringify(openAIWithToolCalls.data, null, 2));

// Notice: finish_reason becomes 'tool_calls' when function calls are present

// =============================================================================
// Example 6: JSON Extraction from Response Content
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 6: JSON Extraction from Response Content');
console.log('='.repeat(60));

const testCases = [
    // Direct JSON
    '{"name": "John", "age": 30}',

    // JSON in markdown code block
    '```json\n{"city": "Boston", "temp": 72}\n```',

    // JSON in code block without language tag
    '```\n{"status": "ok"}\n```',

    // JSON embedded in text
    'Here is the result: {"success": true, "data": [1, 2, 3]} as requested.',

    // Invalid JSON
    'This is not JSON at all.',
];

for (const content of testCases) {
    console.log(`\nInput: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
    const extracted = extractJSON(content);
    console.log(`Extracted: ${JSON.stringify(extracted)}`);
}

// =============================================================================
// Example 7: Live API Call with Structured Output
// =============================================================================

if (GEMINI_API_KEY) {
    console.log('\n' + '='.repeat(60));
    console.log('Example 7: Live API Call with Structured Output');
    console.log('='.repeat(60));

    const schema = {
        type: 'object',
        properties: {
            city: { type: 'string' },
            temperature: { type: 'number' },
            conditions: { type: 'string' },
        },
        required: ['city', 'temperature', 'conditions'],
    };

    const openAIRequest = {
        model: 'gemini-2.0-flash',
        messages: [
            { role: 'system', content: 'Return ONLY valid JSON matching the schema.' },
            { role: 'user', content: 'Generate a weather report for Seattle.' },
        ],
        response_format: {
            type: 'json_schema',
            json_schema: {
                name: 'WeatherReport',
                schema,
                strict: true,
            },
        },
    };

    console.log('\nOpenAI-style Request:');
    console.log(JSON.stringify(openAIRequest, null, 2));

    // Translate to Gemini
    const translatedRequest = translateOpenAIRequestToGemini(openAIRequest);
    console.log('\nTranslated to Gemini Request:');
    console.log(JSON.stringify(translatedRequest.data, null, 2));

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
            const geminiResp = await response.json();
            console.log('\nGemini Native Response:');
            console.log(JSON.stringify(geminiResp, null, 2));

            // Translate to OpenAI format
            const openAIResp = geminiToOpenAIResponse(geminiResp, 'gemini-2.0-flash');
            console.log('\nTranslated to OpenAI Response:');
            console.log(JSON.stringify(openAIResp.data, null, 2));

            // Extract JSON from response
            const content = openAIResp.data.choices?.[0]?.message?.content;
            if (content) {
                const parsedJSON = extractJSON(content);
                console.log('\nExtracted JSON:');
                console.log(JSON.stringify(parsedJSON, null, 2));

                // Validate against schema
                const validation = validateAgainstSchema(parsedJSON, schema);
                console.log(`\nSchema Validation: ${validation[0] ? 'PASSED' : 'FAILED'}`);
                if (!validation[0]) {
                    console.log('Validation Errors:', validation[1]);
                }
            }
        } else {
            const errorText = await response.text();
            console.error('\nAPI Error:', response.statusCode, errorText);
        }
    } catch (error) {
        console.error('\nRequest Error:', error.message);
    } finally {
        await client.close();
    }
} else {
    console.log('\n(Skipping live API example - GEMINI_API_KEY not set)');
}

console.log('\n' + '='.repeat(60));
console.log('Schema Mapping Examples Complete');
console.log('='.repeat(60));
