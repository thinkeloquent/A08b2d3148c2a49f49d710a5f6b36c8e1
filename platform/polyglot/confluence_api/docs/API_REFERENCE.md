# Confluence API Reference

Complete API reference for the `confluence_api` polyglot package (Python + Node.js)
targeting Confluence Data Center REST API v9.2.3.

---

## Core Components

### ConfluenceClient / ConfluenceFetchClient

The primary HTTP client for communicating directly with Confluence Data Center.

**TypeScript**
```typescript
class ConfluenceFetchClient {
  constructor(options: {
    baseUrl: string;
    username: string;
    apiToken: string;
    timeoutMs?: number;            // default: 30000
    rateLimitAutoWait?: boolean;   // default: true
    maxRetries?: number;           // default: 3
    logger?: Logger;
  });

  get<T>(path: string, opts?: RequestConfig): Promise<T>;
  post<T>(path: string, body: unknown, opts?: RequestConfig): Promise<T>;
  put<T>(path: string, body: unknown, opts?: RequestConfig): Promise<T>;
  delete<T>(path: string, opts?: RequestConfig): Promise<T>;
  patch<T>(path: string, body: unknown, opts?: RequestConfig): Promise<T>;
  getRaw(path: string, opts?: RequestConfig): Promise<Response>;
  request<T>(config: ConfluenceRequestConfig): Promise<T>;

  lastRateLimit: { timestamp: string; retryAfter: number; url: string } | null;
}
```

**Python**
```python
class ConfluenceClient:
    def __init__(
        self,
        base_url: str,
        username: str,
        api_token: str,
        timeout: float = 30.0,              # seconds
        rate_limit_auto_wait: bool = True,
        max_retries: int = 3,
        logger: ILogger | None = None,
    ) -> None: ...

    def get(self, endpoint: str, params: dict | None = None) -> dict: ...
    def post(self, endpoint: str, json_data=None, params=None, files=None) -> dict: ...
    def put(self, endpoint: str, json_data=None, params=None) -> dict: ...
    def delete(self, endpoint: str, params: dict | None = None) -> dict: ...
    def patch(self, endpoint: str, json_data=None, params=None) -> dict: ...
    def get_raw(self, endpoint: str, params: dict | None = None) -> httpx.Response: ...

    def close(self) -> None: ...
    def __enter__(self) -> ConfluenceClient: ...
    def __exit__(self, *args) -> None: ...

    last_rate_limit: RateLimitInfo | None
```

---

### Configuration

Functions to resolve Confluence credentials from environment variables or server config.

**TypeScript**
```typescript
function getConfig(serverConfig?: { getNested: Function } | null): ConfluenceConfig;
function loadConfigFromEnv(): ConfluenceConfig;
function getServerConfig(server: { config?: { getNested: Function } }): ConfluenceConfig;

interface ConfluenceConfig {
  baseUrl: string | null;
  username: string | null;
  apiToken: string | null;
}
```

**Python**
```python
def get_config(app_state: Any = None) -> dict[str, Any]: ...
def load_config_from_env() -> dict[str, Any]: ...
def get_server_config(app_state: Any) -> dict[str, Any]: ...

# Returns: {"base_url": str | None, "username": str | None, "api_token": str | None}
```

**Environment Variables**

| Variable | Description |
|----------|-------------|
| `CONFLUENCE_BASE_URL` | Confluence Data Center base URL |
| `CONFLUENCE_USERNAME` | Username for Basic Auth |
| `CONFLUENCE_API_TOKEN` | API token / password for Basic Auth |

---

## Services

All services accept a client instance in their constructor and delegate HTTP calls.

### ContentService

Content CRUD, child/descendant traversal, labels, properties, restrictions, versioning.

