/**
 * Test Helpers and Utilities
 *
 * Shared utilities for testing gemini-openai-sdk.
 */

/**
 * Create a logger spy that captures log calls.
 * @returns {{logs: object, mockLogger: object}}
 */
export function createLoggerSpy() {
  const logs = { debug: [], info: [], warn: [], error: [] };

  const mockLogger = {
    debug: (msg, data) => logs.debug.push({ msg, data }),
    info: (msg, data) => logs.info.push({ msg, data }),
    warn: (msg, data) => logs.warn.push({ msg, data }),
    error: (msg, data, err) => logs.error.push({ msg, data, err }),
    trace: (msg, data) => logs.debug.push({ msg, data }),
  };

  return { logs, mockLogger };
}

/**
 * Check if logs contain expected text at given level.
 * @param {object} logs - Logs object from createLoggerSpy
 * @param {string} level - Log level (debug, info, warn, error)
 * @param {string} text - Text to search for
 * @returns {boolean}
 */
export function expectLogContains(logs, level, text) {
  const found = logs[level]?.some(entry =>
    entry.msg?.includes(text) || JSON.stringify(entry.data)?.includes(text)
  );
  return found;
}

/**
 * Create a mock HTTP response.
 * @param {object} options - Response options
 * @returns {object}
 */
export function createMockResponse(options = {}) {
  const {
    statusCode = 200,
    body = {},
    headers = { 'content-type': 'application/json' },
  } = options;

  return {
    statusCode,
    body: {
      json: async () => body,
      text: async () => JSON.stringify(body),
    },
    headers,
  };
}

/**
 * Create a mock chat completion response.
 * @param {object} options - Response options
 * @returns {object}
 */
export function createMockChatResponse(options = {}) {
  const {
    content = 'Hello! How can I help you today?',
    model = 'gemini-2.0-flash',
    finishReason = 'stop',
    promptTokens = 10,
    completionTokens = 15,
  } = options;

  return {
    id: 'chatcmpl-test123',
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content,
        },
        finish_reason: finishReason,
      },
    ],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
    },
  };
}

/**
 * Create mock streaming chunks.
 * @param {string} content - Content to split into chunks
 * @param {string} model - Model name
 * @returns {string[]}
 */
export function createMockStreamChunks(content = 'Hello world', model = 'gemini-2.0-flash') {
  const chunks = [];

  // First chunk with role
  chunks.push(JSON.stringify({
    id: 'chatcmpl-mock-stream',
    object: 'chat.completion.chunk',
    model,
    choices: [
      {
        index: 0,
        delta: { role: 'assistant' },
        finish_reason: null,
      },
    ],
  }));

  // Content chunks (split by word for testing)
  const words = content.split(' ');
  for (let i = 0; i < words.length; i++) {
    const word = i === 0 ? words[i] : ' ' + words[i];
    chunks.push(JSON.stringify({
      id: 'chatcmpl-mock-stream',
      object: 'chat.completion.chunk',
      model,
      choices: [
        {
          index: 0,
          delta: { content: word },
          finish_reason: null,
        },
      ],
    }));
  }

  // Final chunk
  chunks.push(JSON.stringify({
    id: 'chatcmpl-mock-stream',
    object: 'chat.completion.chunk',
    model,
    choices: [
      {
        index: 0,
        delta: {},
        finish_reason: 'stop',
      },
    ],
  }));

  return chunks;
}

/**
 * Set up mock environment variables.
 * @param {object} vars - Variables to set
 * @returns {Function} Cleanup function
 */
export function mockEnv(vars) {
  const original = {};

  for (const [key, value] of Object.entries(vars)) {
    original[key] = process.env[key];
    if (value === null || value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return () => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
}

/**
 * Create a test Fastify server instance.
 * @param {object} config - Server configuration
 * @returns {Promise<object>}
 */
export async function createTestServer(config = {}) {
  const Fastify = (await import('fastify')).default;

  const defaultConfig = {
    logger: false,
    ...config,
  };

  const server = Fastify(defaultConfig);

  // Add test routes
  server.get('/health', async () => ({
    status: 'ok',
    service: 'gemini-openai-sdk',
  }));

  server.get('/api/llm/gemini-openai-v1/health', async () => ({
    status: 'ok',
    api_version: 'v1',
  }));

  await server.ready();
  return server;
}

export default {
  createLoggerSpy,
  expectLogContains,
  createMockResponse,
  createMockChatResponse,
  createMockStreamChunks,
  mockEnv,
  createTestServer,
};
