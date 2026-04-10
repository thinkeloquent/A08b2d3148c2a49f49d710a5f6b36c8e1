/**
 * @module confluence_api
 * @description Confluence Data Center REST API v9.2.3 Node.js/ESM Package.
 *
 * Provides multiple interfaces: Direct Import, CLI, Fastify Server, and SDK Client.
 *
 * @example
 * // Direct client usage
 * import { ConfluenceFetchClient } from 'confluence_api';
 *
 * const client = new ConfluenceFetchClient({
 *   baseUrl: 'https://confluence.example.com',
 *   username: 'admin',
 *   apiToken: 'your-api-token',
 * });
 *
 * const space = await client.get('/rest/api/space/DEV');
 */

// ---------------------------------------------------------------------------
// Core client
// ---------------------------------------------------------------------------
export { ConfluenceFetchClient } from './client/ConfluenceFetchClient.mjs';
export { FetchClient } from './client/FetchClient.mjs';

// ---------------------------------------------------------------------------
// Adapters
// ---------------------------------------------------------------------------
export { UndiciFetchAdapter } from './adapters/UndiciFetchAdapter.mjs';

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------
export {
  ConfluenceApiError,
  ConfluenceAuthenticationError,
  ConfluencePermissionError,
  ConfluenceNotFoundError,
  ConfluenceValidationError,
  ConfluenceConflictError,
  ConfluenceRateLimitError,
  ConfluenceServerError,
  ConfluenceNetworkError,
  ConfluenceTimeoutError,
  ConfluenceConfigurationError,
  SDKError,
  ErrorCode,
  createErrorFromResponse,
} from './errors.mjs';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
export { getConfig, loadConfigFromEnv, getServerConfig } from './config.mjs';

// ---------------------------------------------------------------------------
// Models (Zod schemas)
// ---------------------------------------------------------------------------
export {
  // Common
  ValidationResultSchema,
  RestErrorSchema,
  PaginationLinksSchema,
  PaginatedResponseSchema,
  OperationCheckResultSchema,
  // Content
  IconSchema,
  PersonSchema,
  ReferenceVersionSchema,
  HistorySchema,
  VersionSchema,
  ContentBodySchema,
  ContentBodyContainerSchema,
  ContentSchema,
  MacroInstanceSchema,
  ContentCreateSchema,
  ContentUpdateSchema,
  // Space
  SpaceSchema,
  SpaceCreateSchema,
  SpaceUpdateSchema,
  LongTaskSubmissionSchema,
  // User
  UserSchema,
  UserDetailsForCreationSchema,
  CredentialsSchema,
  PasswordChangeDetailsSchema,
  UserKeySchema,
  // Group
  GroupSchema,
  // Label
  LabelSchema,
  // Search
  ContainerSummarySchema,
  SearchResultSchema,
  // Webhook
  WebhookScopeSchema,
  WebhookEventSchema,
  WebhookCredentialsSchema,
  WebhookSchema,
  RestWebhookSchema,
  DetailedInvocationResultSchema,
  DetailedInvocationSchema,
  // Backup
  JobDetailsSchema,
  SiteBackupSettingsSchema,
  SpaceBackupSettingsSchema,
  SiteRestoreSettingsSchema,
  SpaceRestoreSettingsSchema,
  // System
  ServerInformationSchema,
  InstanceMetricsSchema,
  LongTaskMessageSchema,
  LongTaskStatusSchema,
  // Color Scheme
  ColorSchemeModelSchema,
  ColorSchemeThemeBasedModelSchema,
  SpaceColorSchemeTypeModelSchema,
  // Permission
  SubjectSchema,
  OperationDescriptionSchema,
  SpacePermissionSchema,
  SpacePermissionsForSubjectSchema,
  ContentRestrictionSchema,
  // Watch
  ContentWatchSchema,
  SpaceWatchSchema,
  JsonContentPropertySchema,
  JsonSpacePropertySchema,
} from './models/index.mjs';

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
export {
  ContentService,
  AttachmentService,
  SearchService,
  SpaceService,
  SpacePermissionService,
  UserService,
  GroupService,
  AdminService,
  WebhookService,
  BackupService,
  SystemService,
  LabelService,
  ColorSchemeService,
} from './services/index.mjs';

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
export { createServer, startServer, createErrorHandler } from './server/index.mjs';

// ---------------------------------------------------------------------------
// SDK
// ---------------------------------------------------------------------------
export { ConfluenceSdkClient } from './sdk/client.mjs';

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------
export { createLogger, nullLogger } from './logger.mjs';

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export { paginateOffset, paginateCursor, buildExpand } from './pagination.mjs';

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------
export { CQLBuilder, cql } from './utils/cql-builder.mjs';

// ---------------------------------------------------------------------------
// Multipart
// ---------------------------------------------------------------------------
export { buildMultipartFormData, downloadBinary } from './multipart.mjs';
