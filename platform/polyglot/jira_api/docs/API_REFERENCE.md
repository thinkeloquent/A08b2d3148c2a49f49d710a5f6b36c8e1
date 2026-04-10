# Jira API — API Reference

Comprehensive API reference for the `jira_api` polyglot package (Node.js ESM + Python).
Both implementations target **Jira Cloud REST API v3**.

---

## Core Components

### JiraFetchClient / JiraClient

The primary HTTP client for communicating with Jira Cloud.

**TypeScript**
```typescript
class JiraFetchClient {
  constructor(options: {
    baseUrl: string;
    email: string;
    apiToken: string;
    timeoutMs?: number;          // default: 30000
    fetchClientOptions?: object;
  });

  request<T>(config: JiraRequestConfig): Promise<T>;
  get<T>(path: string, opts?: RequestOptions): Promise<T>;
  post<T>(path: string, body: unknown, opts?: RequestOptions): Promise<T>;
  put<T>(path: string, body: unknown, opts?: RequestOptions): Promise<T>;
  delete<T>(path: string, opts?: RequestOptions): Promise<T>;
  patch<T>(path: string, body: unknown, opts?: RequestOptions): Promise<T>;
}
```

**Python**
```python
class JiraClient:
    def __init__(
        self,
        base_url: str,
        email: str,
        api_token: str,
        timeout: float = 30.0,       # seconds
    ) -> None: ...

    def __enter__(self) -> JiraClient: ...
    def __exit__(self, *args) -> None: ...
    def close(self) -> None: ...

    def get_user(self, account_id: str) -> User: ...
    def search_users(self, query: str, max_results: int = 50) -> list[User]: ...
    def find_assignable_users(self, project_keys: list[str], query: str | None = None, max_results: int = 50) -> list[User]: ...
    def create_issue(self, issue_data: IssueCreate) -> Issue: ...
    def get_issue(self, issue_key: str) -> Issue: ...
    def update_issue(self, issue_key: str, update_data: IssueUpdate) -> None: ...
    def assign_issue(self, issue_key: str, assignment: IssueAssignment) -> None: ...
    def get_issue_transitions(self, issue_key: str) -> list[IssueTransition]: ...
    def transition_issue(self, issue_key: str, transition_request: IssueTransitionRequest) -> None: ...
    def get_project(self, project_key: str) -> Project: ...
    def get_project_versions(self, project_key: str) -> list[ProjectVersion]: ...
    def create_project_version(self, version_data: ProjectVersionCreate) -> ProjectVersion: ...
    def get_issue_types(self) -> list[dict[str, Any]]: ...
    def get_issue_type_id_by_name(self, project_key: str, issue_type_name: str) -> str: ...
```

---

## Services

### UserService

High-level user operations built on the core client.

**TypeScript**
```typescript
class UserService {
  constructor(client: JiraFetchClient);

  getUserById(accountId: string): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  searchUsers(query: string, maxResults?: number): Promise<User[]>;
  findAssignableUsers(projectKeys: string[], query?: string, maxResults?: number): Promise<User[]>;
  getUserByIdentifier(identifier: string): Promise<User | null>;
}
```

**Python**
```python
class UserService:
    def __init__(self, client: JiraClient) -> None: ...

    def get_user_by_id(self, account_id: str) -> User: ...
    def get_user_by_email(self, email: str) -> User | None: ...
    def search_users(self, query: str, max_results: int = 50) -> list[User]: ...
    def find_assignable_users_for_projects(self, project_keys: list[str], query: str | None = None, max_results: int = 50) -> list[User]: ...
    def get_user_by_identifier(self, identifier: str) -> User | None: ...
```

### IssueService

High-level issue operations with automatic ADF conversion and user resolution.

