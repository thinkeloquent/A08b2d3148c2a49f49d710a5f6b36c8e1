# Confluence API -- Node.js API Reference

Complete Node.js/ESM API reference for the `confluence_api` package targeting
Confluence Data Center REST API v9.2.3.

---

## ConfluenceFetchClient

Core async HTTP client using undici. Handles auth, rate-limiting, and retries.

```typescript
import { ConfluenceFetchClient } from 'confluence_api';

const client = new ConfluenceFetchClient({
  baseUrl: 'https://confluence.example.com',
  username: 'admin',
  apiToken: 'your-token',
  timeoutMs: 30_000,            // milliseconds (default)
  rateLimitAutoWait: true,      // auto-retry on 429 (default)
  maxRetries: 3,                // retries on 5xx (default)
  logger: undefined,            // optional custom logger
});

const space = await client.get('/rest/api/space/DEV');
```

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | *required* | Confluence base URL |
| `username` | `string` | *required* | Username for Basic Auth |
| `apiToken` | `string` | *required* | API token / password |
| `timeoutMs` | `number` | `30000` | Request timeout (ms) |
| `rateLimitAutoWait` | `boolean` | `true` | Auto-wait on 429 responses |
| `maxRetries` | `number` | `3` | Max retries on 5xx errors |
| `logger` | `Logger` | default logger | Custom logger instance |
| `fetchClientOptions` | `object` | `{}` | Additional FetchClient options |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `<T>(path, opts?) -> Promise<T>` | GET request |
| `post` | `<T>(path, body, opts?) -> Promise<T>` | POST request |
| `put` | `<T>(path, body, opts?) -> Promise<T>` | PUT request |
| `delete` | `<T>(path, opts?) -> Promise<T>` | DELETE request |
| `patch` | `<T>(path, body, opts?) -> Promise<T>` | PATCH request |
| `getRaw` | `(path, opts?) -> Promise<Response>` | GET returning raw Response |
| `request` | `<T>(config: ConfluenceRequestConfig) -> Promise<T>` | Full request with config |

### ConfluenceRequestConfig

| Field | Type | Description |
|-------|------|-------------|
| `method` | `string` | HTTP method |
| `path` | `string` | API path (with optional `{key}` placeholders) |
| `pathParams` | `Record<string, string>` | Path parameter values |
| `queryParams` | `Record<string, unknown>` | Query parameters |
| `body` | `unknown` | Request body (JSON-serialized) |
| `headers` | `Record<string, string>` | Additional headers |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `lastRateLimit` | `{ timestamp, retryAfter, url } \| null` | Most recent rate-limit info |

---

## Services

All services accept a `ConfluenceFetchClient` instance in their constructor.

```typescript
import { ConfluenceFetchClient, ContentService } from 'confluence_api';

const client = new ConfluenceFetchClient({ baseUrl, username, apiToken });
const svc = new ContentService(client);
const page = await svc.getContent('12345', { expand: 'body.storage' });
```

### ContentService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `getContents` | `{ type?, spaceKey?, title?, status?, expand?, start?, limit? }` | List content |
| `getContent` | `contentId, { expand? }` | Get content by ID |
| `createContent` | `data` | Create content |
| `updateContent` | `contentId, data` | Update content |
| `deleteContent` | `contentId, { status? }` | Delete content |
| `getContentHistory` | `contentId, { expand? }` | Get history |
| `getMacroById` | `contentId, version, macroId` | Get macro |
| `getChildContent` | `contentId, { expand? }` | Get children |
| `getChildContentByType` | `contentId, childType, { expand?, start?, limit? }` | Children by type |
| `getChildComments` | `contentId, { expand?, start?, limit?, depth?, location? }` | Get comments |
| `getDescendants` | `contentId, { expand? }` | Get descendants |
| `getDescendantsByType` | `contentId, descType, { expand? }` | Descendants by type |
| `getLabels` | `contentId, { prefix?, start?, limit? }` | Get labels |
| `addLabels` | `contentId, labels[]` | Add labels |
| `deleteLabelByName` | `contentId, name` | Remove label by name |
| `deleteLabel` | `contentId, label` | Remove label |
| `getProperties` | `contentId, { expand? }` | Get properties |
| `createProperty` | `contentId, data` | Create property |
| `getProperty` | `contentId, key, { expand? }` | Get property |
| `updateProperty` | `contentId, key, data` | Update property |
| `createPropertyForKey` | `contentId, key, data` | Create property for key |
| `deleteProperty` | `contentId, key` | Delete property |
| `getRestrictionsByOperation` | `contentId` | Get restrictions |
| `getRestrictionsForOperation` | `contentId, operationKey` | Restrictions for op |
| `updateRestrictions` | `contentId, data` | Update restrictions |
| `convertContentBody` | `toFormat, data` | Convert body format |
| `deleteContentVersion` | `contentId, versionNumber` | Delete version |
| `publishSharedDraft` | `draftId, data` | Publish shared draft |
| `publishLegacyDraft` | `draftId, data` | Publish legacy draft |

