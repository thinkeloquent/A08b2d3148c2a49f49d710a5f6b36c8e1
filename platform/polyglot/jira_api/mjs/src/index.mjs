/**
 * @module jira_api
 * @description JIRA API Node.js/ESM Package.
 * Provides multiple interfaces: Direct Import, CLI, Fastify Server, and SDK Client.
 */

// Core client
export { JiraFetchClient } from './client/JiraFetchClient.mjs';
export { FetchClient } from './client/FetchClient.mjs';

// Adapters
export { UndiciFetchAdapter } from './adapters/UndiciFetchAdapter.mjs';

// Errors
export {
  JiraApiError,
  JiraAuthenticationError,
  JiraPermissionError,
  JiraNotFoundError,
  JiraValidationError,
  JiraRateLimitError,
  JiraServerError,
  JiraNetworkError,
  JiraTimeoutError,
  JiraConfigurationError,
  SDKError,
  ErrorCode,
  createErrorFromResponse,
} from './errors.mjs';

// Config
export { getConfig, saveConfig, loadConfigFromEnv, loadConfigFromFile, getServerConfig } from './config.mjs';

// Models
export {
  UserSchema,
  ProjectSchema,
  ProjectVersionSchema,
  IssueSchema,
  IssueCreateSchema,
  IssueUpdateSchema,
  IssueTransitionSchema,
  IssueTypeSchema,
  issueCreateToJiraFormat,
  issueUpdateToJiraFormat,
  issueTransitionToJiraFormat,
  issueAssignmentToJiraFormat,
} from './models/index.mjs';

// Services
export { UserService } from './services/user-service.mjs';
export { IssueService } from './services/issue-service.mjs';
export { ProjectService } from './services/project-service.mjs';

// Server
export { createServer, startServer, createErrorHandler } from './server/index.mjs';

// SDK
export { JiraSDKClient } from './sdk/client.mjs';

// Utils
export { textToAdf, commentToAdf } from './utils/adf.mjs';

// Logger
export { createLogger, nullLogger } from './logger.mjs';
