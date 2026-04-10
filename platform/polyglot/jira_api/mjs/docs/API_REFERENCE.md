# Jira API — Node.js API Reference

API reference for the `jira_api` Node.js ESM package. All modules use native ES modules (`.mjs`).

---

## JiraFetchClient

The primary HTTP client for Jira Cloud REST API v3.

```typescript
import { JiraFetchClient } from '../../src/index.mjs';
```

### Constructor

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `baseUrl` | `string` | (required) | Jira Cloud instance URL |
| `email` | `string` | (required) | Jira account email |
| `apiToken` | `string` | (required) | Jira API token |
| `timeoutMs` | `number` | `30000` | Request timeout in milliseconds |
| `fetchClientOptions` | `object` | `{}` | Options passed to `FetchClient` |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `request` | `request<T>(config: JiraRequestConfig): Promise<T>` | Execute a typed API request |
| `get` | `get<T>(path, opts?): Promise<T>` | HTTP GET |
| `post` | `post<T>(path, body, opts?): Promise<T>` | HTTP POST |
| `put` | `put<T>(path, body, opts?): Promise<T>` | HTTP PUT |
| `delete` | `delete<T>(path, opts?): Promise<T>` | HTTP DELETE |
| `patch` | `patch<T>(path, body, opts?): Promise<T>` | HTTP PATCH |

### JiraRequestConfig

| Field | Type | Description |
|-------|------|-------------|
| `method` | `string` | HTTP method |
| `path` | `string` | API path (e.g. `/rest/api/3/issue`) |
| `body` | `unknown` | Request body (JSON-serialized) |
| `queryParams` | `Record<string, string \| number \| string[]>` | Query parameters |
| `pathParams` | `Record<string, string>` | Path parameter substitution `{key}` |
| `headers` | `Record<string, string>` | Additional headers |

---

## FetchClient

Generic HTTP client with timeout support, used internally by `JiraFetchClient`.

```typescript
import { FetchClient } from '../../src/index.mjs';
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `fetchAdapter` | `FetchAdapter` | (required) | Fetch implementation (e.g. `UndiciFetchAdapter`) |
| `timeoutMs` | `number` | `30000` | Request timeout in milliseconds |

---

## Services

### UserService

```typescript
import { UserService } from '../../src/index.mjs';

const service = new UserService(client);
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `getUserById` | `(accountId: string) => Promise<User>` | Get user by Jira account ID |
| `getUserByEmail` | `(email: string) => Promise<User \| null>` | Get user by email address |
| `searchUsers` | `(query: string, maxResults?: number) => Promise<User[]>` | Search users by query string |
| `findAssignableUsers` | `(projectKeys: string[], query?: string, maxResults?: number) => Promise<User[]>` | Find assignable users for projects |
| `getUserByIdentifier` | `(identifier: string) => Promise<User \| null>` | Get user by account ID or email (tries both) |

### IssueService

```typescript
import { IssueService } from '../../src/index.mjs';

const service = new IssueService(client);
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `createIssue` | `({ projectId, summary, issueTypeId, description?, priorityId?, assigneeEmail?, labels? }) => Promise<Issue>` | Create a new issue |
| `createIssueByTypeName` | `({ projectKey, summary, issueTypeName, description?, ... }) => Promise<Issue>` | Create issue using type name instead of ID |
| `getIssue` | `(issueKey: string) => Promise<Issue>` | Get issue by key |
| `updateIssueSummary` | `(issueKey: string, summary: string) => Promise<void>` | Update issue summary |
| `updateIssueDescription` | `(issueKey: string, description: string) => Promise<void>` | Update issue description |
| `addLabels` | `(issueKey: string, labels: string[]) => Promise<void>` | Add labels to an issue |
| `removeLabels` | `(issueKey: string, labels: string[]) => Promise<void>` | Remove labels from an issue |
| `assignIssueByEmail` | `(issueKey: string, email: string) => Promise<void>` | Assign issue to user by email |
| `unassignIssue` | `(issueKey: string) => Promise<void>` | Unassign an issue |
| `getAvailableTransitions` | `(issueKey: string) => Promise<IssueTransition[]>` | Get available transitions |
| `transitionIssueByName` | `(issueKey, transitionName, comment?, resolutionName?) => Promise<void>` | Transition issue by name |
| `transitionIssueById` | `(issueKey, transitionId, comment?, resolutionName?) => Promise<void>` | Transition issue by ID |

### ProjectService

```typescript
import { ProjectService } from '../../src/index.mjs';

