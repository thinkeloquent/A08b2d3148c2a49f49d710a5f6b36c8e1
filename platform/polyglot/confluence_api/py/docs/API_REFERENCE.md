# Confluence API -- Python API Reference

Complete Python API reference for the `confluence_api` package targeting
Confluence Data Center REST API v9.2.3.

---

## ConfluenceClient

Core HTTP client using httpx. Supports context manager protocol.

```python
from confluence_api import ConfluenceClient

with ConfluenceClient(
    base_url='https://confluence.example.com',
    username='admin',
    api_token='your-token',
    timeout=30.0,                  # seconds (default)
    rate_limit_auto_wait=True,     # auto-retry on 429 (default)
    max_retries=3,                 # retries on 5xx (default)
    logger=None,                   # optional ILogger instance
) as client:
    result = client.get('content/12345', params={'expand': 'body.storage'})
```

### Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `base_url` | `str` | *required* | Confluence base URL (http/https) |
| `username` | `str` | *required* | Username for Basic Auth |
| `api_token` | `str` | *required* | API token / password |
| `timeout` | `float` | `30.0` | Request timeout in seconds |
| `rate_limit_auto_wait` | `bool` | `True` | Auto-wait on 429 responses |
| `max_retries` | `int` | `3` | Max retries on 5xx errors |
| `logger` | `ILogger \| None` | `None` | Custom logger instance |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `(endpoint, params=None) -> dict` | GET request |
| `post` | `(endpoint, json_data=None, params=None, files=None) -> dict` | POST request |
| `put` | `(endpoint, json_data=None, params=None) -> dict` | PUT request |
| `delete` | `(endpoint, params=None) -> dict` | DELETE request |
| `patch` | `(endpoint, json_data=None, params=None) -> dict` | PATCH request |
| `get_raw` | `(endpoint, params=None) -> httpx.Response` | GET returning raw Response |
| `close` | `() -> None` | Close underlying connection pool |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `base_url` | `str` | Resolved base URL (with `/rest/api/` appended) |
| `last_rate_limit` | `RateLimitInfo \| None` | Most recent rate-limit response info |

---

## Services

All services accept a `ConfluenceClient` instance in their constructor.

```python
from confluence_api import ConfluenceClient, ContentService

with ConfluenceClient(base_url=url, username=user, api_token=token) as client:
    svc = ContentService(client)
    page = svc.get_content('12345', expand='body.storage')
```

### ContentService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `get_contents` | `type, space_key, title, status, expand, start=0, limit=25` | List content |
| `get_content` | `content_id, expand` | Get content by ID |
| `create_content` | `data: dict` | Create content |
| `update_content` | `content_id, data: dict` | Update content |
| `delete_content` | `content_id, status` | Delete content |
| `get_content_history` | `content_id, expand` | Get history |
| `get_macro_by_id` | `content_id, version, macro_id` | Get macro |
| `get_child_content` | `content_id, expand` | Get children |
| `get_child_content_by_type` | `content_id, child_type, expand, start, limit` | Get children by type |
| `get_child_comments` | `content_id, expand, start, limit, depth, location` | Get comments |
| `get_descendants` | `content_id, expand` | Get all descendants |
| `get_descendants_by_type` | `content_id, desc_type, expand` | Get descendants by type |
| `get_labels` | `content_id, prefix, start, limit` | Get labels |
| `add_labels` | `content_id, labels: list` | Add labels |
| `delete_label_by_name` | `content_id, name` | Remove label by name |
| `delete_label` | `content_id, label` | Remove label |
| `get_properties` | `content_id, expand` | Get properties |
| `create_property` | `content_id, data` | Create property |
| `get_property` | `content_id, key, expand` | Get property by key |
| `update_property` | `content_id, key, data` | Update property |
| `create_property_for_key` | `content_id, key, data` | Create property for key |
| `delete_property` | `content_id, key` | Delete property |
| `get_restrictions_by_operation` | `content_id` | Get restrictions |
| `get_restrictions_for_operation` | `content_id, operation_key` | Get restrictions for op |
| `update_restrictions` | `content_id, data` | Update restrictions |
| `convert_content_body` | `to_format, data` | Convert body format |
| `delete_content_version` | `content_id, version_number` | Delete version |
| `publish_shared_draft` | `draft_id, data` | Publish shared draft |
| `publish_legacy_draft` | `draft_id, data` | Publish legacy draft |

