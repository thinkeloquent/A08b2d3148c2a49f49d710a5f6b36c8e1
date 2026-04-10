import { describe, it, expect } from 'vitest';
import {
    FigmaError, AuthenticationError, AuthorizationError, NotFoundError,
    ValidationError, RateLimitError, ApiError, ServerError, NetworkError,
    TimeoutError, ConfigurationError, mapResponseToError,
} from '../src/sdk/errors.mjs';

describe('Errors', () => {
    describe('FigmaError', () => {
        describe('Statement Coverage', () => {
            it('should create with defaults', () => {
                const err = new FigmaError('test');
                expect(err.message).toBe('test');
                expect(err.status).toBe(500);
                expect(err.code).toBe('FIGMA_ERROR');
                expect(err.name).toBe('FigmaError');
                expect(err.meta).toEqual({});
                expect(err.requestId).toBeNull();
                expect(err.timestamp).toBeDefined();
            });

            it('should create with custom options', () => {
                const err = new FigmaError('custom', { status: 418, code: 'TEAPOT', meta: { foo: 1 }, requestId: 'req-1' });
                expect(err.status).toBe(418);
                expect(err.code).toBe('TEAPOT');
                expect(err.meta).toEqual({ foo: 1 });
                expect(err.requestId).toBe('req-1');
            });

            it('toJSON should return structured object', () => {
                const err = new FigmaError('json test');
                const json = err.toJSON();
                expect(json.error).toBe(true);
                expect(json.name).toBe('FigmaError');
                expect(json.message).toBe('json test');
                expect(json.status).toBe(500);
                expect(json.code).toBe('FIGMA_ERROR');
                expect(json.meta).toEqual({});
                expect(json.requestId).toBeNull();
                expect(json.timestamp).toBeDefined();
            });

            it('should be an instance of Error', () => {
                const err = new FigmaError('test');
                expect(err).toBeInstanceOf(Error);
            });

            it('timestamp should be a valid ISO string', () => {
                const err = new FigmaError('ts');
                const parsed = new Date(err.timestamp);
                expect(parsed.toISOString()).toBe(err.timestamp);
            });
        });
    });

    describe('Error Subclasses', () => {
        it('AuthenticationError defaults', () => {
            const e = new AuthenticationError();
            expect(e.status).toBe(401);
            expect(e.code).toBe('AUTHENTICATION_ERROR');
            expect(e.name).toBe('AuthenticationError');
            expect(e.message).toBe('Authentication failed');
        });

        it('AuthenticationError with custom message', () => {
            const e = new AuthenticationError('bad token');
            expect(e.message).toBe('bad token');
        });

        it('AuthorizationError defaults', () => {
            const e = new AuthorizationError();
            expect(e.status).toBe(403);
            expect(e.code).toBe('AUTHORIZATION_ERROR');
            expect(e.name).toBe('AuthorizationError');
            expect(e.message).toBe('Access forbidden');
        });

        it('NotFoundError defaults', () => {
            const e = new NotFoundError();
            expect(e.status).toBe(404);
            expect(e.code).toBe('NOT_FOUND');
            expect(e.name).toBe('NotFoundError');
            expect(e.message).toBe('Resource not found');
        });

        it('ValidationError defaults', () => {
            const e = new ValidationError();
            expect(e.status).toBe(422);
            expect(e.code).toBe('VALIDATION_ERROR');
            expect(e.name).toBe('ValidationError');
            expect(e.message).toBe('Validation failed');
        });

        it('RateLimitError with rateLimitInfo', () => {
            const info = { retryAfter: 30 };
            const e = new RateLimitError('limited', { rateLimitInfo: info });
            expect(e.status).toBe(429);
            expect(e.code).toBe('RATE_LIMIT_ERROR');
            expect(e.name).toBe('RateLimitError');
            expect(e.rateLimitInfo).toEqual(info);
        });

        it('RateLimitError defaults', () => {
            const e = new RateLimitError();
            expect(e.status).toBe(429);
            expect(e.message).toBe('Rate limit exceeded');
            expect(e.rateLimitInfo).toBeNull();
        });

        it('ApiError uses status from meta', () => {
            const e = new ApiError('bad', { status: 418 });
            expect(e.status).toBe(418);
            expect(e.code).toBe('API_ERROR');
            expect(e.name).toBe('ApiError');
        });

        it('ApiError defaults to 400', () => {
            const e = new ApiError();
            expect(e.status).toBe(400);
            expect(e.message).toBe('API error');
        });

        it('ServerError uses status from meta', () => {
            const e = new ServerError('down', { status: 503 });
            expect(e.status).toBe(503);
            expect(e.code).toBe('SERVER_ERROR');
            expect(e.name).toBe('ServerError');
        });

        it('ServerError defaults to 500', () => {
            const e = new ServerError();
            expect(e.status).toBe(500);
            expect(e.message).toBe('Server error');
        });

        it('NetworkError defaults', () => {
            const e = new NetworkError();
            expect(e.status).toBe(0);
            expect(e.code).toBe('NETWORK_ERROR');
            expect(e.name).toBe('NetworkError');
            expect(e.message).toBe('Network error');
        });

        it('TimeoutError defaults', () => {
            const e = new TimeoutError();
            expect(e.status).toBe(408);
            expect(e.code).toBe('TIMEOUT_ERROR');
            expect(e.name).toBe('TimeoutError');
            expect(e.message).toBe('Request timed out');
        });

        it('ConfigurationError defaults', () => {
            const e = new ConfigurationError();
            expect(e.status).toBe(0);
            expect(e.code).toBe('CONFIGURATION_ERROR');
            expect(e.name).toBe('ConfigurationError');
            expect(e.message).toBe('Configuration error');
        });

        it('all errors are instances of Error and FigmaError', () => {
            const errors = [
                new AuthenticationError(), new AuthorizationError(), new NotFoundError(),
                new ValidationError(), new RateLimitError(), new ApiError(), new ServerError(),
                new NetworkError(), new TimeoutError(), new ConfigurationError(),
            ];
            for (const e of errors) {
                expect(e).toBeInstanceOf(Error);
                expect(e).toBeInstanceOf(FigmaError);
            }
        });

        it('all subclasses should have toJSON from FigmaError', () => {
            const errors = [
                new AuthenticationError(), new AuthorizationError(), new NotFoundError(),
                new ValidationError(), new RateLimitError(), new ApiError(), new ServerError(),
                new NetworkError(), new TimeoutError(), new ConfigurationError(),
            ];
            for (const e of errors) {
                const json = e.toJSON();
                expect(json.error).toBe(true);
                expect(json.name).toBe(e.name);
                expect(json.message).toBe(e.message);
                expect(json.timestamp).toBeDefined();
            }
        });
    });

    describe('mapResponseToError', () => {
        describe('Statement Coverage', () => {
            it('should map 401 to AuthenticationError', () => {
                const err = mapResponseToError(401, { message: 'bad token' });
                expect(err).toBeInstanceOf(AuthenticationError);
                expect(err.message).toBe('bad token');
            });

            it('should map 403 to AuthorizationError', () => {
                const err = mapResponseToError(403, { message: 'forbidden' });
                expect(err).toBeInstanceOf(AuthorizationError);
                expect(err.message).toBe('forbidden');
            });

            it('should map 404 to NotFoundError', () => {
                const err = mapResponseToError(404, { message: 'not found' });
                expect(err).toBeInstanceOf(NotFoundError);
                expect(err.message).toBe('not found');
            });

            it('should map 422 to ValidationError', () => {
                const err = mapResponseToError(422, { message: 'invalid' });
                expect(err).toBeInstanceOf(ValidationError);
                expect(err.message).toBe('invalid');
            });

            it('should map 429 to RateLimitError with headers', () => {
                const headers = {
                    'retry-after': '30',
                    'x-figma-plan-tier': 'pro',
                    'x-figma-rate-limit-type': 'files',
                    'x-figma-upgrade-link': 'https://figma.com/upgrade',
                };
                const err = mapResponseToError(429, { message: 'rate limited' }, headers);
                expect(err).toBeInstanceOf(RateLimitError);
                expect(err.rateLimitInfo.retryAfter).toBe(30);
                expect(err.rateLimitInfo.planTier).toBe('pro');
                expect(err.rateLimitInfo.rateLimitType).toBe('files');
                expect(err.rateLimitInfo.upgradeLink).toBe('https://figma.com/upgrade');
                expect(err.rateLimitInfo.timestamp).toBeInstanceOf(Date);
            });

            it('should map 500 to ServerError', () => {
                const err = mapResponseToError(500, { message: 'internal' });
                expect(err).toBeInstanceOf(ServerError);
                expect(err.message).toBe('internal');
            });

            it('should map 502 to ServerError', () => {
                const err = mapResponseToError(502, { message: 'bad gateway' });
                expect(err).toBeInstanceOf(ServerError);
            });

            it('should map 503 to ServerError', () => {
                const err = mapResponseToError(503, { message: 'service unavailable' });
                expect(err).toBeInstanceOf(ServerError);
            });

            it('should map other 4xx to ApiError', () => {
                const err = mapResponseToError(418, { message: 'teapot' });
                expect(err).toBeInstanceOf(ApiError);
                expect(err.message).toBe('teapot');
            });

            it('should map 400 to ApiError', () => {
                const err = mapResponseToError(400, { message: 'bad request' });
                expect(err).toBeInstanceOf(ApiError);
            });
        });

        describe('Branch Coverage', () => {
            it('should use body.err when body.message is missing', () => {
                const err = mapResponseToError(400, { err: 'oops' });
                expect(err.message).toBe('oops');
            });

            it('should use String(body) when body is a string', () => {
                const err = mapResponseToError(400, 'raw error text');
                expect(err.message).toBe('raw error text');
            });

            it('should use String(body) when body is null', () => {
                // String(null) = 'null', which is truthy, so fallback to HTTP status does not trigger
                const err = mapResponseToError(400, null);
                expect(err.message).toBe('null');
            });

            it('should use String(body) when body is undefined', () => {
                // String(undefined) = 'undefined', which is truthy
                const err = mapResponseToError(500, undefined);
                expect(err.message).toBe('undefined');
            });

            it('should default retry-after to 60 when header missing for 429', () => {
                const err = mapResponseToError(429, { message: 'limited' }, {});
                expect(err.rateLimitInfo.retryAfter).toBe(60);
            });

            it('should set planTier to null when header missing for 429', () => {
                const err = mapResponseToError(429, { message: 'limited' }, {});
                expect(err.rateLimitInfo.planTier).toBeNull();
                expect(err.rateLimitInfo.rateLimitType).toBeNull();
                expect(err.rateLimitInfo.upgradeLink).toBeNull();
            });

            it('should prefer body.message over body.err', () => {
                const err = mapResponseToError(400, { message: 'primary', err: 'secondary' });
                expect(err.message).toBe('primary');
            });

            it('should include meta with status and body', () => {
                const body = { message: 'test' };
                const err = mapResponseToError(404, body);
                expect(err.meta.status).toBe(404);
                expect(err.meta.body).toBe(body);
            });

            it('should handle body as empty object', () => {
                const err = mapResponseToError(400, {});
                expect(err.message).toBe('HTTP 400');
            });
        });
    });
});
