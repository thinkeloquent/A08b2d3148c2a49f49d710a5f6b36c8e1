/**
 * Gemini OpenAI SDK Routes
 *
 * REST API endpoints exposing Gemini OpenAI SDK functionality.
 * Base path: /api/llm/gemini-openai-v1/
 */

import { GeminiClient, ROUTE_PREFIX } from 'gemini-openai-sdk';

const BASE_PATH = ROUTE_PREFIX;

// Module-scoped client instance
const client = new GeminiClient();

/**
 * Request body schemas for Fastify validation
 */
const chatRequestSchema = {
  type: 'object',
  required: ['prompt'],
  properties: {
    prompt: { type: 'string' },
    model: { type: 'string', default: 'flash' },
    temperature: { type: 'number', default: 0.7 },
    max_tokens: { type: 'integer', default: 1000 },
  },
};

const structureRequestSchema = {
  type: 'object',
  required: ['prompt', 'schema'],
  properties: {
    prompt: { type: 'string' },
    schema: { type: 'object' },
  },
};

const toolCallRequestSchema = {
  type: 'object',
  required: ['prompt'],
  properties: {
    prompt: { type: 'string' },
    tools: { type: 'array', nullable: true },
  },
};

const conversationRequestSchema = {
  type: 'object',
  required: ['messages'],
  properties: {
    messages: { type: 'array', items: { type: 'object' } },
    model: { type: 'string', default: 'flash' },
    temperature: { type: 'number', default: 0.7 },
    max_tokens: { type: 'integer', default: 1000 },
  },
};

/**
 * Mount routes to the Fastify application.
 * This function is called by the server bootstrap process.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  /**
   * GET /api/llm/gemini-openai-v1/health
   * SDK health check
   */
  server.get(`${BASE_PATH}/health`, async (request, reply) => {
    return client.healthCheck();
  });

  /**
   * POST /api/llm/gemini-openai-v1/chat
   * Chat completion
   */
  server.post(
    `${BASE_PATH}/chat`,
    { schema: { body: chatRequestSchema } },
    async (request, reply) => {
      const { prompt, model, temperature, max_tokens } = request.body;
      const result = await client.chat(prompt, {
        model,
        temperature,
        maxTokens: max_tokens,
      });
      return result;
    }
  );

  /**
   * POST /api/llm/gemini-openai-v1/stream
   * SSE streaming response
   */
  server.post(`${BASE_PATH}/stream`, async (request, reply) => {
    const { prompt, model, temperature } = request.body || {};

    if (!prompt) {
      reply.code(400);
      return { error: 'prompt is required' };
    }

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    try {
      for await (const chunk of client.streamGenerator(prompt, { model, temperature })) {
        reply.raw.write(`data: ${chunk}\n\n`);
      }
      reply.raw.write('data: [DONE]\n\n');
    } catch (err) {
      reply.raw.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    }

    reply.raw.end();
  });

  /**
   * POST /api/llm/gemini-openai-v1/structure
   * Structured JSON output
   */
  server.post(
    `${BASE_PATH}/structure`,
    { schema: { body: structureRequestSchema } },
    async (request, reply) => {
      const { prompt, schema } = request.body;
      const result = await client.structure(prompt, schema);
      return result;
    }
  );

  /**
   * POST /api/llm/gemini-openai-v1/tool-call
   * Function calling
   */
  server.post(
    `${BASE_PATH}/tool-call`,
    { schema: { body: toolCallRequestSchema } },
    async (request, reply) => {
      const { prompt, tools } = request.body;
      const result = await client.toolCall(prompt, { tools });
      return result;
    }
  );

  /**
   * POST /api/llm/gemini-openai-v1/json
   * JSON mode
   */
  server.post(`${BASE_PATH}/json`, async (request, reply) => {
    const { prompt, model } = request.body || {};

    if (!prompt) {
      reply.code(400);
      return { error: 'prompt is required' };
    }

    const result = await client.jsonMode(prompt, { model });
    return result;
  });

  /**
   * POST /api/llm/gemini-openai-v1/conversation
   * Multi-turn chat
   */
  server.post(
    `${BASE_PATH}/conversation`,
    { schema: { body: conversationRequestSchema } },
    async (request, reply) => {
      const { messages, model, temperature, max_tokens } = request.body;
      const result = await client.conversation(messages, {
        model,
        temperature,
        maxTokens: max_tokens,
      });
      return result;
    }
  );
}