### AttachmentService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `get_attachments` | `content_id, expand, start=0, limit=25` | List attachments |
| `create_attachment` | `content_id, file_path, comment=None, minor_edit=True` | Upload file |
| `update_attachment_data` | `content_id, attachment_id, file_path, comment, minor_edit` | Replace data |
| `update_attachment_metadata` | `content_id, attachment_id, data` | Update metadata |
| `move_attachment` | `content_id, attachment_id, target_content_id` | Move attachment |
| `delete_attachment` | `content_id, attachment_id` | Delete attachment |

### SearchService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `search_content` | `cql, expand, start=0, limit=25` | CQL search |
| `scan_content` | `expand, start=0, limit=25` | Cursor-based scan |

### SpaceService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `get_spaces` | `expand, start=0, limit=25` | List spaces |
| `get_space` | `space_key, expand` | Get space by key |
| `create_space` | `data` | Create space |
| `update_space` | `space_key, data` | Update space |
| `delete_space` | `space_key` | Delete space |
| `archive_space` | `space_key` | Archive space |
| `get_space_properties` | `space_key, expand, start, limit` | Get properties |
| `create_space_property` | `space_key, data` | Create property |
| `get_space_property` | `space_key, property_key, expand` | Get property |
| `update_space_property` | `space_key, property_key, data` | Update property |
| `delete_space_property` | `space_key, property_key` | Delete property |
| `get_space_watchers` | `space_key` | Get watchers |

### SpacePermissionService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `get_permissions` | `space_key` | Get all permissions |
| `add_permission` | `space_key, data` | Add permission |
| `get_anonymous_permissions` | `space_key` | Get anonymous permissions |
| `get_group_permissions` | `space_key, group_name` | Get group permissions |
| `get_user_permissions` | `space_key, user_key` | Get user permissions |
| `grant_anonymous` | `space_key, data` | Grant anonymous access |
| `grant_group` | `space_key, group_name, data` | Grant group access |
| `grant_user` | `space_key, user_key, data` | Grant user access |
| `revoke_anonymous` | `space_key, data` | Revoke anonymous access |
| `revoke_group` | `space_key, group_name, data` | Revoke group access |
| `revoke_user` | `space_key, user_key, data` | Revoke user access |

### UserService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `get_current_user` | `expand` | Get authenticated user |
| `get_user` | `username, expand` | Get user by username |
| `get_user_by_key` | `key, expand` | Get user by key |
| `create_user` | `data` | Create user |
| `update_user` | `data` | Update user |
| `delete_user` | `key` | Delete/deactivate user |
| `change_password` | `username, data` | Change password |
| `get_anonymous_user` | | Get anonymous user info |
| `get_content_watch_status` | `user_id, content_id` | Check content watch |
| `add_content_watch` | `user_id, content_id` | Add content watch |
| `remove_content_watch` | `user_id, content_id` | Remove content watch |
| `get_space_watch_status` | `user_id, space_key` | Check space watch |
| `add_space_watch` | `user_id, space_key` | Add space watch |
| `remove_space_watch` | `user_id, space_key` | Remove space watch |

### GroupService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `get_groups` | `start=0, limit=25` | List groups |
| `get_group` | `name` | Get group by name |
| `get_group_members` | `name, start=0, limit=25` | Get group members |

### AdminService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `get_users` | `start=0, limit=25` | List users (admin) |
| `get_user` | `key` | Get user by key |
| `create_user` | `data` | Create user |
| `delete_user` | `key` | Delete user |
| `disable_user` | `key` | Disable user |
| `enable_user` | `key` | Enable user |
| `get_groups` | `start=0, limit=25` | List groups |
| `add_user_to_group` | `group_name, username` | Add user to group |
| `remove_user_from_group` | `group_name, username` | Remove user from group |

### WebhookService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `get_webhooks` | `start=0, limit=25` | List webhooks |
| `get_webhook` | `webhook_id` | Get webhook by ID |
| `create_webhook` | `data` | Create webhook |
| `update_webhook` | `webhook_id, data` | Update webhook |
| `delete_webhook` | `webhook_id` | Delete webhook |
| `get_webhook_invocations` | `webhook_id, start=0, limit=25` | Get invocations |
| `test_webhook` | `webhook_id` | Test webhook |

