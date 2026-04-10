/**
 * Input validation for GitHub API operations.
 * Enforces GitHub's naming conventions and reserved name restrictions.
 * @module sdk/validation
 */

import { ValidationError } from './errors.mjs';

/**
 * Reserved repository names that GitHub does not allow.
 * @type {Set<string>}
 */
export const RESERVED_REPO_NAMES = new Set([
  'settings',
  'security',
  'pulls',
  'issues',
  'actions',
  'apps',
  'codespaces',
  'copilot',
  'discussions',
  'explore',
  'features',
  'marketplace',
  'new',
  'notifications',
  'organizations',
  'packages',
  'projects',
  'search',
  'sponsors',
  'stars',
  'topics',
  'trending',
  'wiki',
  'collections',
  'events',
  'gist',
  'gists',
  'login',
  'logout',
  'pricing',
  'readme',
  'sessions',
  'signup',
  'status',
  'support',
  'terms',
  'watching',
  'account',
  'billing',
  'blog',
  'bounty',
  'case-studies',
  'community',
  'customer-stories',
  'developer',
  'education',
  'enterprise',
  'get-started',
  'graphql',
  'guides',
  'integrations',
  'about',
  'api',
  'docs',
  'join',
  'rest',
]);

/** @type {import('./client.mjs').Logger} */
const log = {
  info(msg, ctx) { console.info(`[validation] ${msg}`, ctx || ''); },
  debug(msg, ctx) { console.debug(`[validation] ${msg}`, ctx || ''); },
  warn(msg, ctx) { console.warn(`[validation] ${msg}`, ctx || ''); },
  error(msg, ctx) { console.error(`[validation] ${msg}`, ctx || ''); },
};

/**
 * Validate a GitHub repository name.
 * @param {string} name - The repository name to validate
 * @throws {ValidationError} If the name is invalid
 * @returns {void}
 */
export function validateRepositoryName(name) {
  log.debug('Validating repository name', { name });

  if (!name || typeof name !== 'string') {
    throw new ValidationError('Repository name must be a non-empty string');
  }

  if (name.length > 100) {
    throw new ValidationError(
      `Repository name must be at most 100 characters, got ${name.length}`,
    );
  }

  if (name.startsWith('.') || name.endsWith('.')) {
    throw new ValidationError(
      'Repository name must not start or end with a dot',
    );
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    throw new ValidationError(
      'Repository name may only contain alphanumeric characters, hyphens, underscores, and dots',
    );
  }

  if (RESERVED_REPO_NAMES.has(name.toLowerCase())) {
    throw new ValidationError(
      `Repository name "${name}" is reserved by GitHub`,
    );
  }
}

/**
 * Validate a GitHub username / owner.
 * @param {string} owner - The username to validate
 * @throws {ValidationError} If the username is invalid
 * @returns {void}
 */
export function validateUsername(owner) {
  log.debug('Validating username', { owner });

  if (!owner || typeof owner !== 'string') {
    throw new ValidationError('Username must be a non-empty string');
  }

  if (owner.length > 39) {
    throw new ValidationError(
      `Username must be at most 39 characters, got ${owner.length}`,
    );
  }

  if (owner.startsWith('-') || owner.endsWith('-')) {
    throw new ValidationError('Username must not start or end with a hyphen');
  }

  if (owner.includes('--')) {
    throw new ValidationError('Username must not contain consecutive hyphens');
  }

  if (!/^[a-zA-Z0-9-]+$/.test(owner)) {
    throw new ValidationError(
      'Username may only contain alphanumeric characters and hyphens',
    );
  }
}

/**
 * Validate a Git branch name.
 * @param {string} branch - The branch name to validate
 * @throws {ValidationError} If the branch name is invalid
 * @returns {void}
 */
export function validateBranchName(branch) {
  log.debug('Validating branch name', { branch });

  if (!branch || typeof branch !== 'string') {
    throw new ValidationError('Branch name must be a non-empty string');
  }

  if (branch.length > 255) {
    throw new ValidationError(
      `Branch name must be at most 255 characters, got ${branch.length}`,
    );
  }

  if (branch.includes('//')) {
    throw new ValidationError(
      'Branch name must not contain consecutive slashes',
    );
  }

  if (branch === '@') {
    throw new ValidationError('Branch name must not be a single "@"');
  }

  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f\x7f]/.test(branch)) {
    throw new ValidationError('Branch name must not contain control characters');
  }

  if (/[ ~^:?*\[\\]/.test(branch)) {
    throw new ValidationError(
      'Branch name must not contain space, ~, ^, :, ?, *, [, or \\',
    );
  }

  if (branch.endsWith('.lock')) {
    throw new ValidationError('Branch name must not end with ".lock"');
  }

  if (branch.startsWith('.') || branch.endsWith('.')) {
    throw new ValidationError(
      'Branch name must not start or end with a dot',
    );
  }

  if (branch.includes('..')) {
    throw new ValidationError(
      'Branch name must not contain consecutive dots (..)',
    );
  }
}
