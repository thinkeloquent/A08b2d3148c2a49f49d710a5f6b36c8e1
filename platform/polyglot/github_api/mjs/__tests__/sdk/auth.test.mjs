/**
 * Tests for token resolution and authentication utilities.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveToken, maskToken } from '../../src/sdk/auth.mjs';
import { AuthError } from '../../src/sdk/errors.mjs';

describe('resolveToken', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    // Clear all token env vars
    delete process.env.GITHUB_TOKEN;
    delete process.env.GH_TOKEN;
    delete process.env.GITHUB_ACCESS_TOKEN;
    delete process.env.GITHUB_PAT;
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should use explicit token when provided', () => {
    const result = resolveToken('ghp_explicit123456789012345678');
    expect(result.token).toBe('ghp_explicit123456789012345678');
    expect(result.source).toBe('explicit');
    expect(result.type).toBe('classic-pat');
  });

  it('should resolve from GITHUB_TOKEN env var', () => {
    process.env.GITHUB_TOKEN = 'ghp_envtoken12345678901234567';
    const result = resolveToken();
    expect(result.token).toBe('ghp_envtoken12345678901234567');
    expect(result.source).toBe('GITHUB_TOKEN');
  });

  it('should resolve from GH_TOKEN when GITHUB_TOKEN is not set', () => {
    process.env.GH_TOKEN = 'ghp_ghtoken12345678901234567';
    const result = resolveToken();
    expect(result.token).toBe('ghp_ghtoken12345678901234567');
    expect(result.source).toBe('GH_TOKEN');
  });

  it('should resolve from GITHUB_ACCESS_TOKEN as third priority', () => {
    process.env.GITHUB_ACCESS_TOKEN = 'ghp_accesstoken123456789012';
    const result = resolveToken();
    expect(result.source).toBe('GITHUB_ACCESS_TOKEN');
  });

  it('should resolve from GITHUB_PAT as last priority', () => {
    process.env.GITHUB_PAT = 'ghp_pattoken12345678901234567';
    const result = resolveToken();
    expect(result.source).toBe('GITHUB_PAT');
  });

  it('should throw AuthError when no token is found', () => {
    expect(() => resolveToken()).toThrow(AuthError);
    expect(() => resolveToken()).toThrow('No GitHub token found');
  });

  it('should prefer earlier env vars over later ones', () => {
    process.env.GITHUB_TOKEN = 'ghp_first_1234567890123456789';
    process.env.GH_TOKEN = 'ghp_second_123456789012345678';
    const result = resolveToken();
    expect(result.source).toBe('GITHUB_TOKEN');
  });

  describe('token type detection', () => {
    it('should detect fine-grained tokens', () => {
      const result = resolveToken('github_pat_1234567890abcdef');
      expect(result.type).toBe('fine-grained');
    });

    it('should detect classic PAT tokens', () => {
      const result = resolveToken('ghp_ABCDEFghijklmnop12345');
      expect(result.type).toBe('classic-pat');
    });

    it('should detect OAuth tokens', () => {
      const result = resolveToken('gho_ABCDEFghijklmnop12345');
      expect(result.type).toBe('oauth');
    });

    it('should detect user-to-server tokens', () => {
      const result = resolveToken('ghu_ABCDEFghijklmnop12345');
      expect(result.type).toBe('user-to-server');
    });

    it('should detect server-to-server tokens', () => {
      const result = resolveToken('ghs_ABCDEFghijklmnop12345');
      expect(result.type).toBe('server-to-server');
    });

    it('should detect legacy 40-hex-char tokens', () => {
      const result = resolveToken('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2');
      expect(result.type).toBe('legacy');
    });

    it('should return unknown for unrecognized token formats', () => {
      const result = resolveToken('some-random-token-format');
      expect(result.type).toBe('unknown');
    });
  });
});

describe('maskToken', () => {
  it('should show first 4 and last 4 characters', () => {
    const masked = maskToken('ghp_ABCDEFghijklmnop12345');
    expect(masked.startsWith('ghp_')).toBe(true);
    expect(masked.endsWith('2345')).toBe(true);
    expect(masked).toContain('*');
  });

  it('should mask the middle characters', () => {
    const token = 'ghp_0123456789abcdef';
    const masked = maskToken(token);
    const stars = masked.slice(4, -4);
    expect(stars).toBe('*'.repeat(token.length - 8));
  });

  it('should return **** for short tokens', () => {
    expect(maskToken('short')).toBe('****');
    expect(maskToken('')).toBe('****');
    expect(maskToken(null)).toBe('****');
    expect(maskToken(undefined)).toBe('****');
  });

  it('should handle exactly 8-char tokens', () => {
    expect(maskToken('12345678')).toBe('****');
  });

  it('should handle 9-char tokens correctly', () => {
    const masked = maskToken('123456789');
    expect(masked).toBe('1234*6789');
  });
});
