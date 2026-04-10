import { describe, it, expect } from 'vitest';
import { LlmSynthesisClient, SCHEMA_LANGUAGE_LABELS } from '../src/index.mjs';

describe('LlmSynthesisClient', () => {
  it('should be constructable with defaults', () => {
    const client = new LlmSynthesisClient();
    expect(client).toBeDefined();
    expect(client.config.llmProvider).toBe('openai');
    expect(client.config.openaiModel).toBe('gpt-4o');
    expect(client.config.temperature).toBe(0.2);
  });

  it('should accept custom config', () => {
    const client = new LlmSynthesisClient({
      llmProvider: 'anthropic',
      temperature: 0.5,
    });
    expect(client.config.llmProvider).toBe('anthropic');
    expect(client.config.temperature).toBe(0.5);
    // defaults still present
    expect(client.config.openaiModel).toBe('gpt-4o');
  });

  it('should have ask method', () => {
    const client = new LlmSynthesisClient();
    expect(typeof client.ask).toBe('function');
  });
});

describe('SCHEMA_LANGUAGE_LABELS', () => {
  it('should contain expected keys', () => {
    expect(SCHEMA_LANGUAGE_LABELS.json_schema).toBe('JSON Schema');
    expect(SCHEMA_LANGUAGE_LABELS.zod).toBe('Zod');
    expect(SCHEMA_LANGUAGE_LABELS.typescript).toBe('TypeScript types');
  });
});