| Method (TypeScript) | Method (Python) | Description |
|---------------------|-----------------|-------------|
| `getContents(opts)` | `get_contents(**opts)` | List content with type/space/title filters |
| `getContent(id, opts)` | `get_content(id, **opts)` | Get single content by ID |
| `createContent(data)` | `create_content(data)` | Create new content |
| `updateContent(id, data)` | `update_content(id, data)` | Update existing content |
| `deleteContent(id, opts)` | `delete_content(id, **opts)` | Delete content |
| `getContentHistory(id, opts)` | `get_content_history(id, **opts)` | Get content history |
| `getMacroById(id, ver, macroId)` | `get_macro_by_id(id, ver, macro_id)` | Get macro by ID |
| `getChildContent(id, opts)` | `get_child_content(id, **opts)` | Get child content |
| `getChildContentByType(id, type, opts)` | `get_child_content_by_type(id, type, **opts)` | Get children by type |
| `getChildComments(id, opts)` | `get_child_comments(id, **opts)` | Get child comments |
| `getDescendants(id, opts)` | `get_descendants(id, **opts)` | Get all descendants |
| `getDescendantsByType(id, type, opts)` | `get_descendants_by_type(id, type, **opts)` | Get descendants by type |
| `getLabels(id, opts)` | `get_labels(id, **opts)` | Get content labels |
| `addLabels(id, labels)` | `add_labels(id, labels)` | Add labels to content |
| `deleteLabelByName(id, name)` | `delete_label_by_name(id, name)` | Remove label by name |
| `deleteLabel(id, label)` | `delete_label(id, label)` | Remove label |
| `getProperties(id, opts)` | `get_properties(id, **opts)` | Get content properties |
| `createProperty(id, data)` | `create_property(id, data)` | Create property |
| `getProperty(id, key, opts)` | `get_property(id, key, **opts)` | Get property by key |
| `updateProperty(id, key, data)` | `update_property(id, key, data)` | Update property |
| `deleteProperty(id, key)` | `delete_property(id, key)` | Delete property |
| `getRestrictionsByOperation(id)` | `get_restrictions_by_operation(id)` | Get restrictions |
| `getRestrictionsForOperation(id, op)` | `get_restrictions_for_operation(id, op)` | Get restrictions for op |
| `updateRestrictions(id, data)` | `update_restrictions(id, data)` | Update restrictions |
| `convertContentBody(format, data)` | `convert_content_body(format, data)` | Convert body format |
| `deleteContentVersion(id, ver)` | `delete_content_version(id, ver)` | Delete version |
| `publishSharedDraft(id, data)` | `publish_shared_draft(id, data)` | Publish shared draft |
| `publishLegacyDraft(id, data)` | `publish_legacy_draft(id, data)` | Publish legacy draft |

### AttachmentService

File attachment management for content items.

| Method (TypeScript) | Method (Python) | Description |
|---------------------|-----------------|-------------|
| `getAttachments(contentId, opts)` | `get_attachments(content_id, **opts)` | List attachments |
| `createAttachment(contentId, buf, name, opts)` | `create_attachment(content_id, file_path, comment, minor_edit)` | Upload attachment |
| `updateAttachmentData(contentId, attachId, buf, name, opts)` | `update_attachment_data(content_id, attach_id, file_path, ...)` | Replace attachment data |
| `updateAttachmentMetadata(contentId, attachId, data)` | `update_attachment_metadata(content_id, attach_id, data)` | Update metadata |
| `moveAttachment(contentId, attachId, targetId)` | `move_attachment(content_id, attach_id, target_id)` | Move to another content |
| `deleteAttachment(contentId, attachId)` | `delete_attachment(content_id, attach_id)` | Delete attachment |

### SearchService

CQL-based content search.

| Method (TypeScript) | Method (Python) | Description |
|---------------------|-----------------|-------------|
| `searchContent(cql, opts)` | `search_content(cql, **opts)` | Search with CQL query |
| `scanContent(opts)` | `scan_content(**opts)` | Scan content (cursor-based) |

### SpaceService

Space management including creation, archiving, properties, and watchers.

| Method (TypeScript) | Method (Python) | Description |
|---------------------|-----------------|-------------|
| `getSpaces(opts)` | `get_spaces(**opts)` | List spaces |
| `getSpace(key, opts)` | `get_space(key, **opts)` | Get space by key |
| `createSpace(data)` | `create_space(data)` | Create space |
| `updateSpace(key, data)` | `update_space(key, data)` | Update space |
| `deleteSpace(key)` | `delete_space(key)` | Delete space |
| `archiveSpace(key)` | `archive_space(key)` | Archive space |
| `getSpaceProperties(key, opts)` | `get_space_properties(key, **opts)` | Get space properties |
| `createSpaceProperty(key, data)` | `create_space_property(key, data)` | Create space property |
| `getSpaceProperty(key, propKey, opts)` | `get_space_property(key, prop_key, **opts)` | Get space property |
| `updateSpaceProperty(key, propKey, data)` | `update_space_property(key, prop_key, data)` | Update space property |
| `deleteSpaceProperty(key, propKey)` | `delete_space_property(key, prop_key)` | Delete space property |
| `getSpaceWatchers(key)` | `get_space_watchers(key)` | Get space watchers |