### AttachmentService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `getAttachments` | `contentId, { expand?, start?, limit? }` | List attachments |
| `createAttachment` | `contentId, fileBuffer, filename, { comment?, minorEdit? }` | Upload file |
| `updateAttachmentData` | `contentId, attachId, buffer, filename, { comment?, minorEdit? }` | Replace data |
| `updateAttachmentMetadata` | `contentId, attachId, data` | Update metadata |
| `moveAttachment` | `contentId, attachId, targetContentId` | Move attachment |
| `deleteAttachment` | `contentId, attachId` | Delete attachment |

### SearchService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `searchContent` | `cql, { expand?, start?, limit? }` | CQL search |
| `scanContent` | `{ expand?, start?, limit? }` | Cursor-based scan |

### SpaceService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `getSpaces` | `{ expand?, start?, limit? }` | List spaces |
| `getSpace` | `spaceKey, { expand? }` | Get space by key |
| `createSpace` | `data` | Create space |
| `updateSpace` | `spaceKey, data` | Update space |
| `deleteSpace` | `spaceKey` | Delete space |
| `archiveSpace` | `spaceKey` | Archive space |
| `getSpaceProperties` | `spaceKey, { expand?, start?, limit? }` | Get properties |
| `createSpaceProperty` | `spaceKey, data` | Create property |
| `getSpaceProperty` | `spaceKey, propertyKey, { expand? }` | Get property |
| `updateSpaceProperty` | `spaceKey, propertyKey, data` | Update property |
| `deleteSpaceProperty` | `spaceKey, propertyKey` | Delete property |
| `getSpaceWatchers` | `spaceKey` | Get watchers |

### SpacePermissionService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `getPermissions` | `spaceKey` | Get all permissions |
| `addPermission` | `spaceKey, data` | Add permission |
| `getAnonymousPermissions` | `spaceKey` | Get anonymous perms |
| `getGroupPermissions` | `spaceKey, groupName` | Get group perms |
| `getUserPermissions` | `spaceKey, userKey` | Get user perms |
| `grantAnonymous` | `spaceKey, data` | Grant anonymous |
| `grantGroup` | `spaceKey, groupName, data` | Grant group |
| `grantUser` | `spaceKey, userKey, data` | Grant user |
| `revokeAnonymous` | `spaceKey, data` | Revoke anonymous |
| `revokeGroup` | `spaceKey, groupName, data` | Revoke group |
| `revokeUser` | `spaceKey, userKey, data` | Revoke user |

### UserService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `getCurrentUser` | `{ expand? }` | Get authenticated user |
| `getUser` | `username, { expand? }` | Get user by username |
| `getUserByKey` | `key, { expand? }` | Get user by key |
| `createUser` | `data` | Create user |
| `updateUser` | `data` | Update user |
| `deleteUser` | `key` | Delete/deactivate user |
| `changePassword` | `username, data` | Change password |
| `getAnonymousUser` | | Get anonymous user info |
| `getContentWatchStatus` | `userId, contentId` | Check content watch |
| `addContentWatch` | `userId, contentId` | Add content watch |
| `removeContentWatch` | `userId, contentId` | Remove content watch |
| `getSpaceWatchStatus` | `userId, spaceKey` | Check space watch |
| `addSpaceWatch` | `userId, spaceKey` | Add space watch |
| `removeSpaceWatch` | `userId, spaceKey` | Remove space watch |

