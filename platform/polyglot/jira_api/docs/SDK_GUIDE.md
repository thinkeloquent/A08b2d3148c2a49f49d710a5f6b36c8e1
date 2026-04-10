# Jira API — SDK Guide

The Jira API SDK provides a high-level client for CLI tools, LLM Agents, and Developer Tools to interact with a Jira API proxy server. The SDK communicates with the REST proxy (Fastify or FastAPI) rather than Jira Cloud directly, enabling centralized authentication and rate limiting.

---

## Installation

### Node.js

```bash
cd polyglot/jira_api/mjs
pnpm install
```

### Python

```bash
cd polyglot/jira_api/py
pip install -e ".[dev]"
```

---

## Quick Start

### Node.js

```typescript
import { JiraSDKClient } from '../../src/index.mjs';

const sdk = new JiraSDKClient({
  baseUrl: 'http://localhost:8000',
  apiKey: process.env.SERVER_API_KEY,
  timeoutMs: 30_000,
});

// Health check
const health = await sdk.healthCheck();
console.log('Server status:', health.status);

// Search users
const users = await sdk.searchUsers('john', 10);
console.log('Found users:', users.length);

// Get an issue
const issue = await sdk.getIssue('PROJ-123');
console.log('Issue:', issue.key, issue.fields.summary);

// Transition an issue
await sdk.transitionIssue('PROJ-123', 'In Progress');
```

### Python

```python
from jira_api.sdk.client import JiraSDKClient

with JiraSDKClient(
    base_url="http://localhost:8000",
    api_key=os.environ.get("SERVER_API_KEY"),
    timeout=30.0,
) as sdk:
    # Health check
    health = sdk.health_check()
    print(f"Server status: {health['status']}")

    # Search users
    users = sdk.search_users("john", max_results=10)
    print(f"Found users: {len(users)}")

    # Get an issue
    issue = sdk.get_issue("PROJ-123")
    print(f"Issue: {issue.key} — {issue.fields.summary}")

    # Transition an issue
    sdk.transition_issue("PROJ-123", "In Progress")
```

---

## Authentication

The SDK authenticates with the proxy server using an optional API key sent via HTTP Basic Auth (username = API key, password = empty).

| Parameter | Node.js | Python | Default |
|-----------|---------|--------|---------|
| Server URL | `baseUrl` | `base_url` | (required) |
| API key | `apiKey` | `api_key` | `undefined` / `None` |
| Timeout | `timeoutMs` (ms) | `timeout` (seconds) | `30000` / `30.0` |

If no `apiKey` / `api_key` is provided, requests are sent without authentication headers.

---

## Features

### User Operations

- `searchUsers(query, maxResults)` / `search_users(query, max_results)` — Search for Jira users
- `getUser(identifier)` / `get_user(identifier)` — Get user by account ID or email

### Issue Operations

- `createIssue(issueData)` / `create_issue(issue_data)` — Create a new issue
- `getIssue(issueKey)` / `get_issue(issue_key)` — Get issue by key
- `updateIssue(issueKey, updateData)` / `update_issue(issue_key, update_data)` — Update an issue
- `assignIssue(issueKey, email)` / `assign_issue(issue_key, email)` — Assign issue to user by email
- `getIssueTransitions(issueKey)` / `get_issue_transitions(issue_key)` — Get available transitions
- `transitionIssue(issueKey, transitionName, comment?, resolutionName?)` / `transition_issue(issue_key, transition_name, comment, resolution_name)` — Transition an issue

### Project Operations

- `getProject(projectKey)` / `get_project(project_key)` — Get project details
- `getProjectVersions(projectKey, released?)` / `get_project_versions(project_key, released)` — List project versions
- `createProjectVersion(projectKey, name, description?)` / `create_project_version(project_key, name, description)` — Create a new version

### Health

- `healthCheck()` / `health_check()` — Verify server connectivity

---

## Error Handling

The SDK throws `SDKError` (extends the base `JiraApiError` / `JiraAPIError`) for all server errors.

### Node.js

```typescript
import { JiraSDKClient, SDKError } from '../../src/index.mjs';

try {
  const issue = await sdk.getIssue('NONEXISTENT-999');
} catch (err) {
  if (err instanceof SDKError) {
    console.error(`SDK Error (${err.status}): ${err.message}`);
  }
}
```

### Python

```python
from jira_api.exceptions import SDKError

try:
    issue = sdk.get_issue("NONEXISTENT-999")
except SDKError as e:
    print(f"SDK Error ({e.status_code}): {e.message}")
```

---

## Architecture

```
┌────────────┐     HTTP      ┌──────────────────┐     JIRA REST     ┌───────────┐
│  SDK Client │ ────────────> │  Proxy Server     │ ────────────────> │ Jira Cloud│
│  (your app) │              │  (Fastify/FastAPI) │                  │  REST v3  │
└────────────┘              └──────────────────┘                   └───────────┘
```

The SDK client sends HTTP requests to the proxy server, which handles authentication with Jira Cloud, error mapping, and response formatting. This separation allows the SDK to operate without Jira credentials — the proxy manages them centrally.