### SpacePermissionService

Permission management for spaces.

| Method (TypeScript) | Method (Python) | Description |
|---------------------|-----------------|-------------|
| `getPermissions(spaceKey)` | `get_permissions(space_key)` | Get all permissions |
| `addPermission(spaceKey, data)` | `add_permission(space_key, data)` | Add permission |
| `getAnonymousPermissions(spaceKey)` | `get_anonymous_permissions(space_key)` | Get anonymous perms |
| `getGroupPermissions(spaceKey, group)` | `get_group_permissions(space_key, group)` | Get group perms |
| `getUserPermissions(spaceKey, userKey)` | `get_user_permissions(space_key, user_key)` | Get user perms |
| `grantAnonymous(spaceKey, data)` | `grant_anonymous(space_key, data)` | Grant anonymous |
| `grantGroup(spaceKey, group, data)` | `grant_group(space_key, group, data)` | Grant group |
| `grantUser(spaceKey, userKey, data)` | `grant_user(space_key, user_key, data)` | Grant user |
| `revokeAnonymous(spaceKey, data)` | `revoke_anonymous(space_key, data)` | Revoke anonymous |
| `revokeGroup(spaceKey, group, data)` | `revoke_group(space_key, group, data)` | Revoke group |
| `revokeUser(spaceKey, userKey, data)` | `revoke_user(space_key, user_key, data)` | Revoke user |

### UserService

User account management and retrieval.

| Method (TypeScript) | Method (Python) | Description |
|---------------------|-----------------|-------------|
| `getCurrentUser(opts)` | `get_current_user(**opts)` | Get authenticated user |
| `getUser(username, opts)` | `get_user(username, **opts)` | Get user by username |
| `getUserByKey(key, opts)` | `get_user_by_key(key, **opts)` | Get user by key |
| `createUser(data)` | `create_user(data)` | Create user |
| `updateUser(data)` | `update_user(data)` | Update user |
| `deleteUser(key)` | `delete_user(key)` | Delete/deactivate user |
| `changePassword(username, data)` | `change_password(username, data)` | Change password |
| `getAnonymousUser()` | `get_anonymous_user()` | Get anonymous user info |
| `getContentWatchStatus(userId, contentId)` | `get_content_watch_status(user_id, content_id)` | Check watch status |
| `addContentWatch(userId, contentId)` | `add_content_watch(user_id, content_id)` | Add content watch |
| `removeContentWatch(userId, contentId)` | `remove_content_watch(user_id, content_id)` | Remove content watch |
| `getSpaceWatchStatus(userId, spaceKey)` | `get_space_watch_status(user_id, space_key)` | Check space watch |
| `addSpaceWatch(userId, spaceKey)` | `add_space_watch(user_id, space_key)` | Add space watch |
| `removeSpaceWatch(userId, spaceKey)` | `remove_space_watch(user_id, space_key)` | Remove space watch |

### GroupService

Group management.

| Method (TypeScript) | Method (Python) | Description |
|---------------------|-----------------|-------------|
| `getGroups(opts)` | `get_groups(**opts)` | List groups |
| `getGroup(name)` | `get_group(name)` | Get group by name |
| `getGroupMembers(name, opts)` | `get_group_members(name, **opts)` | Get group members |

### AdminService

Administrative operations for user and group management.