### BackupService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `backup_site` | `data` | Initiate site backup |
| `restore_site` | `data` | Restore from server file |
| `restore_site_upload` | `file_path` | Restore from upload |
| `backup_space` | `data` | Initiate space backup |
| `restore_space` | `data` | Restore space from file |
| `restore_space_upload` | `file_path` | Restore space from upload |
| `get_jobs` | | List backup/restore jobs |
| `get_job` | `job_id` | Get job status |
| `download_job` | `job_id` | Download backup (bytes) |
| `clear_job_queue` | | Clear completed jobs |
| `cancel_job` | `job_id` | Cancel running job |
| `list_restore_files` | | List available restore files |
| `poll_job` | `job_id, interval=2.0, timeout=300.0, on_progress=None` | Poll until completion |

### SystemService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `get_server_info` | | Server version and build info |
| `get_instance_metrics` | | Instance metrics |
| `get_access_mode` | | Current access mode |
| `get_long_task` | `task_id` | Long-running task status |
| `get_long_tasks` | `start=0, limit=25` | List long-running tasks |

### LabelService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `get_related_labels` | `label_name` | Get related labels |
| `get_recent_labels` | | Get recently used labels |

### ColorSchemeService

| Method | Parameters | Description |
|--------|-----------|-------------|
| `get_default_color_scheme` | | System default scheme |
| `get_global_color_scheme` | | Custom global scheme |
| `update_global_color_scheme` | `data` | Update global scheme |
| `reset_global_color_scheme` | | Reset to default |
| `get_space_color_scheme_type` | `space_key` | Space scheme type |
| `set_space_color_scheme_type` | `space_key, data` | Set space scheme type |
| `get_space_color_scheme` | `space_key` | Space custom scheme |
| `update_space_color_scheme` | `space_key, data` | Update space scheme |
| `reset_space_color_scheme` | `space_key` | Reset space scheme |

---

## Pydantic Models

All models are Pydantic v2 `BaseModel` subclasses.

```python
from confluence_api import Content, ContentCreate, ContentUpdate, Space, Label
```

### Content Models

- `Content` -- Full content object with id, type, title, space, body, version, etc.
- `ContentCreate` -- Content creation payload (type, title, space, body)
- `ContentUpdate` -- Content update payload (version, title, body, status)
- `ContentBody` -- Body value (storage format)
- `ContentBodyContainer` -- Container with storage/view/editor representations
- `Version` -- Version info (number, by, when, message, minorEdit)
- `History` -- Content history with latest, createdBy, createdDate
- `MacroInstance` -- Macro instance within content

### Space Models

- `Space` -- Space object (key, name, type, description, homepage)
- `SpaceCreate` -- Space creation payload (key, name, description)
- `SpaceUpdate` -- Space update payload (name, description, homepage)
- `LongTaskSubmission` -- Long task submission result (id)

### User Models

- `UserPerson` -- User object (type, username, userKey, profilePicture, displayName)
- `UserDetailsForCreation` -- User creation details
- `Credentials` -- User credentials
- `PasswordChangeDetails` -- Password change payload
- `UserKey` -- User key reference

### Other Models

- `Group` -- Group (name, type)
- `Label` -- Label (prefix, name, id)
- `SearchResult` -- Search result (content, title, excerpt, url)
- `ContainerSummary` -- Container summary for search results
- `Webhook`, `RestWebhook` -- Webhook objects
- `WebhookScope`, `WebhookEvent`, `WebhookCredentials` -- Webhook sub-objects
- `DetailedInvocation`, `DetailedInvocationResult` -- Webhook invocation details
- `JobDetails` -- Backup/restore job details
- `SiteBackupSettings`, `SpaceBackupSettings` -- Backup settings
- `SiteRestoreSettings`, `SpaceRestoreSettings` -- Restore settings
- `ServerInformation` -- Server info (version, buildNumber, baseUrl)
- `InstanceMetrics` -- Instance metrics
- `LongTaskMessage`, `LongTaskStatus` -- Long-running task details
- `ColorSchemeModel`, `ColorSchemeThemeBasedModel`, `SpaceColorSchemeTypeModel`
- `Subject`, `OperationDescription`, `SpacePermission`, `SpacePermissionsForSubject`, `ContentRestriction`
- `ContentWatch`, `SpaceWatch`, `JsonContentProperty`, `JsonSpaceProperty`

### Common Models

