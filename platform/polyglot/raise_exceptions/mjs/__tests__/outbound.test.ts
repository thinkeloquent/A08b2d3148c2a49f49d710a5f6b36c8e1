/**
 * Tests for outbound exception classes.
 *
 * These tests cover exceptions raised when calling upstream services:
 * - ConnectTimeoutException (503)
 * - ReadTimeoutException (504)
 * - WriteTimeoutException (504)
 * - NetworkException (503)
 * - UpstreamServiceException (502)
 * - UpstreamTimeoutException (504)
 */

import {
  ErrorCode,
  ConnectTimeoutException,
  ReadTimeoutException,
  WriteTimeoutException,
  NetworkException,
  UpstreamServiceException,
  UpstreamTimeoutException,
} from '../src/index.js';

describe('ConnectTimeoutException', () => {
  it('should have correct default values', () => {
    const exc = new ConnectTimeoutException({});
    expect(exc.status).toBe(503);
    expect(exc.code).toBe(ErrorCode.CONNECT_TIMEOUT);
  });

  it('should include service information', () => {
    const exc = new ConnectTimeoutException({
      message: 'Connection to payment-api timed out',
      service: 'payment-api',
      timeoutMs: 5000,
    });
    expect(exc.service).toBe('payment-api');
    expect(exc.timeoutMs).toBe(5000);

    const response = exc.toResponse();
    expect(response.error.details?.service).toBe('payment-api');
    expect(response.error.details?.timeoutMs).toBe(5000);
  });

  it('should be retryable (503 status)', () => {
    const exc = new ConnectTimeoutException({});
    expect(exc.status).toBe(503);
  });
});

describe('ReadTimeoutException', () => {
  it('should have correct default values', () => {
    const exc = new ReadTimeoutException({});
    expect(exc.status).toBe(504);
    expect(exc.code).toBe(ErrorCode.READ_TIMEOUT);
  });

  it('should include operation information', () => {
    const exc = new ReadTimeoutException({
      message: 'Read timeout from inventory service',
      service: 'inventory-api',
      operation: 'getStock',
      timeoutMs: 30000,
    });
    expect(exc.operation).toBe('getStock');
    const response = exc.toResponse();
    expect(response.error.details?.operation).toBe('getStock');
  });
});

describe('WriteTimeoutException', () => {
  it('should have correct default values', () => {
    const exc = new WriteTimeoutException({});
    expect(exc.status).toBe(504);
    expect(exc.code).toBe(ErrorCode.WRITE_TIMEOUT);
  });

  it('should serialize correctly', () => {
    const exc = new WriteTimeoutException({
      message: 'Write timeout to database service',
      service: 'db-service',
      timeoutMs: 10000,
    });
    const response = exc.toResponse();
    expect(response.error.code).toBe('WRITE_TIMEOUT');
    expect(response.error.status).toBe(504);
  });
});

describe('NetworkException', () => {
  it('should have correct default values', () => {
    const exc = new NetworkException({});
    expect(exc.status).toBe(503);
    expect(exc.code).toBe(ErrorCode.NETWORK_ERROR);
  });

  it('should handle DNS failure scenario', () => {
    const exc = new NetworkException({
      message: 'DNS resolution failed',
      service: 'unknown-service',
      details: { hostname: 'api.unknown.example.com', error: 'NXDOMAIN' },
    });
    const response = exc.toResponse();
    expect(response.error.status).toBe(503);
    expect(response.error.details?.error).toBe('NXDOMAIN');
  });

  it('should handle connection refused scenario', () => {
    const exc = new NetworkException({
      message: 'Connection refused',
      service: 'local-service',
      details: { host: 'localhost', port: 8080, error: 'ECONNREFUSED' },
    });
    expect(exc.status).toBe(503);
  });
});

describe('UpstreamServiceException', () => {
  it('should have correct default values', () => {
    const exc = new UpstreamServiceException({});
    expect(exc.status).toBe(502);
    expect(exc.code).toBe(ErrorCode.UPSTREAM_SERVICE_ERROR);
  });

  it('should include upstream status code', () => {
    const exc = new UpstreamServiceException({
      message: 'Payment service returned error',
      service: 'payment-api',
      operation: 'charge',
      upstreamStatus: 500,
    });
    expect(exc.upstreamStatus).toBe(500);

    const response = exc.toResponse();
    expect(response.error.details?.service).toBe('payment-api');
    expect(response.error.details?.upstreamStatus).toBe(500);
  });

  it('should handle upstream 4xx errors', () => {
    const exc = new UpstreamServiceException({
      message: 'Upstream validation failed',
      service: 'validation-api',
      upstreamStatus: 400,
      details: { upstreamMessage: 'Invalid input' },
    });
    // Even if upstream returns 4xx, we return 502 (bad gateway)
    expect(exc.status).toBe(502);
  });

  it('should handle upstream 5xx errors', () => {
    const exc = new UpstreamServiceException({
      message: 'Upstream server error',
      service: 'data-api',
      upstreamStatus: 503,
    });
    expect(exc.status).toBe(502);
  });
});

describe('UpstreamTimeoutException', () => {
  it('should have correct default values', () => {
    const exc = new UpstreamTimeoutException({});
    expect(exc.status).toBe(504);
    expect(exc.code).toBe(ErrorCode.UPSTREAM_TIMEOUT);
  });

  it('should handle gateway timeout scenario', () => {
    const exc = new UpstreamTimeoutException({
      message: 'Upstream request timed out',
      service: 'slow-api',
      operation: 'heavyComputation',
      timeoutMs: 60000,
    });
    const response = exc.toResponse();
    expect(response.error.status).toBe(504);
    expect(response.error.details?.service).toBe('slow-api');
    expect(response.error.details?.timeoutMs).toBe(60000);
  });
});

describe('Outbound Exception Common', () => {
  const testCases: Array<[new (opts: object) => any, number, string]> = [
    [ConnectTimeoutException, 503, ErrorCode.CONNECT_TIMEOUT],
    [ReadTimeoutException, 504, ErrorCode.READ_TIMEOUT],
    [WriteTimeoutException, 504, ErrorCode.WRITE_TIMEOUT],
    [NetworkException, 503, ErrorCode.NETWORK_ERROR],
    [UpstreamServiceException, 502, ErrorCode.UPSTREAM_SERVICE_ERROR],
    [UpstreamTimeoutException, 504, ErrorCode.UPSTREAM_TIMEOUT],
  ];

  test.each(testCases)('%p should have status %i and code %s', (ExcClass, expectedStatus, expectedCode) => {
    const exc = new ExcClass({});
    expect(exc.status).toBe(expectedStatus);
    expect(exc.code).toBe(expectedCode);
  });

  it('should support service attribute for all outbound exceptions', () => {
    const exceptions = [
      new ConnectTimeoutException({ service: 'test-service' }),
      new ReadTimeoutException({ service: 'test-service' }),
      new WriteTimeoutException({ service: 'test-service' }),
      new NetworkException({ service: 'test-service' }),
      new UpstreamServiceException({ service: 'test-service' }),
      new UpstreamTimeoutException({ service: 'test-service' }),
    ];

    for (const exc of exceptions) {
      expect(exc.service).toBe('test-service');
      const response = exc.toResponse();
      expect(response.error.details?.service).toBe('test-service');
    }
  });

  it('should include service in log entry', () => {
    const exc = new UpstreamServiceException({
      message: 'Service error',
      service: 'payment-api',
    });
    const logEntry = exc.toLogEntry();

    expect(logEntry.error.type).toBe('UpstreamServiceException');
    expect(logEntry.error.details?.service).toBe('payment-api');
  });
});
