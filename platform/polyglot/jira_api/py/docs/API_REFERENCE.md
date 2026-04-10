# Jira API — Python API Reference

API reference for the `jira_api` Python package. Targets Jira Cloud REST API v3.

---

## JiraClient

The core HTTP client for interacting with Jira Cloud.

```python
from jira_api import JiraClient
```

### Constructor

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `base_url` | `str` | (required) | Jira Cloud instance URL |
| `email` | `str` | (required) | Jira account email |
| `api_token` | `str` | (required) | Jira API token |
| `timeout` | `float` | `30.0` | Request timeout in seconds |

### Context Manager

```python
with JiraClient(base_url="https://team.atlassian.net", email="...", api_token="...") as client:
    issue = client.get_issue("PROJ-123")
# Connection pool closed automatically
```

### User Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `get_user` | `(account_id: str) -> User` | Get user by Jira account ID |
| `search_users` | `(query: str, max_results: int = 50) -> list[User]` | Search users |
| `find_assignable_users` | `(project_keys: list[str], query: str \| None = None, max_results: int = 50) -> list[User]` | Find assignable users |

### Issue Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `create_issue` | `(issue_data: IssueCreate) -> Issue` | Create a new issue |
| `get_issue` | `(issue_key: str) -> Issue` | Get issue by key |
| `update_issue` | `(issue_key: str, update_data: IssueUpdate) -> None` | Update an issue |
| `assign_issue` | `(issue_key: str, assignment: IssueAssignment) -> None` | Assign an issue |
| `get_issue_transitions` | `(issue_key: str) -> list[IssueTransition]` | Get transitions |
| `transition_issue` | `(issue_key: str, transition_request: IssueTransitionRequest) -> None` | Transition an issue |

### Project Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `get_project` | `(project_key: str) -> Project` | Get project by key |
| `get_project_versions` | `(project_key: str) -> list[ProjectVersion]` | Get all versions |
| `create_project_version` | `(version_data: ProjectVersionCreate) -> ProjectVersion` | Create a version |
| `get_issue_types` | `() -> list[dict[str, Any]]` | Get all issue types |
| `get_project_issue_types` | `(project_key: str) -> list[dict[str, Any]]` | Get project issue types |
| `get_issue_type_id_by_name` | `(project_key: str, issue_type_name: str) -> str` | Resolve type name to ID |

---

## Services

### UserService

```python
from jira_api.services.user_service import UserService

service = UserService(client)
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `get_user_by_id` | `(account_id: str) -> User` | Get user by account ID |
| `get_user_by_email` | `(email: str) -> User \| None` | Get user by email |
| `search_users` | `(query: str, max_results: int = 50) -> list[User]` | Search users |
| `find_assignable_users_for_projects` | `(project_keys: list[str], query: str \| None = None, max_results: int = 50) -> list[User]` | Find assignable users |
| `get_user_by_identifier` | `(identifier: str) -> User \| None` | Get user by ID or email |

### IssueService

```python
from jira_api.services.issue_service import IssueService

service = IssueService(client)
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `create_issue` | `(project_id, summary, issue_type_id, description?, priority_id?, assignee_email?, labels?) -> Issue` | Create a new issue |
| `create_issue_by_type_name` | `(project_key, summary, issue_type_name, description?, ...) -> Issue` | Create issue using type name |
| `get_issue` | `(issue_key: str) -> Issue` | Get issue by key |
| `update_issue_summary` | `(issue_key: str, summary: str) -> None` | Update summary |
| `update_issue_description` | `(issue_key: str, description: str) -> None` | Update description |
| `add_labels_to_issue` | `(issue_key: str, labels: list[str]) -> None` | Add labels |
| `remove_labels_from_issue` | `(issue_key: str, labels: list[str]) -> None` | Remove labels |
| `assign_issue_by_email` | `(issue_key: str, assignee_email: str) -> None` | Assign by email |
| `unassign_issue` | `(issue_key: str) -> None` | Unassign |
| `get_available_transitions` | `(issue_key: str) -> list[IssueTransition]` | Get transitions |
| `transition_issue_by_name` | `(issue_key, transition_name, comment?, resolution_name?) -> None` | Transition by name |
| `transition_issue_by_id` | `(issue_key, transition_id, comment?, resolution_name?) -> None` | Transition by ID |

### ProjectService

