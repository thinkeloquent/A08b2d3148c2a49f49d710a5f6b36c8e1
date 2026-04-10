/**
 * Gemini OpenAI-Compatible Tool Calls Example
 *
 * Uses fetch_undici to demonstrate function calling (tool calls) with
 * Gemini's OpenAI-compatible endpoint.
 *
 * Run: node 2.gemini-openai-tool-calls.mjs
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

async function chatCompletion(messages, options = {}) {
  const payload = {
    model: options.model || 'gemini-2.0-flash',
    messages,
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

  const text = await body.text();

  if (statusCode >= 400) {
    throw new Error(`${statusCode}: ${text}`);
  }

  return JSON.parse(text);
}

// Define tools in OpenAI format
const weatherTool = {
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
};

const calculatorTool = {
  type: 'function',
  function: {
    name: 'calculate',
    description: 'Perform a mathematical calculation',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'The mathematical expression to evaluate',
        },
      },
      required: ['expression'],
    },
  },
};

// Simulated tool implementations
function executeWeather(args) {
  const { location, unit = 'celsius' } = args;
  // Simulated weather data
  return {
    location,
    temperature: unit === 'celsius' ? 22 : 72,
    unit,
    conditions: 'sunny',
    humidity: 45,
  };
}

function tokenizeMath(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    if (expr[i] === ' ') { i++; continue; }
    if ('+-*/()'.includes(expr[i])) {
      tokens.push(expr[i++]);
    } else if (/[0-9.]/.test(expr[i])) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) num += expr[i++];
      tokens.push(num);
    } else {
      throw new Error(`Unexpected character: ${expr[i]}`);
    }
  }
  return tokens;
}

