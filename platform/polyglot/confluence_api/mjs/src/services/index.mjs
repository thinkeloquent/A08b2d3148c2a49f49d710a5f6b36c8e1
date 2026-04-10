/**
 * @module services
 * @description Barrel re-export for all Confluence REST API service classes.
 *
 * Each service encapsulates a logical group of Confluence Data Center REST
 * API v9.2.3 endpoints. Services accept a `ConfluenceFetchClient` instance
 * in their constructor and delegate HTTP operations to its convenience methods.
 *
 * @example
 * import {
 *   ContentService,
 *   SpaceService,
 *   SearchService,
 * } from './services/index.mjs';
 *
 * const contentService = new ContentService(client);
 * const spaces = await new SpaceService(client).getSpaces();
 */

export { ContentService } from './content-service.mjs';
export { AttachmentService } from './attachment-service.mjs';
export { SearchService } from './search-service.mjs';
export { SpaceService } from './space-service.mjs';
export { SpacePermissionService } from './space-permission-service.mjs';
export { UserService } from './user-service.mjs';
export { GroupService } from './group-service.mjs';
export { AdminService } from './admin-service.mjs';
export { WebhookService } from './webhook-service.mjs';
export { BackupService } from './backup-service.mjs';
export { SystemService } from './system-service.mjs';
export { LabelService } from './label-service.mjs';
export { ColorSchemeService } from './color-scheme-service.mjs';
