# GitHub SDK API Security Alerts

Shared polyglot module providing paginated GitHub API endpoint functions for fetching and managing security alerts (code scanning, secret scanning, Dependabot) and dismiss/resolve operations.

## Prerequisites

- Node.js >= 20
- pnpm for dependency installation
- `@internal/github-api-sdk-cli` package (peer dependency for `makeRequest`)

## Setup

```bash
cd platform/polyglot/github_sdk_api_security_alerts/mjs
pnpm install
```

Or use the Makefile at the package root:

```bash
make install
```

This is a library module -- it has no standalone entrypoint.

## Available Endpoints

### Read Endpoints (AsyncGenerators)

All read endpoints are async generators that yield individual alert objects page by page (100 per page). They accept a `ctx` context object and a params object.

| Function | API Route | Module |
|---|---|---|
| `fetchCodeScanningAlerts` | `GET /repos/{owner}/{repo}/code-scanning/alerts` | `code-scanning-alerts.mjs` |
| `fetchCodeScanningAlert` | `GET /repos/{owner}/{repo}/code-scanning/alerts/{alertNumber}` | `code-scanning-alerts.mjs` |
| `fetchSecretScanningAlerts` | `GET /repos/{owner}/{repo}/secret-scanning/alerts` | `secret-scanning-alerts.mjs` |
| `fetchDependabotAlerts` | `GET /repos/{owner}/{repo}/dependabot/alerts` | `dependabot-alerts.mjs` |

### Write Endpoints (Dismiss/Resolve)

| Function | API Route | Module |
|---|---|---|
| `fetchDefaultBranch` | `GET /repos/{owner}/{repo}` | `alert-dismiss.mjs` |
| `dismissCodeScanningAlert` | `PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alertNumber}` | `alert-dismiss.mjs` |
| `resolveSecretScanningAlert` | `PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alertNumber}` | `alert-dismiss.mjs` |
| `dismissDependabotAlert` | `PATCH /repos/{owner}/{repo}/dependabot/alerts/{alertNumber}` | `alert-dismiss.mjs` |

## The `ctx` Pattern

Every endpoint function takes a `ctx` (context) object as its first argument. The ctx object must provide these fields:

| Field | Type | Description |
|---|---|---|
| `ctx.makeRequest` | `Function` | SDK core request function (from `createGitHubClient`). Signature: `makeRequest(route, params)` |
| `ctx.log` | `Function` | Logger function. Signature: `log(message, level?)` |
| `ctx.debugLog` | `Function` | Debug logger function. Signature: `debugLog(label, data)` |
| `ctx.cancelled` | `{ value: boolean }` | Mutable cancellation flag. Set `ctx.cancelled.value = true` to stop pagination. |

In consumer tools, the ctx is typically built by the service class constructor using SDK helpers:

```js
import {
  createGitHubClient,
  createLogger,
  createDebugLogger,
} from "@internal/github-api-sdk-cli";

const { log, output } = createLogger(config);
const { debugLog } = createDebugLogger(config);
const { makeRequest } = createGitHubClient(config, { log, debugLog, apiCalls });

const ctx = {
  makeRequest,
  log,
  debugLog,
  cancelled: { value: false },
};
```

## Endpoint Parameters

### fetchCodeScanningAlerts

| Param | Type | Default | Description |
|---|---|---|---|
| `owner` | `string` | required | Repository owner |
| `repo` | `string` | required | Repository name |
| `state` | `string` | `"open"` | Alert state: `open`, `closed`, `dismissed`, `fixed` |
| `severity` | `string` | -- | Filter by severity: `critical`, `high`, `medium`, `low`, `warning`, `note`, `error` |
| `toolName` | `string` | -- | Filter by tool name (e.g., `"CodeQL"`) |
| `ref` | `string` | -- | Git ref to filter alerts for |

### fetchSecretScanningAlerts