const service = new ProjectService(client);
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `getProject` | `(projectKey: string) => Promise<Project>` | Get project by key |
| `getProjectVersions` | `(projectKey: string, releasedOnly?: boolean \| null) => Promise<ProjectVersion[]>` | Get versions (optionally filtered) |
| `createVersion` | `({ projectKey, versionName, description?, startDate?, releaseDate?, released?, archived? }) => Promise<ProjectVersion>` | Create a new version |
| `getVersionByName` | `(projectKey: string, versionName: string) => Promise<ProjectVersion \| null>` | Find version by name |
| `getReleasedVersions` | `(projectKey: string) => Promise<ProjectVersion[]>` | Get released versions only |
| `getUnreleasedVersions` | `(projectKey: string) => Promise<ProjectVersion[]>` | Get unreleased versions only |
| `getIssueTypes` | `() => Promise<object[]>` | Get all issue types |

---

## Zod Schemas

All models are defined as Zod schemas. Parse raw Jira API responses through them for runtime validation.

```typescript
import {
  UserSchema,
  IssueSchema,
  ProjectSchema,
  ProjectVersionSchema,
  IssueCreateSchema,
  IssueUpdateSchema,
  IssueTransitionSchema,
  IssueTypeSchema,
} from '../../src/index.mjs';
```

### Converter Functions

Transform model data to Jira REST API v3 format:

| Function | Description |
|----------|-------------|
| `issueCreateToJiraFormat(data)` | Convert issue creation data to `{ fields: { ... } }` |
| `issueUpdateToJiraFormat(data)` | Convert issue update data to `{ update: { ... } }` |
| `issueTransitionToJiraFormat(data)` | Convert transition request to `{ transition: { id }, ... }` |
| `issueAssignmentToJiraFormat(data)` | Convert assignment to `{ accountId }` |

---

## Error Classes

```typescript
import {
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
} from '../../src/index.mjs';
```

### JiraApiError (base class)

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Error message |
| `code` | `string` | Machine-readable code (`ErrorCode` value) |
| `status` | `number \| undefined` | HTTP status code |
| `responseData` | `unknown` | Raw response body |
| `url` | `string \| undefined` | Request URL |
| `method` | `string \| undefined` | HTTP method |

| Method | Description |
|--------|-------------|
| `toJSON()` | Serialize to plain object |
| `JiraApiError.isJiraApiError(error)` | Type guard |
| `JiraApiError.hasStatusCode(error, status)` | Check status code |

### ErrorCode

| Code | Value | Used By |
|------|-------|---------|
| `NETWORK` | `'NETWORK'` | `JiraNetworkError` |
| `RESPONSE` | `'RESPONSE'` | HTTP status errors |
| `TIMEOUT` | `'TIMEOUT'` | `JiraTimeoutError` |
| `CONFIGURATION` | `'CONFIGURATION'` | `JiraConfigurationError` |
| `RATE_LIMIT` | `'RATE_LIMIT'` | `JiraRateLimitError` |

---

## Configuration

```typescript
import {
  getConfig,
  saveConfig,
  loadConfigFromEnv,
  loadConfigFromFile,
  getServerConfig,
} from '../../src/index.mjs';
```

| Function | Returns | Description |
|----------|---------|-------------|
| `getConfig()` | `JiraConfig \| null` | Load config (env > file priority) |
| `loadConfigFromEnv()` | `JiraConfig \| null` | Load from environment variables |
| `loadConfigFromFile()` | `JiraConfig \| null` | Load from `~/.jira-api/config.json` |
| `saveConfig(config)` | `void` | Save config with `0600` permissions |
| `getServerConfig()` | `ServerConfig` | Load server settings from env |

---

## ADF Utilities

```typescript
import { textToAdf, commentToAdf } from '../../src/index.mjs';
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `textToAdf` | `(text: string) => object \| null` | Convert text to ADF v1 document |
| `commentToAdf` | `(text: string) => object \| null` | Wrap text in ADF comment body |

---

## SDK Client

```typescript
import { JiraSDKClient } from '../../src/index.mjs';
```

See [SDK Guide](../docs/SDK_GUIDE.md) for usage details.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `baseUrl` | `string` | (required) | Proxy server URL |
| `apiKey` | `string` | `undefined` | Optional API key |
| `timeoutMs` | `number` | `30000` | Request timeout (ms) |

---

## Server

```typescript
import { createServer, startServer, createErrorHandler } from '../../src/index.mjs';
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `createServer` | `(overrides?) => Promise<FastifyInstance>` | Create configured Fastify server |
| `startServer` | `() => Promise<void>` | Create and start server with env config |
| `createErrorHandler` | `() => FastifyErrorHandler` | Error handler for `JiraApiError` mapping |

---

## Logger

```typescript
import { createLogger, nullLogger } from '../../src/index.mjs';

const log = createLogger('my-module', import.meta.url);
log.info('message', { key: 'value' });
log.debug('debug info');
log.warn('warning');
log.error('error', { error: err.message });
```
