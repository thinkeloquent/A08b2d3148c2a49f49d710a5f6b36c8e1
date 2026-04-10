/**
 * Unit tests for GeminiClient class.
 *
 * Tests cover:
 * - Statement coverage for all code paths
 * - Branch coverage for all conditionals
 * - Boundary value analysis
 * - Error handling verification
 * - Log verification (hyper-observability)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GeminiClient } from '../gemini-client.mjs';
import { DEFAULT_MODEL, MODELS } from '../constants.mjs';
import {
  createLoggerSpy,
  expectLogContains,
  createMockChatResponse,
  mockEnv,
} from './helpers.mjs';

// Mock the client module
vi.mock('../client.mjs', () => ({
  chatCompletion: vi.fn(),
  streamChatCompletion: vi.fn(),
  accumulateStream: vi.fn(),
}));

import { chatCompletion, accumulateStream } from '../client.mjs';

describe('GeminiClient', () => {
  let cleanup;

  beforeEach(() => {
    cleanup = mockEnv({ GEMINI_API_KEY: 'test-api-key' });
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('Initialization', () => {
    describe('Statement Coverage', () => {
      it('should initialize with defaults', () => {
        const client = new GeminiClient();

        expect(client._modelType).toBe(DEFAULT_MODEL);
        expect(client._model).toBe(MODELS[DEFAULT_MODEL]);
      });

      it('should accept custom model', () => {
        const client = new GeminiClient({ model: 'pro' });

        expect(client._modelType).toBe('pro');
      });

      it('should accept custom API key', () => {
        const client = new GeminiClient({ apiKey: 'custom-key' });

        expect(client._apiKey).toBe('custom-key');
      });

      it('should accept custom system prompt', () => {
        const client = new GeminiClient({ systemPrompt: 'Custom prompt' });

        expect(client._systemPrompt).toBe('Custom prompt');
      });
    });

    describe('Branch Coverage', () => {
      it('should accept custom logger', () => {
        const { mockLogger } = createLoggerSpy();
        const client = new GeminiClient({ loggerInstance: mockLogger });

        expect(client._logger).toBe(mockLogger);
      });

      it('should use default logger when none provided', () => {
        const client = new GeminiClient();

        expect(client._logger).toBeDefined();
      });
    });
  });

  // ===========================================================================
  // chat() Method Tests
  // ===========================================================================

  describe('chat()', () => {
    describe('Statement Coverage', () => {
      it('should return response object', async () => {
        chatCompletion.mockResolvedValue(createMockChatResponse());

        const client = new GeminiClient();
        const result = await client.chat('Hello');

        expect(result.success).toBe(true);
        expect(result.content).toBeDefined();
      });

      it('should call chatCompletion with messages', async () => {
        chatCompletion.mockResolvedValue(createMockChatResponse());

        const client = new GeminiClient();
        await client.chat('Test prompt');

        expect(chatCompletion).toHaveBeenCalled();
      });
    });

    describe('Branch Coverage', () => {
      it('should include system prompt by default', async () => {
        chatCompletion.mockResolvedValue(createMockChatResponse());

        const client = new GeminiClient({ systemPrompt: 'Be helpful' });
        await client.chat('Hello');

        const callArgs = chatCompletion.mock.calls[0][0];
        expect(callArgs.some(m => m.role === 'system')).toBe(true);
      });

      it('should exclude system prompt when disabled', async () => {
        chatCompletion.mockResolvedValue(createMockChatResponse());

        const client = new GeminiClient();
        await client.chat('Hello', { useSystemPrompt: false });

        const callArgs = chatCompletion.mock.calls[0][0];
        expect(callArgs.every(m => m.role !== 'system')).toBe(true);
      });
    });

    describe('Error Handling', () => {
      it('should return error response on API failure', async () => {
        chatCompletion.mockRejectedValue(new Error('API Error'));

        const client = new GeminiClient();
        const result = await client.chat('Hello');

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('Log Verification', () => {
      it('should log entry and success', async () => {
        const { logs, mockLogger } = createLoggerSpy();
        chatCompletion.mockResolvedValue(createMockChatResponse());

        const client = new GeminiClient({ loggerInstance: mockLogger });
        await client.chat('Hello');

        expect(expectLogContains(logs, 'debug', 'chat')).toBe(true);
        expect(expectLogContains(logs, 'info', 'success')).toBe(true);
      });
    });
  });

  // ===========================================================================
  // stream() Method Tests
  // ===========================================================================

  describe('stream()', () => {
    describe('Statement Coverage', () => {
      it('should return accumulated response', async () => {
        accumulateStream.mockResolvedValue({
          content: 'Streamed content',
          chunk_count: 3,
          usage: null,
        });

        const client = new GeminiClient();
        const result = await client.stream('Hello');

        expect(result.success).toBe(true);
        expect(result.content).toBe('Streamed content');
      });
    });

    describe('Error Handling', () => {
      it('should return error response on stream failure', async () => {
        accumulateStream.mockRejectedValue(new Error('Stream Error'));

        const client = new GeminiClient();
        const result = await client.stream('Hello');

        expect(result.success).toBe(false);
      });
    });
  });

  // ===========================================================================
  // structure() Method Tests
  // ===========================================================================

  describe('structure()', () => {
    describe('Statement Coverage', () => {
      it('should return parsed JSON', async () => {
        chatCompletion.mockResolvedValue({
          choices: [{ message: { content: '{"name": "test"}' } }],
          model: 'gemini-2.0-flash',
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        });

        const client = new GeminiClient();
        const schema = { type: 'object', properties: { name: { type: 'string' } } };
        const result = await client.structure('Extract name', schema);

        expect(result.success).toBe(true);
        expect(result.parsed).toEqual({ name: 'test' });
      });
    });
  });

  // ===========================================================================
  // toolCall() Method Tests
  // ===========================================================================

  describe('toolCall()', () => {
    describe('Statement Coverage', () => {
      it('should execute detected tools', async () => {
        chatCompletion.mockResolvedValue({
          choices: [{
            message: {
              content: null,
              tool_calls: [{
                id: 'call_123',
                function: {
                  name: 'get_weather',
                  arguments: '{"location": "SF"}',
                },
              }],
            },
            finish_reason: 'tool_calls',
          }],
          model: 'gemini-2.0-flash',
        });

        const client = new GeminiClient();
        const result = await client.toolCall("What's the weather in SF?");

        expect(result.success).toBe(true);
        expect(result.tool_calls).toBeDefined();
      });
    });
  });

  // ===========================================================================
  // healthCheck() Method Tests
  // ===========================================================================

  describe('healthCheck()', () => {
    describe('Statement Coverage', () => {
      it('should return health status', () => {
        const client = new GeminiClient();
        const result = client.healthCheck();

        expect(result.status).toBeDefined();
        expect(result.api_key_configured).toBe(true);
      });

      it('should report unhealthy without API key', () => {
        cleanup();
        cleanup = mockEnv({ GEMINI_API_KEY: null });

        const client = new GeminiClient();
        const result = client.healthCheck();

        expect(result.status).toBe('unhealthy');
        expect(result.api_key_configured).toBe(false);
      });
    });
  });

  // ===========================================================================
  // conversation() Method Tests
  // ===========================================================================

  describe('conversation()', () => {
    describe('Statement Coverage', () => {
      it('should handle message history', async () => {
        chatCompletion.mockResolvedValue(createMockChatResponse());

        const client = new GeminiClient();
        const messages = [
          { role: 'user', content: 'Hi' },
          { role: 'assistant', content: 'Hello!' },
          { role: 'user', content: 'How are you?' },
        ];
        const result = await client.conversation(messages);

        expect(result.success).toBe(true);
      });
    });

    describe('Error Handling', () => {
      it('should error on empty messages', async () => {
        const client = new GeminiClient();
        const result = await client.conversation([]);

        expect(result.success).toBe(false);
      });

      it('should error on null messages', async () => {
        const client = new GeminiClient();
        const result = await client.conversation(null);

        expect(result.success).toBe(false);
      });
    });
  });
});