```python
from jira_api.services.project_service import ProjectService

service = ProjectService(client)
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `get_project` | `(project_key: str) -> Project` | Get project |
| `get_project_versions` | `(project_key: str, released_only: bool \| None = None) -> list[ProjectVersion]` | Get versions |
| `create_version` | `(project_key, version_name, description?, start_date?, release_date?, released?, archived?) -> ProjectVersion` | Create version |
| `get_version_by_name` | `(project_key: str, version_name: str) -> ProjectVersion \| None` | Find version by name |
| `get_released_versions` | `(project_key: str) -> list[ProjectVersion]` | Released versions |
| `get_unreleased_versions` | `(project_key: str) -> list[ProjectVersion]` | Unreleased versions |
| `get_issue_types` | `() -> list[dict[str, Any]]` | All issue types |

---

## Pydantic Models

### User

```python
from jira_api import User
```

| Field | Type | Alias | Description |
|-------|------|-------|-------------|
| `account_id` | `str` | `accountId` | Jira account ID |
| `email_address` | `str \| None` | `emailAddress` | Email address |
| `display_name` | `str` | `displayName` | Display name |
| `active` | `bool` | — | Account active status |
| `avatar_urls` | `dict[str, str] \| None` | `avatarUrls` | Avatar URL map |
| `time_zone` | `str \| None` | `timeZone` | Time zone |

### Issue

```python
from jira_api import Issue
```

| Field | Type | Alias | Description |
|-------|------|-------|-------------|
| `id` | `str` | — | Issue ID |
| `key` | `str` | — | Issue key (e.g. `PROJ-123`) |
| `self_url` | `str` | `self` | Self link |
| `fields` | `IssueFields` | — | Issue fields |
| `changelog` | `dict \| None` | — | Changelog |

### IssueFields

| Field | Type | Alias | Description |
|-------|------|-------|-------------|
| `summary` | `str` | — | Issue summary |
| `description` | `str \| None` | — | Description |
| `issue_type` | `IssueType` | `issuetype` | Issue type |
| `project` | `Project` | — | Project |
| `status` | `IssueStatus` | — | Current status |
| `priority` | `IssuePriority \| None` | — | Priority |
| `assignee` | `User \| None` | — | Assignee |
| `reporter` | `User \| None` | — | Reporter |
| `labels` | `list[str]` | — | Labels |
| `created` | `datetime \| None` | — | Created timestamp |
| `updated` | `datetime \| None` | — | Updated timestamp |

### IssueCreate

```python
from jira_api import IssueCreate
```

| Field | Type | Description |
|-------|------|-------------|
| `project_id` | `str` | Project ID |
| `summary` | `str` | Issue summary |
| `description` | `str \| None` | Description (auto-converted to ADF) |
| `issue_type_id` | `str` | Issue type ID |
| `priority_id` | `str \| None` | Priority ID |
| `assignee_account_id` | `str \| None` | Assignee account ID |
| `labels` | `list[str]` | Labels |

Method: `to_jira_format() -> dict[str, Any]` — Convert to Jira REST API v3 format.

### IssueUpdate

```python
from jira_api import IssueUpdate
```

| Field | Type | Description |
|-------|------|-------------|
| `summary` | `str \| None` | New summary |
| `description` | `str \| None` | New description |
| `labels_add` | `list[str]` | Labels to add |
| `labels_remove` | `list[str]` | Labels to remove |
| `priority_id` | `str \| None` | New priority ID |

Method: `to_jira_format() -> dict[str, Any]` — Convert to Jira update format.

### IssueTransition

| Field | Type | Alias | Description |
|-------|------|-------|-------------|
| `id` | `str` | — | Transition ID |
| `name` | `str` | — | Transition name |
| `to` | `IssueStatus` | — | Target status |
| `has_screen` | `bool` | `hasScreen` | Has transition screen |

### IssueTransitionRequest

| Field | Type | Description |
|-------|------|-------------|
| `transition_id` | `str` | Transition ID |
| `comment` | `str \| None` | Optional comment (ADF) |
| `resolution_name` | `str \| None` | Resolution name |

### Project

```python
from jira_api import Project
```

| Field | Type | Alias | Description |
|-------|------|-------|-------------|
| `id` | `str` | — | Project ID |
| `key` | `str` | — | Project key |
| `name` | `str` | — | Project name |
| `description` | `str \| None` | — | Description |
| `lead` | `ProjectLead \| None` | — | Project lead |
| `project_type_key` | `str \| None` | `projectTypeKey` | Type key |
| `issue_types` | `list[IssueType] \| None` | `issueTypes` | Issue types |
| `versions` | `list[ProjectVersion] \| None` | — | Versions |

### ProjectVersion

```python
from jira_api import ProjectVersion
```

| Field | Type | Alias | Description |
|-------|------|-------|-------------|
| `id` | `str` | — | Version ID |
| `name` | `str` | — | Version name |
| `description` | `str \| None` | — | Description |
| `archived` | `bool` | — | Archived flag |
| `released` | `bool` | — | Released flag |
| `start_date` | `datetime \| None` | — | Start date |
| `release_date` | `datetime \| None` | — | Release date |
| `project_id` | `int` | `projectId` | Parent project ID |

---

## Exceptions

```python
from jira_api.exceptions import (
    JiraAPIError,
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
    create_error_from_response,
)
```

### JiraAPIError (base class)

| Property | Type | Description |
|----------|------|-------------|
| `message` | `str` | Error message |
| `status_code` | `int \| None` | HTTP status code |
| `response_data` | `dict[str, Any]` | Raw response body |
| `url` | `str \| None` | Request URL |
| `method` | `str \| None` | HTTP method |

| Method | Description |
|--------|-------------|
| `to_dict()` | Serialize to dictionary |

### Exception Hierarchy

| Exception | HTTP Status | Description |
|-----------|------------|-------------|
| `JiraAPIError` | (base) | Base exception |
| `JiraAuthenticationError` | 401 | Invalid credentials |
| `JiraPermissionError` | 403 | Insufficient permissions |
| `JiraNotFoundError` | 404 | Resource not found |
| `JiraValidationError` | 400 | Validation failure |
| `JiraRateLimitError` | 429 | Rate limited (has `retry_after: float \| None`) |
| `JiraServerError` | 5xx | Server error |
| `JiraNetworkError` | — | Network failure |
| `JiraTimeoutError` | — | Request timeout |
| `JiraConfigurationError` | — | Missing configuration |
| `SDKError` | — | SDK proxy client error |

### Factory Function

```python
def create_error_from_response(
    status: int,
    body: dict | None,
    url: str | None = None,
    method: str | None = None,
    retry_after: float | None = None,
) -> JiraAPIError: ...
```

---

## Configuration

```python
from jira_api.config import (
    JiraConfig,
    Settings,
    get_config,
    save_config,
    load_config_from_env,
    load_config_from_file,
)
```

### JiraConfig

| Field | Type | Description |
|-------|------|-------------|
| `base_url` | `str` | Jira Cloud URL |
| `email` | `str` | Account email |
| `api_token` | `str` | API token |

### Settings

`Settings` extends `pydantic_settings.BaseSettings` and loads from environment variables automatically.

| Field | Type | Default | Env Variable |
|-------|------|---------|-------------|
| `jira_base_url` | `str \| None` | `None` | `JIRA_BASE_URL` |
| `jira_email` | `str \| None` | `None` | `JIRA_EMAIL` |
| `jira_api_token` | `str \| None` | `None` | `JIRA_API_TOKEN` |
| `server_host` | `str` | `"0.0.0.0"` | `SERVER_HOST` |
| `server_port` | `int` | `8000` | `SERVER_PORT` |
| `server_reload` | `bool` | `False` | `SERVER_RELOAD` |
| `server_api_key` | `str \| None` | `None` | `SERVER_API_KEY` |
| `log_level` | `str` | `"INFO"` | `LOG_LEVEL` |

### Config Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `get_config()` | `JiraConfig \| None` | Load config (env > file priority) |
| `load_config_from_env()` | `JiraConfig \| None` | Load from env vars |
| `load_config_from_file()` | `JiraConfig \| None` | Load from `~/.jira-api/config.json` |
| `save_config(config)` | `None` | Save with `0600` permissions |

---

## ADF Utilities

```python
from jira_api.utils.adf import text_to_adf, comment_to_adf
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `text_to_adf` | `(text: str) -> dict \| None` | Convert text to ADF v1 document |
| `comment_to_adf` | `(text: str) -> dict \| None` | Wrap text in ADF comment body |

---

## SDK Client

```python
from jira_api.sdk.client import JiraSDKClient
```

See [SDK Guide](../../docs/SDK_GUIDE.md) for usage details.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `base_url` | `str` | (required) | Proxy server URL |
| `api_key` | `str \| None` | `None` | Optional API key |
| `timeout` | `float` | `30.0` | Request timeout (seconds) |

---

## Server

```python
from jira_api.server import app, start_server
```

| Symbol | Type | Description |
|--------|------|-------------|
| `app` | `FastAPI` | Application instance (for ASGI servers) |
| `start_server` | `() -> None` | Start with uvicorn using `Settings` |

---

## Logger

```python
from jira_api.logger import create_logger

log = create_logger("my-module", __file__)
log.info("message", {"key": "value"})
log.debug("debug info")
log.warning("warning")
log.error("error", {"error": str(e)})
```