| Param | Type | Default | Description |
|---|---|---|---|
| `owner` | `string` | required | Repository owner |
| `repo` | `string` | required | Repository name |
| `state` | `string` | `"open"` | Alert state: `open`, `resolved` |
| `secretType` | `string` | -- | Filter by secret type (e.g., `"github_personal_access_token"`) |
| `validity` | `string` | -- | Filter by validity: `active`, `inactive`, `unknown` |

### fetchDependabotAlerts

| Param | Type | Default | Description |
|---|---|---|---|
| `owner` | `string` | required | Repository owner |
| `repo` | `string` | required | Repository name |
| `state` | `string` | `"open"` | Alert state: `open`, `dismissed`, `fixed`, `auto_dismissed` |
| `severity` | `string` | -- | Filter by severity: `critical`, `high`, `medium`, `low` |
| `ecosystem` | `string` | -- | Filter by ecosystem: `npm`, `pip`, `maven`, `nuget`, `rubygems`, `composer`, `go`, `rust`, `pub` |
| `scope` | `string` | -- | Filter by scope: `runtime`, `development` |

### Dismiss / Resolve Parameters

**dismissCodeScanningAlert**: `owner`, `repo`, `alertNumber`, `dismissedReason` (`"false positive"`, `"won't fix"`, `"used in tests"`), optional `dismissedComment`.

**resolveSecretScanningAlert**: `owner`, `repo`, `alertNumber`, `resolution` (`"false_positive"`, `"wont_fix"`, `"revoked"`, `"used_in_tests"`), optional `comment`.

**dismissDependabotAlert**: `owner`, `repo`, `alertNumber`, `dismissedReason` (`"fix_started"`, `"inaccurate"`, `"no_bandwidth"`, `"not_used"`, `"tolerable_risk"`), optional `dismissedComment`.

## Re-export Pattern

Consumer tools do not import this module directly in their service code. Instead, each consumer creates a thin re-export file under its own `src/github/endpoints/` directory that re-exports the needed functions from this shared module via a relative path:

```js
// tools/analysis_github_security_alert_triage/src/github/endpoints/code-scanning-alerts.mjs

export {
  fetchCodeScanningAlerts,
  fetchCodeScanningAlert,
} from "../../../../../polyglot/github_sdk_api_security_alerts/mjs/src/github/endpoints/code-scanning-alerts.mjs";
```

This pattern keeps each tool's internal imports clean (relative to its own `src/`) while centralizing the actual API logic in this shared polyglot module.

### Creating a New Re-export File

To add a new consumer tool that uses this module:

1. Create the directory `src/github/endpoints/` in the consumer tool.
2. Create a re-export file for each endpoint you need. The relative path from the consumer back to this module is:
   ```
   ../../..../polyglot/github_sdk_api_security_alerts/mjs/src/github/endpoints/<endpoint>.mjs
   ```
3. Import from your local re-export in service code:
   ```js
   import { fetchDependabotAlerts } from "../github/endpoints/dependabot-alerts.mjs";
   ```

## Error Handling

All fetch endpoints handle HTTP 403 and 404 gracefully -- they log a warning and return without throwing. This allows tools to attempt fetching alert types that may not be enabled for a repository (e.g., secret scanning requires GitHub Advanced Security) without crashing the entire run.

## Architecture

```
polyglot/github_sdk_api_security_alerts/
  Makefile                         # install/test/clean targets
  mjs/
    package.json                   # @internal/github-sdk-api-security-alerts
    src/github/endpoints/
      code-scanning-alerts.mjs     # fetchCodeScanningAlerts, fetchCodeScanningAlert
      secret-scanning-alerts.mjs   # fetchSecretScanningAlerts
      dependabot-alerts.mjs        # fetchDependabotAlerts
      alert-dismiss.mjs            # fetchDefaultBranch, dismissCodeScanningAlert, resolveSecretScanningAlert, dismissDependabotAlert
```

Dependencies:
- `@internal/github-api-sdk-cli` -- provides the SDK client, rate limiter, and `makeRequest` factory
- `octokit` -- underlying GitHub API client