function safeEvalMath(expression) {
  const tokens = tokenizeMath(expression);
  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function parseExpr() {
    let left = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm() {
    let left = parseFactor();
    while (peek() === '*' || peek() === '/') {
      const op = consume();
      const right = parseFactor();
      left = op === '*' ? left * right : left / right;
    }
    return left;
  }

  function parseFactor() {
    if (peek() === '(') {
      consume();
      const val = parseExpr();
      if (peek() !== ')') throw new Error('Missing closing parenthesis');
      consume();
      return val;
    }
    if (peek() === '-') { consume(); return -parseFactor(); }
    if (peek() === '+') { consume(); return parseFactor(); }
    const token = consume();
    if (token === undefined) throw new Error('Unexpected end of expression');
    const num = parseFloat(token);
    if (isNaN(num)) throw new Error(`Invalid number: ${token}`);
    return num;
  }

  const result = parseExpr();
  if (pos !== tokens.length) throw new Error('Unexpected token after expression');
  return result;
}

function executeCalculate(args) {
  const { expression } = args;
  try {
    const result = safeEvalMath(expression);
    return { expression, result };
  } catch (e) {
    return { expression, error: 'Invalid expression' };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Gemini OpenAI-Compatible Tool Calls Examples');
  console.log('='.repeat(60));
  console.log();

  // Example 1: Basic tool call
  console.log('--- Example 1: Basic Tool Call ---');
  try {
    const response = await chatCompletion([
      { role: 'system', content: 'You are a helpful assistant. Use the provided tools when appropriate.' },
      { role: 'user', content: 'What is the weather in Tokyo?' }
    ], {
      tools: [weatherTool],
      tool_choice: 'auto',
    });

    console.log('Response:');
    const choice = response.choices[0];
    console.log('Finish reason:', choice.finish_reason);

    if (choice.message.tool_calls) {
      console.log('Tool calls:');
      for (const toolCall of choice.message.tool_calls) {
        console.log(`  - ${toolCall.function.name}(${toolCall.function.arguments})`);

        // Execute the tool
        const args = JSON.parse(toolCall.function.arguments);
        const result = executeWeather(args);
        console.log('  Result:', JSON.stringify(result));
      }
    } else {
      console.log('Content:', choice.message.content);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 2: Multiple tools available
  console.log('--- Example 2: Multiple Tools Available ---');
  try {
    const response = await chatCompletion([
      { role: 'user', content: 'What is 15 * 7 + 23?' }
    ], {
      tools: [weatherTool, calculatorTool],
      tool_choice: 'auto',
    });

    const choice = response.choices[0];
    if (choice.message.tool_calls) {
      console.log('Tool calls:');
      for (const toolCall of choice.message.tool_calls) {
        console.log(`  - ${toolCall.function.name}(${toolCall.function.arguments})`);

        const args = JSON.parse(toolCall.function.arguments);
        if (toolCall.function.name === 'calculate') {
          const result = executeCalculate(args);
          console.log('  Result:', JSON.stringify(result));
        }
      }
    } else {
      console.log('Content:', choice.message.content);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 3: Complete tool call conversation
  console.log('--- Example 3: Complete Tool Call Conversation ---');
  try {
    // Initial request
    const response1 = await chatCompletion([
      { role: 'user', content: 'What is the weather in Paris?' }
    ], {
      tools: [weatherTool],
    });

    const choice1 = response1.choices[0];
    const toolCalls = choice1.message.tool_calls;

    if (toolCalls) {
      console.log('Step 1 - Model requested tool call:');
      console.log(`  ${toolCalls[0].function.name}(${toolCalls[0].function.arguments})`);

      // Execute tool and get result
      const args = JSON.parse(toolCalls[0].function.arguments);
      const toolResult = executeWeather(args);
      console.log('Step 2 - Tool result:', JSON.stringify(toolResult));

      // Continue conversation with tool result
      const response2 = await chatCompletion([
        { role: 'user', content: 'What is the weather in Paris?' },
        {
          role: 'assistant',
          content: null,
          tool_calls: toolCalls,
        },
        {
          role: 'tool',
          tool_call_id: toolCalls[0].id,
          content: JSON.stringify(toolResult),
        },
      ], {
        tools: [weatherTool],
      });

      console.log('Step 3 - Final response:');
      console.log(response2.choices[0].message.content);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 4: Forced tool choice
  console.log('--- Example 4: Forced Tool Choice ---');
  try {
    const response = await chatCompletion([
      { role: 'user', content: 'Tell me about the Eiffel Tower.' }
    ], {
      tools: [weatherTool],
      tool_choice: { type: 'function', function: { name: 'get_weather' } },
    });

    const choice = response.choices[0];
    if (choice.message.tool_calls) {
      console.log('Forced tool call:');
      for (const toolCall of choice.message.tool_calls) {
        console.log(`  - ${toolCall.function.name}(${toolCall.function.arguments})`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 5: Tool definition format
  console.log('--- Example 5: OpenAI Tool Definition Format ---');
  console.log(`
┌─────────────────────────────────────────────────────────────────┐
│                   OPENAI TOOL DEFINITION FORMAT                  │
├─────────────────────────────────────────────────────────────────┤
│ {                                                               │
│   "type": "function",                                           │
│   "function": {                                                 │
│     "name": "function_name",                                    │
│     "description": "What the function does",                    │
│     "parameters": {                                             │
│       "type": "object",                                         │
│       "properties": {                                           │
│         "param1": { "type": "string", "description": "..." },   │
│         "param2": { "type": "number", "description": "..." }    │
│       },                                                        │
│       "required": ["param1"]                                    │
│     }                                                           │
│   }                                                             │
│ }                                                               │
├─────────────────────────────────────────────────────────────────┤
│ Tool Choice Options:                                            │
│ • "auto" - Model decides whether to use tools                   │
│ • "none" - Model should not use any tools                       │
│ • "required" - Model must use a tool                            │
│ • {"type":"function","function":{"name":"X"}} - Force specific  │
└─────────────────────────────────────────────────────────────────┘
`);

  console.log('='.repeat(60));
  console.log('Tool Calls Examples Complete');
  console.log('='.repeat(60));
}

main().catch(console.error);
