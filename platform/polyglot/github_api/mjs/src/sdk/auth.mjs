/**
 * Token resolution and authentication utilities.
 * Supports multiple GitHub token formats and environment variable sources.
 * @module sdk/auth
 */

import { AuthError } from './errors.mjs';

/**
 * @typedef {'fine-grained'|'classic-pat'|'oauth'|'user-to-server'|'server-to-server'|'legacy'|'unknown'} TokenType
 */

/**
 * @typedef {Object} ResolvedToken
 * @property {string} token - The resolved token value
 * @property {string} source - Where the token was found
 * @property {TokenType} type - Detected token type
 */

const TOKEN_ENV_VARS = [
  'GITHUB_TOKEN',
  'GH_TOKEN',
  'GITHUB_ACCESS_TOKEN',
  'GITHUB_PAT',
];

/**
 * Detect the type of a GitHub token based on its prefix or format.
 * @param {string} token - The token value
 * @returns {TokenType} The detected token type
 */
function detectTokenType(token) {
  if (token.startsWith('github_pat_')) {
    return 'fine-grained';
  }
  if (token.startsWith('ghp_')) {
    return 'classic-pat';
  }
  if (token.startsWith('gho_')) {
    return 'oauth';
  }
  if (token.startsWith('ghu_')) {
    return 'user-to-server';
  }
  if (token.startsWith('ghs_')) {
    return 'server-to-server';
  }
  if (/^[a-f0-9]{40}$/.test(token)) {
    return 'legacy';
  }
  return 'unknown';
}

/**
 * Resolve a GitHub API token from an explicit value or environment variables.
 * Checks environment variables in order: GITHUB_TOKEN, GH_TOKEN, GITHUB_ACCESS_TOKEN, GITHUB_PAT.
 *
 * @param {string} [explicitToken] - An explicitly provided token (takes priority)
 * @returns {ResolvedToken} The resolved token details
 * @throws {AuthError} If no token can be found
 */
export function resolveToken(explicitToken) {
  if (explicitToken) {
    const type = detectTokenType(explicitToken);
    console.info('[auth] Token resolved from explicit parameter', { type });
    return { token: explicitToken, source: 'explicit', type };
  }

  for (const envVar of TOKEN_ENV_VARS) {
    const value = process.env[envVar];
    if (value) {
      const type = detectTokenType(value);
      console.info(`[auth] Token resolved from ${envVar}`, { type });
      return { token: value, source: envVar, type };
    }
  }

  throw new AuthError(
    'No GitHub token found. Set GITHUB_TOKEN, GH_TOKEN, GITHUB_ACCESS_TOKEN, or GITHUB_PAT environment variable, or pass a token explicitly.',
  );
}

/**
 * Mask a token for safe logging, showing only first 4 and last 4 characters.
 * @param {string} token - The token to mask
 * @returns {string} The masked token
 */
export function maskToken(token) {
  if (!token || token.length <= 8) {
    return '****';
  }
  return `${token.slice(0, 4)}${'*'.repeat(token.length - 8)}${token.slice(-4)}`;
}
