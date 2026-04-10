/**
 * CLI Module - Command Line Interface
 *
 * Provides CLI commands for interacting with Gemini API.
 */

import { create } from './logger.mjs';
import { GeminiClient } from './gemini-client.mjs';
import { MODELS, DEFAULT_MODEL } from './constants.mjs';
import { showConfig, validateEnvironment } from './devtools.mjs';
import { getAvailableTools } from './tools.mjs';

const logger = create('gemini-openai-sdk', import.meta.url);

// =============================================================================
// Argument Parser
// =============================================================================

/**
 * Parse command line arguments.
 * @param {Array<string>} args - Command line arguments
 * @returns {object} Parsed arguments
 */
export function parseArgs(args) {
  const result = {
    command: null,
    prompt: null,
    model: DEFAULT_MODEL,
    temperature: null,
    maxTokens: null,
    schema: null,
    json: false,
    verbose: false,
    help: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--verbose' || arg === '-v') {
      result.verbose = true;
    } else if (arg === '--json' || arg === '-j') {
      result.json = true;
    } else if (arg === '--model' || arg === '-m') {
      result.model = args[++i] || DEFAULT_MODEL;
    } else if (arg === '--temperature' || arg === '-t') {
      result.temperature = parseFloat(args[++i]) || 0.7;
    } else if (arg === '--max-tokens') {
      result.maxTokens = parseInt(args[++i], 10) || 1000;
    } else if (arg === '--schema' || arg === '-s') {
      try {
        result.schema = JSON.parse(args[++i] || '{}');
      } catch {
        result.schema = {};
      }
    } else if (!arg.startsWith('-') && !result.command) {
      result.command = arg;
    } else if (!arg.startsWith('-') && !result.prompt) {
      result.prompt = arg;
    }

    i++;
  }

  return result;
}

// =============================================================================
// Help Text
// =============================================================================

const HELP_TEXT = `
Gemini OpenAI SDK CLI

Usage:
  gemini-openai <command> [options] [prompt]

Commands:
  chat        Send a chat message and get a response
  stream      Stream a chat response
  structure   Get structured JSON output with a schema
  tool-call   Execute with function calling
  json        Get JSON object response
  health      Check SDK health and configuration
  config      Display current configuration
  validate    Validate environment setup

Options:
  -m, --model <type>      Model type: flash, pro, thinking (default: flash)
  -t, --temperature <n>   Sampling temperature (default: 0.7)
  --max-tokens <n>        Maximum tokens (default: 1000)
  -s, --schema <json>     JSON schema for structure command
  -j, --json              Output as JSON
  -v, --verbose           Enable verbose logging
  -h, --help              Show this help message

Examples:
  gemini-openai chat "Hello, world!"
  gemini-openai chat -m pro "Explain quantum computing"
  gemini-openai stream "Tell me a story"
  gemini-openai structure -s '{"type":"object","properties":{"name":{"type":"string"}}}' "Extract the name from: John Smith"
  gemini-openai tool-call "What is 2 + 2?"
  gemini-openai health
  gemini-openai config
  gemini-openai validate

Environment:
  GEMINI_API_KEY    Required. Your Gemini API key.
  LOG_LEVEL         Optional. DEBUG, INFO, WARN, ERROR (default: INFO)
`;

// =============================================================================
// Command Handlers
// =============================================================================

/**
 * Handle chat command.
 */
async function handleChat(client, args) {
  if (!args.prompt) {
    console.error('Error: prompt is required for chat command');
    process.exit(1);
  }

  const result = await client.chat(args.prompt, {
    model: args.model,
    temperature: args.temperature,
    maxTokens: args.maxTokens,
  });

  return result;
}

/**
 * Handle stream command.
 */
async function handleStream(client, args) {
  if (!args.prompt) {
    console.error('Error: prompt is required for stream command');
    process.exit(1);
  }

  if (args.json) {
    // JSON mode: return accumulated result
    const result = await client.stream(args.prompt, {
      model: args.model,
      temperature: args.temperature,
    });
    return result;
  }

  // Interactive mode: print chunks as they arrive
  process.stdout.write('\n');
  for await (const chunk of client.streamGenerator(args.prompt, {
    model: args.model,
    temperature: args.temperature,
  })) {
    try {
      const parsed = JSON.parse(chunk);
      const content = parsed.choices?.[0]?.delta?.content;
      if (content) {
        process.stdout.write(content);
      }
    } catch {
      // Skip invalid chunks
    }
  }
  process.stdout.write('\n\n');

  return { success: true, streamed: true };
}

/**
 * Handle structure command.
 */
async function handleStructure(client, args) {
  if (!args.prompt) {
    console.error('Error: prompt is required for structure command');
    process.exit(1);
  }

  const schema = args.schema || {
    type: 'object',
    properties: {
      response: { type: 'string' },
    },
    required: ['response'],
  };

  const result = await client.structure(args.prompt, schema, {
    model: args.model,
  });

  return result;
}

/**
 * Handle tool-call command.
 */
async function handleToolCall(client, args) {
  if (!args.prompt) {
    console.error('Error: prompt is required for tool-call command');
    process.exit(1);
  }

  const result = await client.toolCall(args.prompt, {
    model: args.model,
  });

  return result;
}

/**
 * Handle json command.
 */
async function handleJson(client, args) {
  if (!args.prompt) {
    console.error('Error: prompt is required for json command');
    process.exit(1);
  }

  const result = await client.jsonMode(args.prompt, {
    model: args.model,
  });

  return result;
}

/**
 * Handle health command.
 */
function handleHealth(client) {
  return client.healthCheck();
}

/**
 * Handle config command.
 */
function handleConfig() {
  const config = showConfig();
  config.available_tools = getAvailableTools();
  return config;
}

/**
 * Handle validate command.
 */
async function handleValidate() {
  return await validateEnvironment();
}

// =============================================================================
// Main Entry Point
// =============================================================================

/**
 * Run CLI with arguments.
 * @param {Array<string>} argv - Command line arguments (process.argv.slice(2))
 */
export async function run(argv) {
  const args = parseArgs(argv);

  if (args.help || !args.command) {
    console.log(HELP_TEXT);
    process.exit(args.help ? 0 : 1);
  }

  if (args.verbose) {
    process.env.LOG_LEVEL = 'DEBUG';
  }

  logger.debug('cli: parsed arguments', { command: args.command, model: args.model });

  const client = new GeminiClient({ model: args.model });

  let result;

  try {
    switch (args.command) {
      case 'chat':
        result = await handleChat(client, args);
        break;

      case 'stream':
        result = await handleStream(client, args);
        break;

      case 'structure':
        result = await handleStructure(client, args);
        break;

      case 'tool-call':
        result = await handleToolCall(client, args);
        break;

      case 'json':
        result = await handleJson(client, args);
        break;

      case 'health':
        result = handleHealth(client);
        break;

      case 'config':
        result = handleConfig();
        break;

      case 'validate':
        result = await handleValidate();
        break;

      default:
        console.error(`Unknown command: ${args.command}`);
        console.log(HELP_TEXT);
        process.exit(1);
    }

    // Output result
    if (args.json || typeof result === 'object') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(result);
    }

    // Exit with error code if result indicates failure
    if (result && result.success === false) {
      process.exit(1);
    }
  } catch (err) {
    logger.error('cli: command failed', { command: args.command, error: err.message });

    if (args.json) {
      console.log(JSON.stringify({ success: false, error: err.message }, null, 2));
    } else {
      console.error(`Error: ${err.message}`);
    }

    process.exit(1);
  }
}

export default { run, parseArgs };