### GroupService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `getGroups` | `{ start?, limit? }` | List groups |
| `getGroup` | `name` | Get group by name |
| `getGroupMembers` | `name, { start?, limit? }` | Get group members |

### AdminService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `getUsers` | `{ start?, limit? }` | List users (admin) |
| `getUser` | `key` | Get user by key |
| `createUser` | `data` | Create user |
| `deleteUser` | `key` | Delete user |
| `disableUser` | `key` | Disable user |
| `enableUser` | `key` | Enable user |
| `getGroups` | `{ start?, limit? }` | List groups |
| `addUserToGroup` | `groupName, username` | Add user to group |
| `removeUserFromGroup` | `groupName, username` | Remove from group |

### WebhookService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `getWebhooks` | `{ start?, limit? }` | List webhooks |
| `getWebhook` | `webhookId` | Get webhook by ID |
| `createWebhook` | `data` | Create webhook |
| `updateWebhook` | `webhookId, data` | Update webhook |
| `deleteWebhook` | `webhookId` | Delete webhook |
| `getWebhookInvocations` | `webhookId, { start?, limit? }` | Get invocations |
| `testWebhook` | `webhookId` | Test webhook |

### BackupService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `backupSite` | `data` | Initiate site backup |
| `restoreSite` | `data` | Restore from server file |
| `restoreSiteUpload` | `filePath` | Restore from upload |
| `backupSpace` | `data` | Initiate space backup |
| `restoreSpace` | `data` | Restore space from file |
| `restoreSpaceUpload` | `filePath` | Restore space from upload |
| `getJobs` | | List jobs |
| `getJob` | `jobId` | Get job status |
| `downloadJob` | `jobId` | Download backup |
| `clearJobQueue` | | Clear completed jobs |
| `cancelJob` | `jobId` | Cancel running job |
| `listRestoreFiles` | | List available files |
| `pollJob` | `jobId, { interval?, timeout?, onProgress? }` | Poll until done |

### SystemService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `getServerInfo` | | Server version and build info |
| `getInstanceMetrics` | | Instance metrics |
| `getAccessMode` | | Current access mode |
| `getLongTask` | `taskId` | Long-running task status |
| `getLongTasks` | `{ start?, limit? }` | List long-running tasks |

### LabelService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `getRelatedLabels` | `labelName` | Get related labels |
| `getRecentLabels` | | Get recently used labels |

### ColorSchemeService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `getDefaultColorScheme` | | System default scheme |
| `getGlobalColorScheme` | | Custom global scheme |
| `updateGlobalColorScheme` | `data` | Update global scheme |
| `resetGlobalColorScheme` | | Reset to default |
| `getSpaceColorSchemeType` | `spaceKey` | Space scheme type |
| `setSpaceColorSchemeType` | `spaceKey, data` | Set space scheme type |
| `getSpaceColorScheme` | `spaceKey` | Space custom scheme |
| `updateSpaceColorScheme` | `spaceKey, data` | Update space scheme |
| `resetSpaceColorScheme` | `spaceKey` | Reset space scheme |

---

## Zod Schemas

All schemas are Zod objects. Use `.parse(data)` for runtime validation.

```typescript
import { ContentCreateSchema, SpaceSchema, LabelSchema } from 'confluence_api';

const content = ContentCreateSchema.parse({
  type: 'page',
  title: 'My Page',
  space: { key: 'DEV' },
  body: { storage: { value: '<p>Hello</p>', representation: 'storage' } },
});
```

### Content Schemas

