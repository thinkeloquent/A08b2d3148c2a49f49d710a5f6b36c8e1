/**
 * LLM Agent context for common-exceptions.
 *
 * Provides structured error context for LLM agent tool responses.
 */

import { BaseHttpException } from '../base.js';
import { ErrorCode, getCodeCategory } from '../codes.js';
import { create } from '../logger.js';

const logger = create('common-exceptions', __filename);

/**
 * Structured error context for LLM agents.
 */
export interface AgentErrorContext {
  code: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  suggestedActions: string[];
  details?: Record<string, unknown>;
  requestId?: string;
}

/**
 * Suggested actions by error code.
 */
const SUGGESTED_ACTIONS: Partial<Record<ErrorCode, string[]>> = {
  // Auth
  [ErrorCode.AUTH_NOT_AUTHENTICATED]: [
    'Check if authentication token is provided',
    'Verify token format is correct',
    'Ensure token has not expired',
  ],
  [ErrorCode.AUTH_TOKEN_EXPIRED]: ['Refresh the authentication token', 'Re-authenticate the user'],
  [ErrorCode.AUTH_TOKEN_INVALID]: [
    'Verify token signature',
    'Check if token was issued by trusted authority',
  ],
  // Authz
  [ErrorCode.AUTHZ_FORBIDDEN]: [
    'Check user permissions for this resource',
    'Verify user has required role',
    'Contact administrator for access',
  ],
  // Request
  [ErrorCode.BAD_REQUEST]: [
    'Verify request syntax',
    'Check required parameters',
    'Validate request body format',
  ],
  [ErrorCode.NOT_FOUND]: [
    'Verify the resource identifier',
    'Check if the resource was deleted',
    'Ensure the correct API endpoint is used',
  ],
  [ErrorCode.VALIDATION_FAILED]: [
    'Review field-level errors in details',
    'Correct invalid field values',
    'Ensure required fields are provided',
  ],
  [ErrorCode.CONFLICT]: [
    'Check for duplicate resources',
    'Refresh and retry the operation',
    'Verify resource state before modifying',
  ],
  [ErrorCode.TOO_MANY_REQUESTS]: [
    'Wait before retrying (check retryAfterMs)',
    'Implement request throttling',
    'Contact support for rate limit increase',
  ],
  // Network
  [ErrorCode.NETWORK_CONNECT_TIMEOUT]: [
    'Check network connectivity',
    'Verify upstream service is running',
    'Increase connection timeout if needed',
  ],
  [ErrorCode.NETWORK_READ_TIMEOUT]: [
    'Check upstream service health',
    'Increase read timeout for slow operations',
    'Consider async processing for long operations',
  ],
  [ErrorCode.NETWORK_ERROR]: ['Check network connectivity', 'Verify DNS resolution', 'Check firewall rules'],
  // Upstream
  [ErrorCode.UPSTREAM_SERVICE_ERROR]: [
    'Check upstream service logs',
    'Verify upstream service health',
    'Review request payload for issues',
  ],
  [ErrorCode.UPSTREAM_TIMEOUT]: [
    'Increase timeout configuration',
    'Check upstream service performance',
    'Consider circuit breaker pattern',
  ],
  // Internal
  [ErrorCode.INTERNAL_SERVER_ERROR]: [
    'Check server logs for details',
    'Report error with request ID',
    'Retry the request',
  ],
  [ErrorCode.SERVICE_UNAVAILABLE]: [
    'Wait and retry (check retryAfterMs)',
    'Check service health status',
    'Consider fallback options',
  ],
  [ErrorCode.BAD_GATEWAY]: [
    'Check upstream service health',
    'Verify upstream response format',
    'Review proxy configuration',
  ],
};

/**
 * Determine error severity from code and status.
 */
function getSeverity(code: ErrorCode, status: number): AgentErrorContext['severity'] {
  // Critical: 5xx internal errors
  if (code === ErrorCode.INTERNAL_SERVER_ERROR) {
    return 'critical';
  }

  // High: auth/authz, service unavailable
  if (
    code === ErrorCode.AUTH_NOT_AUTHENTICATED ||
    code === ErrorCode.AUTHZ_FORBIDDEN ||
    code === ErrorCode.SERVICE_UNAVAILABLE
  ) {
    return 'high';
  }

  // Medium: network, upstream, conflict
  if (status >= 500 || code.startsWith('NETWORK_') || code.startsWith('UPSTREAM_')) {
    return 'medium';
  }

  // Low: client errors (4xx)
  return 'low';
}

/**
 * Convert exception to LLM agent-friendly context.
 *
 * Provides structured error information with suggested actions
 * that an LLM agent can use to understand and respond to errors.
 *
 * @param exc - Exception to convert
 * @returns AgentErrorContext with error information and suggestions
 *
 * @example
 * const exc = new NotFoundException({ message: 'User not found' });
 * const context = toAgentContext(exc);
 * // Use in agent tool response
 * return { error: context };
 */
export function toAgentContext(exc: BaseHttpException): AgentErrorContext {
  logger.debug(`Creating agent context for: ${exc.code}`);

  // Get suggested actions
  const actions = SUGGESTED_ACTIONS[exc.code as ErrorCode] ?? [
    'Review error details',
    'Check logs for more information',
    'Retry the operation',
  ];

  const context: AgentErrorContext = {
    code: exc.code,
    message: exc.message,
    severity: getSeverity(exc.code as ErrorCode, exc.status),
    category: getCodeCategory(exc.code as ErrorCode),
    suggestedActions: actions,
  };

  if (exc.details && Object.keys(exc.details).length > 0) {
    context.details = exc.details;
  }

  if (exc.requestId) {
    context.requestId = exc.requestId;
  }

  return context;
}

logger.debug('Agent context module initialized');
