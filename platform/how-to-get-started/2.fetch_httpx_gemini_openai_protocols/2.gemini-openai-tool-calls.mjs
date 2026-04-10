#!/usr/bin/env node
/**
 * Example: OpenAI ↔ Gemini Tool Call Normalization
 *
 * This example demonstrates:
 * 1. Converting OpenAI tool definitions to Gemini function declarations
 * 2. Converting OpenAI tool_calls to Gemini functionCall parts
 * 3. Converting Gemini function calls back to OpenAI tool_calls
 * 4. Handling tool_choice / toolConfig translation
 *
 * The translation handles:
 * - Tool definition schema translation
 * - Tool call ID generation
 * - Arguments serialization (JSON string ↔ object)
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// Import protocol translation
const {
    openAIToolsToGemini,
    geminiToolsToOpenAI,
    openAIToolCallsToGemini,
    geminiFunctionCallsToOpenAI,
    openAIToolChoiceToGemini,
    geminiToolConfigToOpenAI,
    translateOpenAIRequestToGemini,
    translateGeminiResponseToOpenAI,
    generateToolCallId,
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
if (!GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY environment variable not set');
    console.error('Set it with: export GEMINI_API_KEY=your_api_key');
    process.exit(1);
}

// =============================================================================
// Example 1: Tool Definition Translation
// =============================================================================

console.log('='.repeat(60));
console.log('Example 1: OpenAI → Gemini Tool Definition Translation');
console.log('='.repeat(60));

// OpenAI-style tool definitions
const openAITools = [
    {
        type: 'function',
        function: {
            name: 'get_weather',
            description: 'Get the current weather for a location',
            parameters: {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description: 'The city and state, e.g., San Francisco, CA',
                    },
                    unit: {
                        type: 'string',
                        enum: ['celsius', 'fahrenheit'],
                        description: 'Temperature unit',
                    },
                },
                required: ['location'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'search_web',
            description: 'Search the web for information',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The search query',
                    },
                    max_results: {
                        type: 'number',
                        description: 'Maximum number of results',
                    },
                },
                required: ['query'],
            },
        },
    },
];

console.log('\nOpenAI Tools:');
console.log(JSON.stringify(openAITools, null, 2));

// Translate to Gemini format
const geminiToolsResult = openAIToolsToGemini(openAITools);

console.log('\nGemini Tools:');
console.log(JSON.stringify(geminiToolsResult.data, null, 2));

// =============================================================================
// Example 2: Tool Call Translation (OpenAI → Gemini)
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 2: OpenAI → Gemini Tool Call Translation');
console.log('='.repeat(60));

// OpenAI-style tool calls (from assistant response)
const openAIToolCalls = [
    {
        id: 'call_abc123',
        type: 'function',
        function: {
            name: 'get_weather',
            arguments: JSON.stringify({ location: 'San Francisco, CA', unit: 'fahrenheit' }),
        },
    },
    {
        id: 'call_def456',
        type: 'function',
        function: {
            name: 'search_web',
            arguments: JSON.stringify({ query: 'best restaurants SF', max_results: 5 }),
        },
    },
];

console.log('\nOpenAI Tool Calls:');
console.log(JSON.stringify(openAIToolCalls, null, 2));

// Translate to Gemini format
const geminiPartsResult = openAIToolCallsToGemini(openAIToolCalls);

console.log('\nGemini Function Call Parts:');
console.log(JSON.stringify(geminiPartsResult.data, null, 2));

// =============================================================================
// Example 3: Tool Call Translation (Gemini → OpenAI)
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 3: Gemini → OpenAI Tool Call Translation');
console.log('='.repeat(60));

// Gemini-style function call parts
const geminiFunctionCallParts = [
    {
        functionCall: {
            name: 'get_weather',
            args: { location: 'New York, NY', unit: 'celsius' },
        },
    },
    {
        functionCall: {
            name: 'search_web',
            args: { query: 'weather forecast NYC' },
        },
    },
];

console.log('\nGemini Function Call Parts:');
console.log(JSON.stringify(geminiFunctionCallParts, null, 2));

// Translate to OpenAI format
const openAIToolCallsResult = geminiFunctionCallsToOpenAI(geminiFunctionCallParts);

console.log('\nOpenAI Tool Calls:');
console.log(JSON.stringify(openAIToolCallsResult.data, null, 2));

// =============================================================================
// Example 4: Tool Choice Translation
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 4: Tool Choice / Tool Config Translation');
console.log('='.repeat(60));

const toolChoices = ['none', 'auto', 'required', { type: 'function', function: { name: 'get_weather' } }];

for (const choice of toolChoices) {
    const geminiConfig = openAIToolChoiceToGemini(choice);
    console.log(`\nOpenAI tool_choice: ${JSON.stringify(choice)}`);
    console.log(`Gemini toolConfig: ${JSON.stringify(geminiConfig)}`);

    // Translate back
    const backToOpenAI = geminiToolConfigToOpenAI(geminiConfig);
    console.log(`Back to OpenAI: ${JSON.stringify(backToOpenAI)}`);
}

// =============================================================================
// Example 5: Live API Call with Tool Calls
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 5: Live API Call with Tool Calls');
console.log('='.repeat(60));

// OpenAI-style request with tools
const openAIRequest = {
    model: 'gemini-2.0-flash',
    messages: [
        { role: 'system', content: 'You are a helpful assistant. Use the provided tools when appropriate.' },
        { role: 'user', content: 'What is the weather in Tokyo?' },
    ],
    tools: [
        {
            type: 'function',
            function: {
                name: 'get_weather',
                description: 'Get the current weather for a location',
                parameters: {
                    type: 'object',
                    properties: {
                        location: { type: 'string', description: 'City name' },
                        unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
                    },
                    required: ['location'],
                },
            },
        },
    ],
    tool_choice: 'auto',
};

console.log('\nOpenAI-style Request:');
console.log(JSON.stringify(openAIRequest, null, 2));

// Translate to Gemini
const translatedRequest = translateOpenAIRequestToGemini(openAIRequest);
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

        // Check for tool calls
        const choice = openAIResponse.data.choices?.[0];
        if (choice?.message?.tool_calls) {
            console.log('\nTool Calls Detected:');
            for (const toolCall of choice.message.tool_calls) {
                console.log(`  - ${toolCall.function.name}(${toolCall.function.arguments})`);
            }
        } else if (choice?.message?.content) {
            console.log('\nText Response:', choice.message.content);
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

// =============================================================================
// Example 6: Gemini → OpenAI Tool Definition Translation
// =============================================================================

console.log('\n' + '='.repeat(60));
console.log('Example 6: Gemini → OpenAI Tool Definition Translation');
console.log('='.repeat(60));

// Gemini-style tools
const geminiTools = [
    {
        functionDeclarations: [
            {
                name: 'calculate',
                description: 'Perform a mathematical calculation',
                parameters: {
                    type: 'object',
                    properties: {
                        expression: { type: 'string', description: 'Math expression to evaluate' },
                    },
                    required: ['expression'],
                },
            },
            {
                name: 'translate',
                description: 'Translate text to another language',
                parameters: {
                    type: 'object',
                    properties: {
                        text: { type: 'string', description: 'Text to translate' },
                        target_language: { type: 'string', description: 'Target language code' },
                    },
                    required: ['text', 'target_language'],
                },
            },
        ],
    },
];

console.log('\nGemini Tools:');
console.log(JSON.stringify(geminiTools, null, 2));

// Translate to OpenAI format
const openAIToolsResult = geminiToolsToOpenAI(geminiTools);

console.log('\nOpenAI Tools:');
console.log(JSON.stringify(openAIToolsResult.data, null, 2));

console.log('\n' + '='.repeat(60));
console.log('Tool Call Examples Complete');
console.log('='.repeat(60));