**TypeScript**
```typescript
class IssueService {
  constructor(client: JiraFetchClient);

  createIssue(params: {
    projectId: string;
    summary: string;
    issueTypeId: string;
    description?: string;
    priorityId?: string;
    assigneeEmail?: string;
    labels?: string[];
  }): Promise<Issue>;

  createIssueByTypeName(params: {
    projectKey: string;
    summary: string;
    issueTypeName: string;
    description?: string;
    priorityId?: string;
    assigneeEmail?: string;
    labels?: string[];
  }): Promise<Issue>;

  getIssue(issueKey: string): Promise<Issue>;
  updateIssueSummary(issueKey: string, summary: string): Promise<void>;
  updateIssueDescription(issueKey: string, description: string): Promise<void>;
  addLabels(issueKey: string, labels: string[]): Promise<void>;
  removeLabels(issueKey: string, labels: string[]): Promise<void>;
  assignIssueByEmail(issueKey: string, email: string): Promise<void>;
  unassignIssue(issueKey: string): Promise<void>;
  getAvailableTransitions(issueKey: string): Promise<IssueTransition[]>;
  transitionIssueByName(issueKey: string, transitionName: string, comment?: string, resolutionName?: string): Promise<void>;
  transitionIssueById(issueKey: string, transitionId: string, comment?: string, resolutionName?: string): Promise<void>;
}
```

**Python**
```python
class IssueService:
    def __init__(self, client: JiraClient) -> None: ...

    def create_issue(
        self, project_id: str, summary: str, issue_type_id: str,
        description: str | None = None, priority_id: str | None = None,
        assignee_email: str | None = None, labels: list[str] | None = None,
    ) -> Issue: ...

    def create_issue_by_type_name(
        self, project_key: str, summary: str, issue_type_name: str,
        description: str | None = None, priority_id: str | None = None,
        assignee_email: str | None = None, labels: list[str] | None = None,
    ) -> Issue: ...

    def get_issue(self, issue_key: str) -> Issue: ...
    def update_issue_summary(self, issue_key: str, summary: str) -> None: ...
    def update_issue_description(self, issue_key: str, description: str) -> None: ...
    def add_labels_to_issue(self, issue_key: str, labels: list[str]) -> None: ...
    def remove_labels_from_issue(self, issue_key: str, labels: list[str]) -> None: ...
    def assign_issue_by_email(self, issue_key: str, assignee_email: str) -> None: ...
    def unassign_issue(self, issue_key: str) -> None: ...
    def get_available_transitions(self, issue_key: str) -> list[IssueTransition]: ...
    def transition_issue_by_name(self, issue_key: str, transition_name: str, comment: str | None = None, resolution_name: str | None = None) -> None: ...
    def transition_issue_by_id(self, issue_key: str, transition_id: str, comment: str | None = None, resolution_name: str | None = None) -> None: ...
```

### ProjectService

High-level project and version operations.

**TypeScript**
```typescript
class ProjectService {
  constructor(client: JiraFetchClient);

  getProject(projectKey: string): Promise<Project>;
  getProjectVersions(projectKey: string, releasedOnly?: boolean | null): Promise<ProjectVersion[]>;
  createVersion(params: {
    projectKey: string;
    versionName: string;
    description?: string;
    startDate?: string;
    releaseDate?: string;
    released?: boolean;
    archived?: boolean;
  }): Promise<ProjectVersion>;
  getVersionByName(projectKey: string, versionName: string): Promise<ProjectVersion | null>;
  getReleasedVersions(projectKey: string): Promise<ProjectVersion[]>;
  getUnreleasedVersions(projectKey: string): Promise<ProjectVersion[]>;
  getIssueTypes(): Promise<object[]>;
}
```

**Python**
```python
class ProjectService:
    def __init__(self, client: JiraClient) -> None: ...

    def get_project(self, project_key: str) -> Project: ...
    def get_project_versions(self, project_key: str, released_only: bool | None = None) -> list[ProjectVersion]: ...
    def create_version(
        self, project_key: str, version_name: str,
        description: str | None = None, start_date: str | None = None,
        release_date: str | None = None, released: bool = False, archived: bool = False,
    ) -> ProjectVersion: ...
    def get_version_by_name(self, project_key: str, version_name: str) -> ProjectVersion | None: ...
    def get_released_versions(self, project_key: str) -> list[ProjectVersion]: ...
    def get_unreleased_versions(self, project_key: str) -> list[ProjectVersion]: ...
    def get_issue_types(self) -> list[dict[str, Any]]: ...
```

---

## Models