- `ContentSchema` -- Full content object
- `ContentCreateSchema` -- Content creation payload
- `ContentUpdateSchema` -- Content update payload
- `ContentBodySchema` -- Body value
- `ContentBodyContainerSchema` -- Container with storage/view/editor
- `VersionSchema` -- Version info
- `HistorySchema` -- Content history
- `MacroInstanceSchema` -- Macro instance

### Space Schemas

- `SpaceSchema` -- Space object
- `SpaceCreateSchema` -- Space creation payload
- `SpaceUpdateSchema` -- Space update payload
- `LongTaskSubmissionSchema` -- Long task submission result

### User Schemas

- `UserSchema` -- User object
- `UserDetailsForCreationSchema` -- User creation details
- `CredentialsSchema` -- User credentials
- `PasswordChangeDetailsSchema` -- Password change payload
- `UserKeySchema` -- User key reference

### Other Schemas

- `GroupSchema` -- Group
- `LabelSchema` -- Label
- `SearchResultSchema` -- Search result
- `ContainerSummarySchema` -- Container summary
- `WebhookSchema`, `RestWebhookSchema` -- Webhook objects
- `WebhookScopeSchema`, `WebhookEventSchema`, `WebhookCredentialsSchema`
- `DetailedInvocationSchema`, `DetailedInvocationResultSchema`
- `JobDetailsSchema` -- Backup/restore job
- `SiteBackupSettingsSchema`, `SpaceBackupSettingsSchema`
- `SiteRestoreSettingsSchema`, `SpaceRestoreSettingsSchema`
- `ServerInformationSchema` -- Server info
- `InstanceMetricsSchema` -- Metrics
- `LongTaskMessageSchema`, `LongTaskStatusSchema`
- `ColorSchemeModelSchema`, `ColorSchemeThemeBasedModelSchema`, `SpaceColorSchemeTypeModelSchema`
- `SubjectSchema`, `OperationDescriptionSchema`, `SpacePermissionSchema`, `SpacePermissionsForSubjectSchema`, `ContentRestrictionSchema`
- `ContentWatchSchema`, `SpaceWatchSchema`, `JsonContentPropertySchema`, `JsonSpacePropertySchema`

### Common Schemas

- `ValidationResultSchema`
- `RestErrorSchema`
- `PaginationLinksSchema`
- `PaginatedResponseSchema`
- `OperationCheckResultSchema`

---

## Error Classes

```typescript
import {
  ConfluenceApiError,            // Base -- all Confluence errors
  ConfluenceValidationError,     // 400
  ConfluenceAuthenticationError, // 401
  ConfluencePermissionError,     // 403
  ConfluenceNotFoundError,       // 404
  ConfluenceConflictError,       // 409
  ConfluenceRateLimitError,      // 429 (retryAfter property)
  ConfluenceServerError,         // 5xx
  ConfluenceNetworkError,        // Network failures
  ConfluenceTimeoutError,        // Request timeout
  ConfluenceConfigurationError,  // Invalid configuration
  SDKError,                      // SDK proxy errors
  ErrorCode,                     // Machine-readable error codes
  createErrorFromResponse,       // Factory function
} from 'confluence_api';
```

### ConfluenceApiError

| Property | Type | Description |
|----------|------|-------------|
| `code` | `string` | Error code from `ErrorCode` |
| `status` | `number \| undefined` | HTTP status code |
| `responseData` | `unknown` | Parsed response body |
| `url` | `string \| undefined` | Request URL |
| `method` | `string \| undefined` | HTTP method |

| Method | Description |
|--------|-------------|
| `toJSON()` | Serialize to plain object |
| `static isConfluenceApiError(err)` | Type guard |
| `static hasStatusCode(err, status)` | Check error status |

### ErrorCode

| Code | Value | Description |
|------|-------|-------------|
| `NETWORK` | `'NETWORK'` | Network-level failure |
| `RESPONSE` | `'RESPONSE'` | HTTP response error |
| `TIMEOUT` | `'TIMEOUT'` | Request timeout |
| `CONFIGURATION` | `'CONFIGURATION'` | Invalid configuration |
| `RATE_LIMIT` | `'RATE_LIMIT'` | Rate limited (429) |

