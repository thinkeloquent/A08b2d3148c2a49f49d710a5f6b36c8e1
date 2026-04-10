/**
 * Auth Module — Figma API SDK
 *
 * Token resolution and masking utilities.
 */

import { create } from '../logger.mjs';
import { resolveFigmaEnv } from '@internal/env-resolver';

const log = create('figma-api', import.meta.url);

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
    this.status = 401;
  }
}

/**
 * Resolve Figma API token from explicit value or environment.
 * Priority: explicit token > FIGMA_TOKEN env > FIGMA_ACCESS_TOKEN env
 */
export function resolveToken(explicitToken) {
  if (explicitToken) {
    log.debug('token resolved from explicit parameter', { source: 'explicit' });
    return { token: explicitToken, source: 'explicit' };
  }

  const _figmaEnv = resolveFigmaEnv();
  const envToken = _figmaEnv.token;
  if (envToken) {
    log.info('token loaded', { source: 'env-resolver' });
    return { token: envToken, source: 'env-resolver' };
  }

  throw new AuthError(
    'Figma API token not found. Provide token via constructor or set the Figma token in the environment.'
  );
}

/**
 * Mask token for safe logging output.
 * Returns first 8 chars + '***' for tokens > 8 chars.
 */
export function maskToken(token) {
  if (!token) return '***';
  if (token.length <= 8) return '***';
  return token.slice(0, 8) + '***';
}