| Method (TypeScript) | Method (Python) | Description |
|---------------------|-----------------|-------------|
| `getUsers(opts)` | `get_users(**opts)` | List users (admin) |
| `getUser(key)` | `get_user(key)` | Get user by key (admin) |
| `createUser(data)` | `create_user(data)` | Create user (admin) |
| `deleteUser(key)` | `delete_user(key)` | Delete user (admin) |
| `disableUser(key)` | `disable_user(key)` | Disable user |
| `enableUser(key)` | `enable_user(key)` | Enable user |
| `getGroups(opts)` | `get_groups(**opts)` | List groups (admin) |
| `addUserToGroup(groupName, username)` | `add_user_to_group(group_name, username)` | Add user to group |
| `removeUserFromGroup(groupName, username)` | `remove_user_from_group(group_name, username)` | Remove user from group |

### WebhookService

Webhook management.

| Method (TypeScript) | Method (Python) | Description |
|---------------------|-----------------|-------------|
| `getWebhooks(opts)` | `get_webhooks(**opts)` | List webhooks |
| `getWebhook(id)` | `get_webhook(id)` | Get webhook by ID |
| `createWebhook(data)` | `create_webhook(data)` | Create webhook |
| `updateWebhook(id, data)` | `update_webhook(id, data)` | Update webhook |
| `deleteWebhook(id)` | `delete_webhook(id)` | Delete webhook |
| `getWebhookInvocations(id, opts)` | `get_webhook_invocations(id, **opts)` | Get invocations |
| `testWebhook(id)` | `test_webhook(id)` | Test webhook |

### BackupService

Site and space backup/restore operations with job polling.

| Method (TypeScript) | Method (Python) | Description |
|---------------------|-----------------|-------------|
| `backupSite(data)` | `backup_site(data)` | Initiate site backup |
| `restoreSite(data)` | `restore_site(data)` | Restore from server file |
| `restoreSiteUpload(filePath)` | `restore_site_upload(file_path)` | Restore from upload |
| `backupSpace(data)` | `backup_space(data)` | Initiate space backup |
| `restoreSpace(data)` | `restore_space(data)` | Restore space from file |
| `restoreSpaceUpload(filePath)` | `restore_space_upload(file_path)` | Restore space from upload |
| `getJobs()` | `get_jobs()` | List backup/restore jobs |
| `getJob(jobId)` | `get_job(job_id)` | Get job status |
| `downloadJob(jobId)` | `download_job(job_id)` | Download backup file |
| `clearJobQueue()` | `clear_job_queue()` | Clear completed jobs |
| `cancelJob(jobId)` | `cancel_job(job_id)` | Cancel running job |
| `listRestoreFiles()` | `list_restore_files()` | List available restore files |
| `pollJob(jobId, opts)` | `poll_job(job_id, interval, timeout, on_progress)` | Poll job until completion |

### SystemService

Server information, metrics, and long-running task management.

| Method (TypeScript) | Method (Python) | Description |
|---------------------|-----------------|-------------|
| `getServerInfo()` | `get_server_info()` | Get server info (version, build) |
| `getInstanceMetrics()` | `get_instance_metrics()` | Get instance metrics |
| `getAccessMode()` | `get_access_mode()` | Get access mode |
| `getLongTask(taskId)` | `get_long_task(task_id)` | Get long-running task status |
| `getLongTasks(opts)` | `get_long_tasks(start, limit)` | List long-running tasks |

### LabelService

Label operations.

| Method (TypeScript) | Method (Python) | Description |
|---------------------|-----------------|-------------|
| `getRelatedLabels(labelName)` | `get_related_labels(label_name)` | Get related labels |
| `getRecentLabels()` | `get_recent_labels()` | Get recently used labels |

### ColorSchemeService

Global and space-level color scheme management.

| Method (TypeScript) | Method (Python) | Description |
|---------------------|-----------------|-------------|
| `getDefaultColorScheme()` | `get_default_color_scheme()` | Get system default scheme |
| `getGlobalColorScheme()` | `get_global_color_scheme()` | Get custom global scheme |
| `updateGlobalColorScheme(data)` | `update_global_color_scheme(data)` | Update global scheme |
| `resetGlobalColorScheme()` | `reset_global_color_scheme()` | Reset to default |
| `getSpaceColorSchemeType(key)` | `get_space_color_scheme_type(key)` | Get space scheme type |
| `setSpaceColorSchemeType(key, data)` | `set_space_color_scheme_type(key, data)` | Set space scheme type |
| `getSpaceColorScheme(key)` | `get_space_color_scheme(key)` | Get space custom scheme |
| `updateSpaceColorScheme(key, data)` | `update_space_color_scheme(key, data)` | Update space scheme |
| `resetSpaceColorScheme(key)` | `reset_space_color_scheme(key)` | Reset space scheme |

