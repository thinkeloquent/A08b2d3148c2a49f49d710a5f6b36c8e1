import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DEFAULT_BASE_URL, EMBEDDINGS_PATH, MAX_BATCH_SIZE, getOpenAIKwargs } from '../src/index.mjs';

describe('constants', () => {
  it('should export DEFAULT_BASE_URL', () => {
    expect(DEFAULT_BASE_URL).toBe('https://api.openai.com/v1');
  });

  it('should export EMBEDDINGS_PATH', () => {
    expect(EMBEDDINGS_PATH).toBe('/embeddings');
  });

  it('should export MAX_BATCH_SIZE', () => {
    expect(MAX_BATCH_SIZE).toBe(2048);
  });
});

describe('getOpenAIKwargs', () => {
  const savedEnv = {};
  const envKeys = [
    'OPENAI_EMBEDDINGS_BASE_URL',
    'OPENAI_EMBEDDINGS_API_KEY',
    'OPENAI_API_KEY',
    'OPENAI_EMBEDDINGS_ORG',
    'OPENAI_EMBEDDINGS_PROXY_URL',
    'OPENAI_EMBEDDINGS_TIMEOUT',
    'OPENAI_EMBEDDINGS_CA_BUNDLE',
  ];

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    for (const k of envKeys) {
      savedEnv[k] = process.env[k];
      delete process.env[k];
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    for (const k of envKeys) {
      if (savedEnv[k] !== undefined) {
        process.env[k] = savedEnv[k];
      } else {
        delete process.env[k];
      }
    }
  });

  it('should return defaults when no env vars set', () => {
    const result = getOpenAIKwargs({ embeddingsModelName: 'text-embedding-3-small' });
    expect(result.model).toBe('text-embedding-3-small');
    expect(result.baseUrl).toBe(DEFAULT_BASE_URL);
    expect(result.apiKey).toBe('');
    expect(result.organization).toBeUndefined();
    expect(result.proxyUrl).toBeUndefined();
    expect(result.timeout).toBe(120_000);
    expect(result.caBundle).toBeUndefined();
  });

  it('should read OPENAI_EMBEDDINGS_API_KEY', () => {
    process.env.OPENAI_EMBEDDINGS_API_KEY = 'sk-embed-key-1234';
    const result = getOpenAIKwargs({ embeddingsModelName: 'test' });
    expect(result.apiKey).toBe('sk-embed-key-1234');
  });

  it('should fall back to OPENAI_API_KEY', () => {
    process.env.OPENAI_API_KEY = 'sk-fallback-key-5678';
    const result = getOpenAIKwargs({ embeddingsModelName: 'test' });
    expect(result.apiKey).toBe('sk-fallback-key-5678');
  });

  it('should prefer OPENAI_EMBEDDINGS_API_KEY over OPENAI_API_KEY', () => {
    process.env.OPENAI_EMBEDDINGS_API_KEY = 'sk-embed';
    process.env.OPENAI_API_KEY = 'sk-generic';
    const result = getOpenAIKwargs({ embeddingsModelName: 'test' });
    expect(result.apiKey).toBe('sk-embed');
  });

  it('should read custom base URL and strip trailing slash', () => {
    process.env.OPENAI_EMBEDDINGS_BASE_URL = 'https://custom.api/v1/';
    const result = getOpenAIKwargs({ embeddingsModelName: 'test' });
    expect(result.baseUrl).toBe('https://custom.api/v1');
  });

  it('should read org, proxy, and timeout', () => {
    process.env.OPENAI_EMBEDDINGS_ORG = 'org-abc';
    process.env.OPENAI_EMBEDDINGS_PROXY_URL = 'socks5://proxy:1080';
    process.env.OPENAI_EMBEDDINGS_TIMEOUT = '60000';
    const result = getOpenAIKwargs({ embeddingsModelName: 'test' });
    expect(result.organization).toBe('org-abc');
    expect(result.proxyUrl).toBe('socks5://proxy:1080');
    expect(result.timeout).toBe(60_000);
  });

  it('should read OPENAI_EMBEDDINGS_CA_BUNDLE', () => {
    process.env.OPENAI_EMBEDDINGS_CA_BUNDLE = '/path/to/ca-bundle.crt';
    const result = getOpenAIKwargs({ embeddingsModelName: 'test' });
    expect(result.caBundle).toBe('/path/to/ca-bundle.crt');
  });
});
