/**
 * SDK barrel exports.
 * Re-exports all SDK modules for convenient single-import usage.
 * @module sdk
 */

export { GitHubClient, createLogger } from './client.mjs';
export { resolveToken, maskToken } from './auth.mjs';
export {
  GitHubError,
  AuthError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ConflictError,
  ForbiddenError,
  ServerError,
  mapResponseToError,
} from './errors.mjs';
export {
  validateRepositoryName,
  validateUsername,
  validateBranchName,
  RESERVED_REPO_NAMES,
} from './validation.mjs';
export { paginate, paginateAll } from './pagination.mjs';
export {
  parseRateLimitHeaders,
  shouldWaitForRateLimit,
  waitForRateLimit,
  isSecondaryRateLimit,
} from './rate-limit.mjs';

export { ReposClient } from './repos/index.mjs';
export { BranchesClient } from './branches/index.mjs';
export { CollaboratorsClient } from './collaborators/index.mjs';
export { TagsClient } from './tags/index.mjs';
export { WebhooksClient } from './webhooks/index.mjs';
export { SecurityClient } from './security/index.mjs';
export { ActionsClient } from './actions/index.mjs';