### User

| Field | TypeScript (Zod) | Python (Pydantic) |
|-------|------------------|-------------------|
| `accountId` / `account_id` | `z.string()` | `str` (alias `accountId`) |
| `emailAddress` / `email_address` | `z.string().optional()` | `str \| None` (alias `emailAddress`) |
| `displayName` / `display_name` | `z.string()` | `str` (alias `displayName`) |
| `active` | `z.boolean()` | `bool` |
| `avatarUrls` / `avatar_urls` | `z.record().optional()` | `dict[str, str] \| None` (alias `avatarUrls`) |
| `timeZone` / `time_zone` | `z.string().optional()` | `str \| None` (alias `timeZone`) |

### Issue

| Field | TypeScript (Zod) | Python (Pydantic) |
|-------|------------------|-------------------|
| `id` | `z.string()` | `str` |
| `key` | `z.string()` | `str` |
| `self` / `self_url` | `z.string()` | `str` (alias `self`) |
| `fields` | `IssueFieldsSchema` | `IssueFields` |
| `changelog` | `z.object().optional()` | `dict \| None` |

### IssueFields

| Field | TypeScript (Zod) | Python (Pydantic) |
|-------|------------------|-------------------|
| `summary` | `z.string()` | `str` |
| `description` | `z.unknown().optional()` | `str \| None` |
| `issuetype` / `issue_type` | `IssueTypeSchema` | `IssueType` (alias `issuetype`) |
| `project` | `ProjectSchema` | `Project` |
| `status` | `IssueStatusSchema` | `IssueStatus` |
| `priority` | `IssuePrioritySchema.optional()` | `IssuePriority \| None` |
| `assignee` | `UserSchema.optional()` | `User \| None` |
| `reporter` | `UserSchema.optional()` | `User \| None` |
| `labels` | `z.array(z.string())` | `list[str]` |
| `created` | `z.string().optional()` | `datetime \| None` |
| `updated` | `z.string().optional()` | `datetime \| None` |

### IssueCreate

| Field | TypeScript | Python |
|-------|-----------|--------|
| `projectId` / `project_id` | `z.string()` | `str` |
| `summary` | `z.string()` | `str` |
| `issueTypeId` / `issue_type_id` | `z.string()` | `str` |
| `description` | `z.string().optional()` | `str \| None` |
| `priorityId` / `priority_id` | `z.string().optional()` | `str \| None` |
| `labels` | `z.array(z.string())` | `list[str]` |

### IssueUpdate

| Field | TypeScript | Python |
|-------|-----------|--------|
| `summary` | `z.string().optional()` | `str \| None` |
| `description` | `z.string().optional()` | `str \| None` |
| `labelsAdd` / `labels_add` | `z.array(z.string())` | `list[str]` |
| `labelsRemove` / `labels_remove` | `z.array(z.string())` | `list[str]` |
| `priorityId` / `priority_id` | `z.string().optional()` | `str \| None` |

### IssueTransition

| Field | TypeScript | Python |
|-------|-----------|--------|
| `id` | `z.string()` | `str` |
| `name` | `z.string()` | `str` |
| `to` | `IssueStatusSchema` | `IssueStatus` |
| `hasScreen` / `has_screen` | `z.boolean()` | `bool` (alias `hasScreen`) |

### Project

| Field | TypeScript | Python |
|-------|-----------|--------|
| `id` | `z.string()` | `str` |
| `key` | `z.string()` | `str` |
| `name` | `z.string()` | `str` |
| `description` | `z.string().optional()` | `str \| None` |
| `lead` | `ProjectLeadSchema.optional()` | `ProjectLead \| None` |
| `projectTypeKey` / `project_type_key` | `z.string().optional()` | `str \| None` (alias `projectTypeKey`) |
| `issueTypes` / `issue_types` | `z.array(IssueTypeSchema).optional()` | `list[IssueType] \| None` (alias `issueTypes`) |

### ProjectVersion