---

## Configuration

```typescript
import { getConfig, loadConfigFromEnv, getServerConfig } from 'confluence_api';

// Auto-resolve: server config -> env vars
const config = getConfig(serverConfig);

// Env vars only
const config = loadConfigFromEnv();

// MCP server config
const config = getServerConfig(server);

// Returns: { baseUrl: string | null, username: string | null, apiToken: string | null }
```

---

## CQL Builder

```typescript
import { cql, CQLBuilder } from 'confluence_api';

const query = cql('type').equals('page')
  .and()
  .field('space').equals('DEV')
  .and()
  .field('title').contains('architecture')
  .orderBy('lastModified', 'DESC')
  .build();
// => 'type = "page" AND space = "DEV" AND title ~ "architecture" ORDER BY lastModified DESC'
```

### CQLBuilder Methods

| Method | Description |
|--------|-------------|
| `field(name)` | Set current field |
| `equals(value)` | `field = "value"` |
| `notEquals(value)` | `field != "value"` |
| `contains(value)` | `field ~ "value"` |
| `notContains(value)` | `field !~ "value"` |
| `inList(values)` | `field in ("a", "b")` |
| `notInList(values)` | `field not in ("a", "b")` |
| `isNull()` | `field is null` |
| `isNotNull()` | `field is not null` |
| `and()` | AND operator |
| `or()` | OR operator |
| `not()` | NOT operator |
| `orderBy(field, dir)` | ORDER BY clause |
| `build()` | Build query string |

---

## Pagination

```typescript
import { paginateOffset, paginateCursor, buildExpand } from 'confluence_api';

// Offset-based
for await (const page of paginateOffset(client, '/rest/api/content', {
  spaceKey: 'DEV', type: 'page',
}, { limit: 50 })) {
  console.log(page.title);
}

// Cursor-based
for await (const item of paginateCursor(client, '/rest/api/content/scan', {}, { limit: 100 })) {
  console.log(item.id);
}

// Build expand parameter
const expand = buildExpand(['body.storage', 'version', 'space']);
// => 'body.storage,version,space'
```

### paginateOffset

```typescript
async function* paginateOffset<T>(
  client: ConfluenceFetchClient,
  endpoint: string,
  params?: Record<string, unknown>,
  options?: { start?: number; limit?: number },
): AsyncGenerator<T>;
```

### paginateCursor

```typescript
async function* paginateCursor<T>(
  client: ConfluenceFetchClient,
  endpoint: string,
  params?: Record<string, unknown>,
  options?: { limit?: number },
): AsyncGenerator<T>;
```

### buildExpand

```typescript
function buildExpand(fields: string | string[] | null | undefined): string | undefined;
```

---

## Logger

```typescript
import { createLogger, nullLogger } from 'confluence_api';

const log = createLogger('my-app', import.meta.url);
log.info('fetching page', { pageId: '12345' });
log.debug('details', { apiToken: 'secret' }); // auto-redacted to ***REDACTED***
```

Levels: `trace`, `debug`, `info`, `warn`, `error`, `silent` (via `LOG_LEVEL` env var).

---

## SDK Client

See [SDK Guide](../../docs/SDK_GUIDE.md) for complete SDK documentation.

```typescript
import { ConfluenceSdkClient } from 'confluence_api';

const sdk = new ConfluenceSdkClient({
  baseUrl: 'http://localhost:3000/~/api/rest/2025-01-01/providers/confluence_api',
  apiKey: 'optional-key',
});

const page = await sdk.getContent('12345');
const spaces = await sdk.getSpaces();
```

---

## Server

```typescript
import { createServer, startServer, createErrorHandler } from 'confluence_api';

const server = createServer({ logger: true });
server.setErrorHandler(createErrorHandler());
await startServer(server, { host: '0.0.0.0', port: 3000 });
```

See [Server Integration Guide](../../docs/SERVER_INTEGRATION.md) for complete integration patterns.