---

## Error Hierarchy

Both implementations provide a structured error hierarchy mapping HTTP status codes to specific exception subclasses.

| HTTP Status | TypeScript Class | Python Class |
|-------------|-----------------|--------------|
| Base | `ConfluenceApiError` | `ConfluenceAPIError` |
| 400 | `ConfluenceValidationError` | `ConfluenceValidationError` |
| 401 | `ConfluenceAuthenticationError` | `ConfluenceAuthenticationError` |
| 403 | `ConfluencePermissionError` | `ConfluencePermissionError` |
| 404 | `ConfluenceNotFoundError` | `ConfluenceNotFoundError` |
| 409 | `ConfluenceConflictError` | `ConfluenceConflictError` |
| 429 | `ConfluenceRateLimitError` | `ConfluenceRateLimitError` |
| 5xx | `ConfluenceServerError` | `ConfluenceServerError` |
| Network | `ConfluenceNetworkError` | `ConfluenceNetworkError` |
| Timeout | `ConfluenceTimeoutError` | `ConfluenceTimeoutError` |
| Config | `ConfluenceConfigurationError` | `ConfluenceConfigurationError` |
| SDK | `SDKError` | `SDKError` |

### Base Error

**TypeScript**
```typescript
class ConfluenceApiError extends Error {
  code: string;              // ErrorCode enum value
  status: number | undefined;
  responseData: unknown;
  url: string | undefined;
  method: string | undefined;

  toJSON(): object;
  static isConfluenceApiError(error: unknown): boolean;
  static hasStatusCode(error: unknown, status: number): boolean;
}
```

**Python**
```python
class ConfluenceAPIError(Exception):
    message: str
    status_code: int | None
    response_data: dict[str, Any]
    url: str | None
    method: str | None

    def to_dict(self) -> dict[str, Any]: ...
```

### Error Factory

**TypeScript**
```typescript
function createErrorFromResponse(
  status: number,
  body: unknown,
  url?: string,
  method?: string,
  headers?: { retryAfter?: number },
): ConfluenceApiError;
```

**Python**
```python
def create_error_from_response(
    status: int,
    body: dict | None,
    url: str | None = None,
    method: str | None = None,
    retry_after: float | None = None,
) -> ConfluenceAPIError: ...
```

---

## CQL Builder

Fluent query builder for Confluence Query Language.

**TypeScript**
```typescript
class CQLBuilder {
  field(name: string): CQLBuilder;
  equals(value: string): CQLBuilder;
  notEquals(value: string): CQLBuilder;
  contains(value: string): CQLBuilder;
  notContains(value: string): CQLBuilder;
  inList(values: string[]): CQLBuilder;
  notInList(values: string[]): CQLBuilder;
  isNull(): CQLBuilder;
  isNotNull(): CQLBuilder;
  and(): CQLBuilder;
  or(): CQLBuilder;
  not(): CQLBuilder;
  orderBy(field: string, direction?: 'ASC' | 'DESC'): CQLBuilder;
  build(): string;
}

function cql(fieldName: string): CQLBuilder;
```

**Python**
```python
class CQLBuilder:
    def field(self, name: str) -> CQLBuilder: ...
    def equals(self, value: str) -> CQLBuilder: ...
    def not_equals(self, value: str) -> CQLBuilder: ...
    def contains(self, value: str) -> CQLBuilder: ...
    def not_contains(self, value: str) -> CQLBuilder: ...
    def in_list(self, values: list[str]) -> CQLBuilder: ...
    def not_in_list(self, values: list[str]) -> CQLBuilder: ...
    def is_null(self) -> CQLBuilder: ...
    def is_not_null(self) -> CQLBuilder: ...
    def and_(self) -> CQLBuilder: ...
    def or_(self) -> CQLBuilder: ...
    def not_(self) -> CQLBuilder: ...
    def order_by(self, field: str, direction: str = 'asc') -> CQLBuilder: ...
    def build(self) -> str: ...

def cql(field_name: str) -> CQLBuilder: ...
```

---

## Pagination