| Field | TypeScript | Python |
|-------|-----------|--------|
| `id` | `z.string()` | `str` |
| `name` | `z.string()` | `str` |
| `description` | `z.string().optional()` | `str \| None` |
| `archived` | `z.boolean()` | `bool` |
| `released` | `z.boolean()` | `bool` |
| `startDate` / `start_date` | `z.string().optional()` | `datetime \| None` |
| `releaseDate` / `release_date` | `z.string().optional()` | `datetime \| None` |
| `projectId` / `project_id` | `z.number()` | `int` (alias `projectId`) |

---

## Error Hierarchy

Both stacks share an identical error hierarchy mapping HTTP status codes to typed exceptions.

| HTTP Status | TypeScript | Python |
|-------------|-----------|--------|
| (base) | `JiraApiError` | `JiraAPIError` |
| 400 | `JiraValidationError` | `JiraValidationError` |
| 401 | `JiraAuthenticationError` | `JiraAuthenticationError` |
| 403 | `JiraPermissionError` | `JiraPermissionError` |
| 404 | `JiraNotFoundError` | `JiraNotFoundError` |
| 429 | `JiraRateLimitError` | `JiraRateLimitError` |
| 5xx | `JiraServerError` | `JiraServerError` |
| Network | `JiraNetworkError` | `JiraNetworkError` |
| Timeout | `JiraTimeoutError` | `JiraTimeoutError` |
| Config | `JiraConfigurationError` | `JiraConfigurationError` |
| SDK | `SDKError` | `SDKError` |

**TypeScript — Base error**
```typescript
class JiraApiError extends Error {
  code: string;        // ErrorCode enum value
  status?: number;
  responseData?: unknown;
  url?: string;
  method?: string;

  toJSON(): object;
  static isJiraApiError(error: unknown): boolean;
  static hasStatusCode(error: unknown, status: number): boolean;
}
```

**Python — Base error**
```python
class JiraAPIError(Exception):
    message: str
    status_code: int | None
    response_data: dict[str, Any]
    url: str | None
    method: str | None

    def to_dict(self) -> dict[str, Any]: ...
```

**Factory function**
```typescript
// TypeScript
function createErrorFromResponse(status: number, body: unknown, url?: string, method?: string, headers?: { retryAfter?: number }): JiraApiError;
```
```python
# Python
def create_error_from_response(status: int, body: dict | None, url: str | None = None, method: str | None = None, retry_after: float | None = None) -> JiraAPIError: ...
```

---

## Configuration

### Config Loading

Both stacks load configuration with the same priority: **environment variables > config file** (`~/.jira-api/config.json`).

**TypeScript**
```typescript
function loadConfigFromEnv(): JiraConfig | null;
function loadConfigFromFile(): JiraConfig | null;
function getConfig(): JiraConfig | null;
function saveConfig(config: JiraConfig): void;
function getServerConfig(): ServerConfig;
```

**Python**
```python
def load_config_from_env() -> JiraConfig | None: ...
def load_config_from_file() -> JiraConfig | None: ...
def get_config() -> JiraConfig | None: ...
def save_config(config: JiraConfig) -> None: ...

class Settings(BaseSettings):
    jira_base_url: str | None
    jira_email: str | None
    jira_api_token: str | None
    server_host: str           # default "0.0.0.0"
    server_port: int           # default 8000
    server_reload: bool        # default False
    server_api_key: str | None
    log_level: str             # default "INFO"
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `JIRA_BASE_URL` | Jira Cloud instance URL (e.g. `https://yourteam.atlassian.net`) |
| `JIRA_EMAIL` | Jira account email address |
| `JIRA_API_TOKEN` | Jira API token |
| `SERVER_HOST` | Server bind host (default: `0.0.0.0`) |
| `SERVER_PORT` | Server port (default: `8000`) |
| `SERVER_RELOAD` | Enable auto-reload (default: `false`) |
| `SERVER_API_KEY` | Optional API key for server authentication |
| `LOG_LEVEL` | Logging level (`info` / `INFO`) |

---

## ADF Utilities

Helper functions for converting plain text to Atlassian Document Format (ADF) v1, required by Jira Cloud REST API v3 for description and comment fields.

**TypeScript**
```typescript
function textToAdf(text: string): object | null;
function commentToAdf(text: string): object | null;
```

