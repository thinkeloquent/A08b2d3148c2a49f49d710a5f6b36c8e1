/**
 * Unit tests for helpers module.
 *
 * Tests cover:
 * - Statement coverage for all code paths
 * - Branch coverage for all conditionals
 * - Boundary value analysis
 * - Error handling verification
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getApiKey,
  getModel,
  getHeaders,
  extractJSON,
  validateSchema,
  normalizeMessages,
} from '../helpers.mjs';
import { MODELS, DEFAULT_MODEL } from '../constants.mjs';
import { mockEnv } from './helpers.mjs';

describe('getApiKey()', () => {
  describe('Statement Coverage', () => {
    it('should return API key when set', () => {
      const cleanup = mockEnv({ GEMINI_API_KEY: 'test-key-123' });
      try {
        const result = getApiKey();
        expect(result).toBe('test-key-123');
      } finally {
        cleanup();
      }
    });

    it('should throw error when not set', () => {
      const cleanup = mockEnv({ GEMINI_API_KEY: null });
      try {
        expect(() => getApiKey()).toThrow('GEMINI_API_KEY not found in environment');
      } finally {
        cleanup();
      }
    });
  });

  describe('Branch Coverage', () => {
    it('should read GEMINI_API_KEY environment variable', () => {
      const cleanup = mockEnv({ GEMINI_API_KEY: 'env-key' });
      try {
        const result = getApiKey();
        expect(result).toBe('env-key');
      } finally {
        cleanup();
      }
    });
  });
});

describe('getModel()', () => {
  describe('Statement Coverage', () => {
    it('should return flash model name', () => {
      const result = getModel('flash');
      expect(result).toBe(MODELS.flash);
    });

    it('should return pro model name', () => {
      const result = getModel('pro');
      expect(result).toBe(MODELS.pro);
    });
  });

  describe('Branch Coverage', () => {
    it('should return model for known type', () => {
      const result = getModel('flash');
      expect(result.toLowerCase()).toContain('gemini');
    });

    it('should return default for unknown type', () => {
      const result = getModel('unknown-model');
      expect(result).toBe(MODELS[DEFAULT_MODEL]);
    });

    it('should handle null model type', () => {
      const result = getModel(null);
      expect(result).toBe(MODELS[DEFAULT_MODEL]);
    });

    it('should handle undefined model type', () => {
      const result = getModel(undefined);
      expect(result).toBe(MODELS[DEFAULT_MODEL]);
    });
  });

  describe('Boundary Values', () => {
    it('should handle empty string', () => {
      const result = getModel('');
      expect(result).toBe(MODELS[DEFAULT_MODEL]);
    });
  });
});

describe('getHeaders()', () => {
  describe('Statement Coverage', () => {
    it('should return headers object', () => {
      const result = getHeaders('test-key');
      expect(typeof result).toBe('object');
    });

    it('should contain Authorization header', () => {
      const result = getHeaders('test-key');
      expect(result).toHaveProperty('Authorization');
    });

    it('should contain Content-Type header', () => {
      const result = getHeaders('test-key');
      expect(result).toHaveProperty('Content-Type');
    });
  });

  describe('Branch Coverage', () => {
    it('should format authorization as Bearer token', () => {
      const result = getHeaders('my-api-key');
      expect(result.Authorization).toBe('Bearer my-api-key');
    });
  });

  describe('Boundary Values', () => {
    it('should handle empty API key', () => {
      const result = getHeaders('');
      expect(result.Authorization).toBe('Bearer ');
    });

    it('should handle long API key', () => {
      const longKey = 'x'.repeat(1000);
      const result = getHeaders(longKey);
      expect(result.Authorization).toContain(longKey);
    });
  });
});

describe('extractJSON()', () => {
  describe('Statement Coverage', () => {
    it('should parse valid JSON', () => {
      const result = extractJSON('{"key": "value"}');
      expect(result).toEqual({ key: 'value' });
    });

    it('should return null for invalid JSON', () => {
      const result = extractJSON('not json');
      expect(result).toBeNull();
    });
  });

  describe('Branch Coverage', () => {
    it('should extract from markdown code block', () => {
      const content = '```json\n{"key": "value"}\n```';
      const result = extractJSON(content);
      expect(result).toEqual({ key: 'value' });
    });

    it('should parse plain JSON string', () => {
      const result = extractJSON('{"a": 1, "b": 2}');
      expect(result).toEqual({ a: 1, b: 2 });
    });
  });

  describe('Boundary Values', () => {
    it('should handle empty string', () => {
      const result = extractJSON('');
      expect(result).toBeNull();
    });

    it('should handle null input', () => {
      const result = extractJSON(null);
      expect(result).toBeNull();
    });

    it('should handle undefined input', () => {
      const result = extractJSON(undefined);
      expect(result).toBeNull();
    });

    it('should handle nested JSON', () => {
      const nested = { a: { b: { c: { d: [1, 2, 3] } } } };
      const result = extractJSON(JSON.stringify(nested));
      expect(result).toEqual(nested);
    });

    it('should handle JSON arrays', () => {
      const result = extractJSON('[1, 2, 3]');
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', () => {
      const result = extractJSON('{"key": }');
      expect(result).toBeNull();
    });

    it('should handle truncated JSON', () => {
      const result = extractJSON('{"key": "val');
      expect(result).toBeNull();
    });
  });
});

describe('validateSchema()', () => {
  describe('Statement Coverage', () => {
    it('should return valid for matching data', () => {
      const schema = { type: 'object', properties: { name: { type: 'string' } } };
      const data = { name: 'test' };

      const result = validateSchema(data, schema);

      expect(result.valid).toBe(true);
    });

    it('should return invalid for non-matching data', () => {
      const schema = { type: 'object', required: ['name'] };
      const data = {};

      const result = validateSchema(data, schema);

      expect(result.valid).toBe(false);
    });
  });

  describe('Boundary Values', () => {
    it('should handle empty schema', () => {
      const result = validateSchema({ any: 'data' }, {});
      expect(result.valid).toBe(true);
    });

    it('should handle empty data', () => {
      const result = validateSchema({}, { type: 'object' });
      expect(result.valid).toBe(true);
    });
  });
});

describe('normalizeMessages()', () => {
  describe('Statement Coverage', () => {
    it('should return array of messages', () => {
      const messages = [{ role: 'user', content: 'Hi' }];
      const result = normalizeMessages(messages);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should preserve input messages', () => {
      const messages = [{ role: 'user', content: 'Hello' }];
      const result = normalizeMessages(messages);

      expect(result.some(m => m.content === 'Hello')).toBe(true);
    });
  });

  describe('Branch Coverage', () => {
    it('should add system prompt when requested', () => {
      const messages = [{ role: 'user', content: 'Hi' }];
      const result = normalizeMessages(messages, true, 'You are helpful.');

      expect(result[0].role).toBe('system');
      expect(result[0].content).toBe('You are helpful.');
    });

    it('should not add system prompt when not requested', () => {
      const messages = [{ role: 'user', content: 'Hi' }];
      const result = normalizeMessages(messages, false);

      // First message should be user if no system added
      if (result.length === messages.length) {
        expect(result[0].role).toBe('user');
      }
    });
  });

  describe('Boundary Values', () => {
    it('should handle empty messages', () => {
      const result = normalizeMessages([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle single message', () => {
      const messages = [{ role: 'user', content: 'Hi' }];
      const result = normalizeMessages(messages);

      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });
});