Async generators for iterating over paginated Confluence endpoints.

### Offset-Based Pagination

**TypeScript**
```typescript
async function* paginateOffset<T>(
  client: ConfluenceFetchClient,
  endpoint: string,
  params?: Record<string, unknown>,
  options?: { start?: number; limit?: number },
): AsyncGenerator<T>;
```

**Python**
```python
async def paginate_offset(
    client: Any,
    endpoint: str,
    params: dict | None = None,
    start: int = 0,
    limit: int = 25,
) -> AsyncIterator[dict]: ...
```

### Cursor-Based Pagination

**TypeScript**
```typescript
async function* paginateCursor<T>(
  client: ConfluenceFetchClient,
  endpoint: string,
  params?: Record<string, unknown>,
  options?: { limit?: number },
): AsyncGenerator<T>;
```

**Python**
```python
async def paginate_cursor(
    client: Any,
    endpoint: str,
    params: dict | None = None,
    limit: int = 25,
) -> AsyncIterator[dict]: ...
```

### Expand Helper

**TypeScript**
```typescript
function buildExpand(fields: string | string[] | null | undefined): string | undefined;
```

**Python**
```python
def build_expand(fields: list[str]) -> str: ...
```

---

## Logger

Structured, scoped JSON logger with automatic sensitive-key redaction.

**TypeScript**
```typescript
function createLogger(packageName: string, filename: string): Logger;
const nullLogger: Logger;

interface Logger {
  trace(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}
```

**Python**
```python
def create_logger(package_name: str, filename: str) -> Logger: ...
null_logger: NullLogger

class ILogger(Protocol):
    def debug(self, message: str, context: dict | None = None) -> None: ...
    def info(self, message: str, context: dict | None = None) -> None: ...
    def warning(self, message: str, context: dict | None = None) -> None: ...
    def error(self, message: str, context: dict | None = None) -> None: ...
    def critical(self, message: str, context: dict | None = None) -> None: ...
```

Redacted keys: `token`, `secret`, `password`, `auth`, `credential`, `api_key`.

---

## Models

### Content Models

| Field | TypeScript (Zod) | Python (Pydantic) |
|-------|-----------------|-------------------|
| Content | `ContentSchema` | `Content` |
| ContentCreate | `ContentCreateSchema` | `ContentCreate` |
| ContentUpdate | `ContentUpdateSchema` | `ContentUpdate` |
| ContentBody | `ContentBodySchema` | `ContentBody` |
| ContentBodyContainer | `ContentBodyContainerSchema` | `ContentBodyContainer` |
| Version | `VersionSchema` | `Version` |
| History | `HistorySchema` | `History` |
| MacroInstance | `MacroInstanceSchema` | `MacroInstance` |

### Space Models

| Field | TypeScript (Zod) | Python (Pydantic) |
|-------|-----------------|-------------------|
| Space | `SpaceSchema` | `Space` |
| SpaceCreate | `SpaceCreateSchema` | `SpaceCreate` |
| SpaceUpdate | `SpaceUpdateSchema` | `SpaceUpdate` |
| LongTaskSubmission | `LongTaskSubmissionSchema` | `LongTaskSubmission` |

### User Models

| Field | TypeScript (Zod) | Python (Pydantic) |
|-------|-----------------|-------------------|
| User | `UserSchema` | `UserPerson` |
| UserDetailsForCreation | `UserDetailsForCreationSchema` | `UserDetailsForCreation` |
| Credentials | `CredentialsSchema` | `Credentials` |
| PasswordChangeDetails | `PasswordChangeDetailsSchema` | `PasswordChangeDetails` |
| UserKey | `UserKeySchema` | `UserKey` |

### Other Models