**Python**
```python
def text_to_adf(text: str) -> dict[str, Any] | None: ...
def comment_to_adf(text: str) -> dict[str, Any] | None: ...
```

---

## SDK Client

The SDK client communicates with the REST proxy server (Fastify or FastAPI) rather than Jira Cloud directly.

**TypeScript**
```typescript
class JiraSDKClient {
  constructor(options: {
    baseUrl: string;
    apiKey?: string;
    timeoutMs?: number;  // default: 30000
  });

  // Health
  healthCheck(): Promise<object>;

  // Users
  searchUsers(query: string, maxResults?: number): Promise<User[]>;
  getUser(identifier: string): Promise<User>;

  // Issues
  createIssue(issueData: object): Promise<Issue>;
  getIssue(issueKey: string): Promise<Issue>;
  updateIssue(issueKey: string, updateData: object): Promise<object>;
  assignIssue(issueKey: string, email: string): Promise<object>;
  getIssueTransitions(issueKey: string): Promise<IssueTransition[]>;
  transitionIssue(issueKey: string, transitionName: string, comment?: string, resolutionName?: string): Promise<object>;

  // Projects
  getProject(projectKey: string): Promise<Project>;
  getProjectVersions(projectKey: string, released?: boolean): Promise<ProjectVersion[]>;
  createProjectVersion(projectKey: string, name: string, description?: string): Promise<ProjectVersion>;
}
```

**Python**
```python
class JiraSDKClient:
    def __init__(
        self,
        base_url: str,
        api_key: str | None = None,
        timeout: float = 30.0,
    ) -> None: ...

    def __enter__(self) -> JiraSDKClient: ...
    def __exit__(self, *args) -> None: ...
    def close(self) -> None: ...

    # Health
    def health_check(self) -> dict[str, str]: ...

    # Users
    def search_users(self, query: str, max_results: int = 50) -> list[User]: ...
    def get_user(self, identifier: str) -> User: ...

    # Issues
    def create_issue(self, issue_data: IssueCreate) -> Issue: ...
    def get_issue(self, issue_key: str) -> Issue: ...
    def update_issue(self, issue_key: str, update_data: IssueUpdate) -> dict[str, str]: ...
    def assign_issue(self, issue_key: str, email: str) -> dict[str, str]: ...
    def get_issue_transitions(self, issue_key: str) -> list[IssueTransition]: ...
    def transition_issue(self, issue_key: str, transition_name: str, comment: str | None = None, resolution_name: str | None = None) -> dict[str, str]: ...

    # Projects
    def get_project(self, project_key: str) -> Project: ...
    def get_project_versions(self, project_key: str, released: bool | None = None) -> list[ProjectVersion]: ...
    def create_project_version(self, project_key: str, name: str, description: str | None = None) -> ProjectVersion: ...
```

---

## Server

### Built-in Server

Both stacks include a built-in REST proxy server that exposes Jira operations via HTTP.

**TypeScript (Fastify)**
```typescript
function createServer(overrides?: { apiKey?: string }): Promise<FastifyInstance>;
function startServer(): Promise<void>;
```

**Python (FastAPI)**
```python
# Module: jira_api.server
app: FastAPI          # importable application instance
def start_server() -> None: ...
```

### Route Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/users/search?query=...&max_results=50` | Search users |
| `GET` | `/users/:identifier` | Get user by ID or email |
| `POST` | `/issues` | Create issue |
| `GET` | `/issues/:issueKey` | Get issue |
| `PATCH` | `/issues/:issueKey` | Update issue |
| `PUT` | `/issues/:issueKey/assign/:email` | Assign issue |
| `GET` | `/issues/:issueKey/transitions` | Get transitions |
| `POST` | `/issues/:issueKey/transitions` | Transition issue |
| `GET` | `/projects/:projectKey` | Get project |
| `GET` | `/projects/:projectKey/versions` | Get versions |
| `POST` | `/projects/:projectKey/versions` | Create version |

---

## Logger

**TypeScript**
```typescript
function createLogger(name: string, url?: string): Logger;
const nullLogger: Logger;
```

**Python**
```python
def create_logger(name: str, filepath: str | None = None) -> Logger: ...
```
