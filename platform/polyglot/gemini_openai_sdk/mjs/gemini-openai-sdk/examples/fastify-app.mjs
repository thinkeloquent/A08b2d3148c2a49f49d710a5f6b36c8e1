#!/usr/bin/env node
/**
 * Gemini OpenAI SDK - Fastify Integration Example
 *
 * This script demonstrates how to integrate the gemini-openai-sdk
 * with a Fastify application using plugins and decorators.
 *
 * Requirements:
 *   - GEMINI_API_KEY environment variable set
 *   - Node.js 20.x+
 *   - gemini-openai-sdk package installed
 *   - fastify installed
 *
 * Usage:
 *   node fastify-app.mjs
 */

import Fastify from 'fastify';
import { GeminiClient } from '../gemini-client.mjs';
import { create } from '../logger.mjs';

// Create logger
const logger = create('fastify-example', import.meta.url);

// =============================================================================
// Gemini SDK Plugin
// =============================================================================

/**
 * Fastify plugin for Gemini SDK integration.
 *
 * Decorates the Fastify instance with a gemini client.
 */
async function geminiPlugin(fastify, opts) {
  const client = new GeminiClient(opts);

  // Decorate fastify instance
  fastify.decorate('gemini', client);

  // Log initialization
  const health = client.healthCheck();
  fastify.log.info({ status: health.status }, 'Gemini SDK initialized');

  // Add onClose hook for cleanup
  fastify.addHook('onClose', async () => {
    fastify.log.info('Gemini SDK cleanup');
  });
}

// =============================================================================
// Create Server
// =============================================================================

async function createServer() {
  const server = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register Gemini plugin
  await server.register(geminiPlugin, {
    model: 'flash',
    systemPrompt: 'You are a helpful assistant.',
  });

  // =============================================================================
  // Routes
  // =============================================================================

  // Health check
  server.get('/health', async () => ({
    status: 'ok',
    service: 'gemini-openai-sdk-fastify-example',
  }));

  // SDK health check
  server.get('/api/llm/gemini-openai-v1/health', async function () {
    return this.gemini.healthCheck();
  });

  // Chat endpoint
  server.post('/api/llm/gemini-openai-v1/chat', {
    schema: {
      body: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: { type: 'string' },
          model: { type: 'string', default: 'flash' },
          temperature: { type: 'number', default: 0.7 },
          maxTokens: { type: 'integer', default: 1000 },
        },
      },
    },
  }, async function (request) {
    const { prompt, model, temperature, maxTokens } = request.body;

    logger.info('chat: received request', { promptLength: prompt.length });

    const result = await this.gemini.chat(prompt, {
      model,
      temperature,
      maxTokens,
    });

    return {
      success: result.success,
      content: result.content,
      model: result.model,
      error: result.error,
    };
  });

  // Structure endpoint
  server.post('/api/llm/gemini-openai-v1/structure', {
    schema: {
      body: {
        type: 'object',
        required: ['prompt', 'schema'],
        properties: {
          prompt: { type: 'string' },
          schema: { type: 'object' },
        },
      },
    },
  }, async function (request) {
    const { prompt, schema } = request.body;

    logger.info('structure: received request');

    const result = await this.gemini.structure(prompt, schema);

    return {
      success: result.success,
      content: result.content,
      parsed: result.parsed,
      error: result.error,
    };
  });

  // Tool call endpoint
  server.post('/api/llm/gemini-openai-v1/tool-call', {
    schema: {
      body: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: { type: 'string' },
        },
      },
    },
  }, async function (request) {
    const { prompt } = request.body;

    logger.info('tool_call: received request');

    const result = await this.gemini.toolCall(prompt);

    return {
      success: result.success,
      content: result.content,
      tool_calls: result.tool_calls,
      error: result.error,
    };
  });

  // Stream endpoint (returns accumulated result)
  server.post('/api/llm/gemini-openai-v1/stream', {
    schema: {
      body: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: { type: 'string' },
          model: { type: 'string', default: 'flash' },
          temperature: { type: 'number', default: 0.7 },
        },
      },
    },
  }, async function (request) {
    const { prompt, model, temperature } = request.body;

    logger.info('stream: received request');

    const result = await this.gemini.stream(prompt, {
      model,
      temperature,
    });

    return {
      success: result.success,
      content: result.content,
      chunk_count: result.chunk_count,
      error: result.error,
    };
  });

  // JSON mode endpoint
  server.post('/api/llm/gemini-openai-v1/json', {
    schema: {
      body: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: { type: 'string' },
        },
      },
    },
  }, async function (request) {
    const { prompt } = request.body;

    logger.info('json_mode: received request');

    const result = await this.gemini.jsonMode(prompt);

    return {
      success: result.success,
      content: result.content,
      parsed: result.parsed,
      error: result.error,
    };
  });

  return server;
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  try {
    const server = await createServer();

    await server.listen({ port: 3000, host: '127.0.0.1' });

    console.log('\n');
    console.log('='.repeat(60));
    console.log('Gemini OpenAI SDK - Fastify Example Server');
    console.log('='.repeat(60));
    console.log('Server running at http://127.0.0.1:3000');
    console.log('');
    console.log('Endpoints:');
    console.log('  GET  /health');
    console.log('  GET  /api/llm/gemini-openai-v1/health');
    console.log('  POST /api/llm/gemini-openai-v1/chat');
    console.log('  POST /api/llm/gemini-openai-v1/structure');
    console.log('  POST /api/llm/gemini-openai-v1/tool-call');
    console.log('  POST /api/llm/gemini-openai-v1/stream');
    console.log('  POST /api/llm/gemini-openai-v1/json');
    console.log('='.repeat(60));
    console.log('\nPress Ctrl+C to stop');

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();
