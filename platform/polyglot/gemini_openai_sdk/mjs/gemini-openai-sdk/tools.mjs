/**
 * Tools Module - Tool Definitions and Executors
 *
 * OpenAI function-calling compatible tool definitions and execution.
 */

import { create } from './logger.mjs';

const logger = create('gemini-openai-sdk', import.meta.url);

// =============================================================================
// Tool Definitions (OpenAI Function Calling Format)
// =============================================================================

export const WEATHER_TOOL = {
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

export const CALCULATOR_TOOL = {
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

export const DEFAULT_TOOLS = [WEATHER_TOOL, CALCULATOR_TOOL];

// =============================================================================
// Tool Executors
// =============================================================================

/**
 * Simulated weather tool implementation.
 * @param {object} args - Arguments with location and optional unit
 * @returns {object} Weather data
 */
export function executeWeather(args) {
  logger.debug('executeWeather: enter', { args });

  const { location = 'Unknown', unit = 'celsius' } = args;

  const result = {
    location,
    temperature: unit === 'celsius' ? 22 : 72,
    unit,
    conditions: 'sunny',
    humidity: 45,
  };

  logger.info('executeWeather: success', { location, unit });
  return result;
}

/**
 * Tokenize a math expression into numbers and operators.
 * @param {string} expr
 * @returns {string[]}
 */
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

/**
 * Safely evaluate a math expression using recursive descent parsing.
 * Supports +, -, *, /, parentheses, and unary +/-.
 * @param {string} expression
 * @returns {number}
 */
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

/**
 * Calculator tool implementation using safe evaluation.
 * @param {object} args - Arguments with expression
 * @returns {object} Calculation result
 */
export function executeCalculate(args) {
  logger.debug('executeCalculate: enter', { args });

  const { expression = '' } = args;

  // Security: Only allow safe math operations
  const allowedChars = new Set('0123456789+-*/.() ');
  const isSafe = [...expression].every(c => allowedChars.has(c));

  if (!isSafe) {
    logger.warn('executeCalculate: unsafe expression rejected', { expression });
    return { expression, error: 'Invalid expression - unsafe characters' };
  }

  try {
    const result = safeEvalMath(expression);
    logger.info('executeCalculate: success', { expression, result });
    return { expression, result };
  } catch (err) {
    logger.error('executeCalculate: failed', { expression, error: err.message });
    return { expression, error: 'Invalid expression' };
  }
}

// =============================================================================
// Tool Registry
// =============================================================================

const toolRegistry = new Map([
  ['get_weather', executeWeather],
  ['calculate', executeCalculate],
]);

/**
 * Register a custom tool.
 * @param {string} name - Tool function name
 * @param {Function} executor - Function that executes the tool
 */
export function registerTool(name, executor) {
  logger.info('registerTool: registering', { name });
  toolRegistry.set(name, executor);
}

/**
 * Execute a registered tool by name.
 * @param {string} functionName - Name of the tool function
 * @param {object} args - Arguments for the tool
 * @returns {object} Tool execution result
 */
export function executeTool(functionName, args) {
  logger.debug('executeTool: enter', { functionName });

  const executor = toolRegistry.get(functionName);

  if (!executor) {
    logger.error('executeTool: unknown function', { functionName });
    return { error: `Unknown function: ${functionName}` };
  }

  try {
    const result = executor(args);
    logger.debug('executeTool: success', { functionName });
    return result;
  } catch (err) {
    logger.error('executeTool: failed', { functionName, error: err.message });
    return { error: err.message };
  }
}

/**
 * Process multiple tool calls from model response.
 * @param {Array} toolCalls - List of tool call objects from API response
 * @returns {Array} List of tool results
 */
export function processToolCalls(toolCalls) {
  logger.debug('processToolCalls: processing', { count: toolCalls.length });
  const results = [];

  for (const toolCall of toolCalls) {
    const funcName = toolCall.function.name;
    const funcArgsStr = toolCall.function.arguments;

    let funcArgs;
    try {
      funcArgs = JSON.parse(funcArgsStr);
    } catch {
      funcArgs = {};
      logger.warn('processToolCalls: failed to parse arguments', { funcName });
    }

    const toolResult = executeTool(funcName, funcArgs);

    results.push({
      id: toolCall.id,
      function: funcName,
      arguments: funcArgs,
      result: toolResult,
    });
  }

  logger.info('processToolCalls: processed', { count: results.length });
  return results;
}

/**
 * Get list of registered tool names.
 * @returns {Array<string>} Tool names
 */
export function getAvailableTools() {
  return [...toolRegistry.keys()];
}

export default {
  WEATHER_TOOL,
  CALCULATOR_TOOL,
  DEFAULT_TOOLS,
  executeWeather,
  executeCalculate,
  registerTool,
  executeTool,
  processToolCalls,
  getAvailableTools,
};
