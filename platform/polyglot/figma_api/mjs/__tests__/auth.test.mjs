import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resolveToken, maskToken, AuthError } from '../src/sdk/auth.mjs';

describe('Auth', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        delete process.env.FIGMA_TOKEN;
        delete process.env.FIGMA_ACCESS_TOKEN;
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    describe('resolveToken', () => {
        describe('Statement Coverage', () => {
            it('should return explicit token with source "explicit"', () => {
                const result = resolveToken('figd_test-token-12345');
                expect(result.token).toBe('figd_test-token-12345');
                expect(result.source).toBe('explicit');
            });

            it('should return token from FIGMA_TOKEN env', () => {
                process.env.FIGMA_TOKEN = 'env-token-123456';
                const result = resolveToken();
                expect(result.token).toBe('env-token-123456');
                expect(result.source).toBe('env:FIGMA_TOKEN');
            });

            it('should return token from FIGMA_ACCESS_TOKEN env', () => {
                process.env.FIGMA_ACCESS_TOKEN = 'access-token-123';
                const result = resolveToken();
                expect(result.token).toBe('access-token-123');
                expect(result.source).toBe('env:FIGMA_ACCESS_TOKEN');
            });
        });

        describe('Branch Coverage', () => {
            it('should prefer explicit token over env vars', () => {
                process.env.FIGMA_TOKEN = 'env-token';
                const result = resolveToken('explicit-token');
                expect(result.source).toBe('explicit');
            });

            it('should prefer FIGMA_TOKEN over FIGMA_ACCESS_TOKEN', () => {
                process.env.FIGMA_TOKEN = 'primary';
                process.env.FIGMA_ACCESS_TOKEN = 'secondary';
                const result = resolveToken();
                expect(result.source).toBe('env:FIGMA_TOKEN');
            });
        });

        describe('Error Handling', () => {
            it('should throw AuthError when no token available', () => {
                expect(() => resolveToken()).toThrow(AuthError);
            });

            it('should throw AuthError with descriptive message', () => {
                expect(() => resolveToken()).toThrow(/Figma API token not found/);
            });

            it('should throw AuthError with status 401', () => {
                try {
                    resolveToken();
                } catch (e) {
                    expect(e.status).toBe(401);
                    expect(e.name).toBe('AuthError');
                }
            });
        });
    });

    describe('maskToken', () => {
        describe('Statement Coverage', () => {
            it('should mask long token showing first 8 chars', () => {
                expect(maskToken('figd_1234567890abcdef')).toBe('figd_123***');
            });
        });

        describe('Branch Coverage', () => {
            it('should return *** for null token', () => {
                expect(maskToken(null)).toBe('***');
            });

            it('should return *** for empty string', () => {
                expect(maskToken('')).toBe('***');
            });

            it('should return *** for token with exactly 8 chars', () => {
                expect(maskToken('12345678')).toBe('***');
            });

            it('should mask token with 9+ chars', () => {
                expect(maskToken('123456789')).toBe('12345678***');
            });
        });

        describe('Boundary Values', () => {
            it('should return *** for undefined', () => {
                expect(maskToken(undefined)).toBe('***');
            });

            it('should handle very long token', () => {
                const longToken = 'a'.repeat(1000);
                expect(maskToken(longToken)).toBe('aaaaaaaa***');
            });

            it('should return *** for token with 1 char', () => {
                expect(maskToken('a')).toBe('***');
            });

            it('should return *** for token with 7 chars', () => {
                expect(maskToken('1234567')).toBe('***');
            });

            it('should mask token with exactly 9 chars', () => {
                expect(maskToken('123456789')).toBe('12345678***');
            });
        });
    });
});