| Field | TypeScript (Zod) | Python (Pydantic) |
|-------|-----------------|-------------------|
| Group | `GroupSchema` | `Group` |
| Label | `LabelSchema` | `Label` |
| SearchResult | `SearchResultSchema` | `SearchResult` |
| ContainerSummary | `ContainerSummarySchema` | `ContainerSummary` |
| Webhook | `WebhookSchema` | `Webhook` |
| RestWebhook | `RestWebhookSchema` | `RestWebhook` |
| JobDetails | `JobDetailsSchema` | `JobDetails` |
| ServerInformation | `ServerInformationSchema` | `ServerInformation` |
| InstanceMetrics | `InstanceMetricsSchema` | `InstanceMetrics` |
| LongTaskStatus | `LongTaskStatusSchema` | `LongTaskStatus` |
| ColorSchemeModel | `ColorSchemeModelSchema` | `ColorSchemeModel` |
| SpacePermission | `SpacePermissionSchema` | `SpacePermission` |
| ContentRestriction | `ContentRestrictionSchema` | `ContentRestriction` |
| ContentWatch | `ContentWatchSchema` | `ContentWatch` |
| SpaceWatch | `SpaceWatchSchema` | `SpaceWatch` |
| JsonContentProperty | `JsonContentPropertySchema` | `JsonContentProperty` |
| JsonSpaceProperty | `JsonSpacePropertySchema` | `JsonSpaceProperty` |

### Common Models

| Field | TypeScript (Zod) | Python (Pydantic) |
|-------|-----------------|-------------------|
| ValidationResult | `ValidationResultSchema` | `ValidationResult` |
| RestError | `RestErrorSchema` | `RestError` |
| PaginationLinks | `PaginationLinksSchema` | `PaginationLinks` |
| PaginatedResponse | `PaginatedResponseSchema` | `PaginatedResponse` |
| OperationCheckResult | `OperationCheckResultSchema` | `OperationCheckResult` |

---

## SDK Client

High-level client for communicating with the Confluence API REST proxy server.

**TypeScript**
```typescript
class ConfluenceSdkClient {
  constructor(opts: {
    baseUrl: string;
    apiKey?: string;
    timeoutMs?: number;  // default: 30000
    logger?: Logger;
  });

  healthCheck(): Promise<object>;
  getContent(contentId: string, opts?: { expand?: string }): Promise<object>;
  getContents(opts?: { type?, spaceKey?, title?, start?, limit?, expand? }): Promise<object>;
  createContent(data: object): Promise<object>;
  updateContent(contentId: string, data: object): Promise<object>;
  deleteContent(contentId: string): Promise<object>;
  searchContent(cql: string, opts?: { limit?, start?, expand? }): Promise<object>;
  getSpaces(opts?: { limit?, start?, expand? }): Promise<object>;
  getSpace(spaceKey: string, opts?: { expand? }): Promise<object>;
  serverInfo(): Promise<object>;

  // Property proxies
  content: { get, list, create, update, delete };
  space: { get, list };
  search: { query };
  user: { getCurrent, search };
}
```

**Python**
```python
class ConfluenceSDKClient:
    def __init__(
        self,
        base_url: str,
        api_key: str | None = None,
        timeout: float = 30.0,
    ) -> None: ...

    def health_check(self) -> dict: ...
    def get_content(self, content_id: str, expand: str | None = None) -> dict: ...
    def get_contents(self, type=None, space_key=None, title=None, start=0, limit=25, expand=None) -> dict: ...
    def create_content(self, data: dict) -> dict: ...
    def update_content(self, content_id: str, data: dict) -> dict: ...
    def delete_content(self, content_id: str) -> dict: ...
    def search_content(self, cql: str, limit=25, start=0, expand=None) -> dict: ...
    def get_spaces(self, limit=25, start=0, expand=None) -> dict: ...
    def get_space(self, space_key: str, expand=None) -> dict: ...
    def get_server_info(self) -> dict: ...

    # Property proxies
    content: _ContentProxy   # .get(), .list(), .create(), .update(), .delete()
    space: _SpaceProxy       # .get(), .list()
    search: _SearchProxy     # .query()
    user: _UserProxy         # .get_current(), .search()

    def close(self) -> None: ...
    def __enter__(self) -> ConfluenceSDKClient: ...
    def __exit__(self, *args) -> None: ...
```

---

## Server

Built-in server factories for proxying Confluence API operations.

**TypeScript**
```typescript
function createServer(opts?: FastifyServerOptions): FastifyInstance;
function startServer(server: FastifyInstance, opts?: { host?: string; port?: number }): Promise<void>;
function createErrorHandler(): FastifyErrorHandler;
```

**Python**
```python
def create_app() -> FastAPI: ...
def create_error_handler() -> Callable: ...
```