- `ValidationResult` -- Validation result (valid, errors)
- `RestError` -- REST error response (statusCode, message)
- `PaginationLinks` -- Pagination links (self, next, base)
- `PaginatedResponse` -- Paginated result container (results, start, limit, size)
- `OperationCheckResult` -- Operation permission check result

---

## Exceptions

```python
from confluence_api import (
    ConfluenceAPIError,           # Base -- all Confluence errors
    ConfluenceValidationError,    # 400
    ConfluenceAuthenticationError, # 401
    ConfluencePermissionError,    # 403
    ConfluenceNotFoundError,      # 404
    ConfluenceConflictError,      # 409
    ConfluenceRateLimitError,     # 429 (retry_after attribute)
    ConfluenceServerError,        # 5xx
    ConfluenceNetworkError,       # Network failures
    ConfluenceTimeoutError,       # Request timeout
    ConfluenceConfigurationError, # Invalid configuration
    SDKError,                     # SDK proxy errors
    create_error_from_response,   # Factory function
)
```

### ConfluenceAPIError

| Attribute | Type | Description |
|-----------|------|-------------|
| `message` | `str` | Error message |
| `status_code` | `int \| None` | HTTP status code |
| `response_data` | `dict` | Parsed response body |
| `url` | `str \| None` | Request URL |
| `method` | `str \| None` | HTTP method |

| Method | Description |
|--------|-------------|
| `to_dict()` | Serialize to dict |

---

## Configuration

```python
from confluence_api import get_config, load_config_from_env, get_server_config

# Auto-resolve: server config (if provided) -> env vars
config = get_config()

# Env vars only
config = load_config_from_env()

# FastAPI server config
config = get_server_config(app.state)

# Returns: {"base_url": str | None, "username": str | None, "api_token": str | None}
```

---

## CQL Builder

```python
from confluence_api import cql, CQLBuilder

query = (
    cql('type').equals('page')
    .and_()
    .field('space').equals('DEV')
    .and_()
    .field('title').contains('architecture')
    .order_by('lastModified', 'desc')
    .build()
)
# => 'type = "page" AND space = "DEV" AND title ~ "architecture" ORDER BY lastModified desc'
```

### CQLBuilder Methods

| Method | Description |
|--------|-------------|
| `field(name)` | Set current field |
| `equals(value)` | `field = "value"` |
| `not_equals(value)` | `field != "value"` |
| `contains(value)` | `field ~ "value"` |
| `not_contains(value)` | `field !~ "value"` |
| `in_list(values)` | `field in ("a", "b")` |
| `not_in_list(values)` | `field not in ("a", "b")` |
| `is_null()` | `field is null` |
| `is_not_null()` | `field is not null` |
| `and_()` | AND operator |
| `or_()` | OR operator |
| `not_()` | NOT operator |
| `order_by(field, dir)` | ORDER BY clause |
| `build()` | Build query string |

---

## Pagination

```python
from confluence_api import paginate_offset, paginate_cursor, build_expand

# Offset-based
async for page in paginate_offset(client, 'content', {'spaceKey': 'DEV', 'type': 'page'}, limit=50):
    print(page['title'])

# Cursor-based
async for item in paginate_cursor(client, 'content/scan', limit=100):
    print(item['id'])

# Build expand parameter
expand = build_expand(['body.storage', 'version', 'space'])
# => 'body.storage,version,space'
```

---

## Logger

```python
from confluence_api import create_logger, null_logger

log = create_logger('my-app', __file__)
log.info('fetching page', {'page_id': '12345'})
log.debug('details', {'api_token': 'secret'})  # auto-redacted to ***REDACTED***
```

Levels: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`, `SILENT` (via `LOG_LEVEL` env var).

---

## SDK Client

See [SDK Guide](../../docs/SDK_GUIDE.md) for complete SDK documentation.

```python
from confluence_api import ConfluenceSDKClient

with ConfluenceSDKClient(base_url='http://localhost:8000/...', api_key='key') as sdk:
    page = sdk.get_content('12345')
    spaces = sdk.get_spaces()
```

---

## Server

```python
from confluence_api.server import create_app, create_error_handler

app = create_app()        # Returns configured FastAPI instance
handler = create_error_handler()  # Returns async exception handler
```

See [Server Integration Guide](../../docs/SERVER_INTEGRATION.md) for complete integration patterns.
