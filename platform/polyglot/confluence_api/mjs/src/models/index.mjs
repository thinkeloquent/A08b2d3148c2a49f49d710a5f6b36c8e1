/**
 * @module models/index
 * @description Barrel re-export of all Zod schemas for the Confluence API.
 */

// ---------------------------------------------------------------------------
// Common / Shared
// ---------------------------------------------------------------------------
export {
  ValidationResultSchema,
  RestErrorSchema,
  PaginationLinksSchema,
  PaginatedResponseSchema,
  OperationCheckResultSchema,
} from './common.mjs';

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------
export {
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
} from './content.mjs';

// ---------------------------------------------------------------------------
// Space
// ---------------------------------------------------------------------------
export {
  SpaceSchema,
  SpaceCreateSchema,
  SpaceUpdateSchema,
  LongTaskSubmissionSchema,
} from './space.mjs';

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------
export {
  UserSchema,
  UserDetailsForCreationSchema,
  CredentialsSchema,
  PasswordChangeDetailsSchema,
  UserKeySchema,
} from './user.mjs';

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------
export {
  GroupSchema,
} from './group.mjs';

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------
export {
  LabelSchema,
} from './label.mjs';

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
export {
  ContainerSummarySchema,
  SearchResultSchema,
} from './search.mjs';

// ---------------------------------------------------------------------------
// Webhook
// ---------------------------------------------------------------------------
export {
  WebhookScopeSchema,
  WebhookEventSchema,
  WebhookCredentialsSchema,
  WebhookSchema,
  RestWebhookSchema,
  DetailedInvocationResultSchema,
  DetailedInvocationSchema,
} from './webhook.mjs';

// ---------------------------------------------------------------------------
// Backup & Restore
// ---------------------------------------------------------------------------
export {
  JobDetailsSchema,
  SiteBackupSettingsSchema,
  SpaceBackupSettingsSchema,
  SiteRestoreSettingsSchema,
  SpaceRestoreSettingsSchema,
} from './backup.mjs';

// ---------------------------------------------------------------------------
// System
// ---------------------------------------------------------------------------
export {
  ServerInformationSchema,
  InstanceMetricsSchema,
  LongTaskMessageSchema,
  LongTaskStatusSchema,
} from './system.mjs';

// ---------------------------------------------------------------------------
// Color Scheme / Theme
// ---------------------------------------------------------------------------
export {
  ColorSchemeModelSchema,
  ColorSchemeThemeBasedModelSchema,
  SpaceColorSchemeTypeModelSchema,
} from './color-scheme.mjs';

// ---------------------------------------------------------------------------
// Permission & Restriction
// ---------------------------------------------------------------------------
export {
  SubjectSchema,
  OperationDescriptionSchema,
  SpacePermissionSchema,
  SpacePermissionsForSubjectSchema,
  ContentRestrictionSchema,
} from './permission.mjs';

// ---------------------------------------------------------------------------
// Watch & Properties
// ---------------------------------------------------------------------------
export {
  ContentWatchSchema,
  SpaceWatchSchema,
  JsonContentPropertySchema,
  JsonSpacePropertySchema,
} from './watch.mjs';
