# GitHub Secret Scanning Tool

Downloads open GitHub secret scanning alerts with full location data, optionally applies a user-provided handler to remediate secrets in local files, and resolves alerts on GitHub.

## Prerequisites

- Node.js >= 20
- GitHub personal access token with `security_events` and `repo` scope
- pnpm for dependency installation

## Setup

```bash
cd platform/tools/github_security_secret_scanning
pnpm install
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN_SECSCAN` | Preferred | Token with security scanning permissions (checked first) |
| `GITHUB_TOKEN` | Fallback | Standard GitHub token (used if `GITHUB_TOKEN_SECSCAN` not set) |

Token precedence: `GITHUB_TOKEN_SECSCAN` > `GITHUB_TOKEN` > `--token` flag.

## Usage

### Interactive Mode

```bash
node cli.mjs
```

The interactive wizard provides 2 routes:

| Route | Description |
|-------|-------------|
| **Check Alerts** | Download and display open secret scanning alerts with locations |
| **Resolve Alerts** | Download, apply handler, optionally resolve on GitHub |

### Non-Interactive Mode (CI/Agents)

#### Check Mode — Download and display alerts

```bash
node bin/secret_scanning.mjs \
  --mode check \
  --repo thinkeloquent/A08b2d3148c2a49f49d710a5f6b36c8e1 \
  --token $GITHUB_TOKEN_SECSCAN \
  --outputDir ./reports
```

#### Resolve Mode — Apply handler and fix local files

```bash
node bin/secret_scanning.mjs \
  --mode resolve \
  --repo thinkeloquent/A08b2d3148c2a49f49d710a5f6b36c8e1 \
  --handler ./handlers/redact-base64.mjs \
  --token $GITHUB_TOKEN_SECSCAN \
  --repoRoot /Users/Shared/autoload/A08b2d3148c2a49f49d710a5f6b36c8e1 \
  --outputDir ./reports
```

#### Resolve Mode with Auto-Resolve on GitHub

```bash
node bin/secret_scanning.mjs \
  --mode resolve \
  --repo thinkeloquent/A08b2d3148c2a49f49d710a5f6b36c8e1 \
  --handler ./handlers/redact-base64.mjs \
  --autoResolve \
  --secretResolution false_positive \
  --token $GITHUB_TOKEN_SECSCAN \
  --repoRoot /Users/Shared/autoload/A08b2d3148c2a49f49d710a5f6b36c8e1 \
  --outputDir ./reports
```

## Configuration

### CLI Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--mode <mode>` | string | required | `check` or `resolve` |
| `--repo <owner/repo>` | string | required | Repository in `owner/repo` format |
| `--token <token>` | string | env var | GitHub token (overrides env vars) |
| `--handler <path>` | string | - | Path to handler .mjs file (required for resolve mode) |
| `--secretResolution <resolution>` | string | `"false_positive"` | Resolution for GitHub: `false_positive`, `wont_fix`, `revoked`, `used_in_tests` |
| `--autoResolve` | boolean | `false` | Auto-resolve on GitHub after handler fixes all locations |
| `--dryRun` | boolean | `true` | Preview mode — no GitHub API writes |
| `--no-dryRun` | boolean | - | Disable dry run mode |
| `--repoRoot <path>` | string | auto-detect | Local repository root for file operations |
| `--format <fmt>` | string | `json` | Output format |
| `--outputDir <dir>` | string | `./output` | Output directory |
| `--filename <name>` | string | auto-generated | Output filename (without extension) |
| `--verbose` | boolean | `false` | Verbose logging |
| `--debug` | boolean | `false` | Debug mode (generates `.audit.json`) |

### Safety Defaults

- **`dryRun` defaults to `true`** — the tool will NOT resolve any alerts on GitHub unless you pass `--autoResolve`
- **`--autoResolve` implies `--no-dryRun`** — no need to pass both
- Interactive mode shows a **safety confirmation** before auto-resolving

## How It Works

### Check Mode

1. Fetches all open secret scanning alerts via `GET /repos/{owner}/{repo}/secret-scanning/alerts?state=open`
2. For each alert, fetches locations via `GET /repos/{owner}/{repo}/secret-scanning/alerts/{n}/locations`
3. Saves alert + location data as JSON to `--outputDir`
4. Displays a summary table with alert types, validity, and file locations

### Resolve Mode

1. Same fetch phase as check mode
2. Dynamically imports the handler module from `--handler` path
3. For each (alert, location) pair where `location.type === "commit"` and a file path exists:
   - Calls `handler(alert, location, context)`
   - Collects the result: `{ action: "fixed"|"skipped"|"error", message? }`
4. An alert is eligible for auto-resolve only when **ALL** its locations return `action: "fixed"`
5. If `--autoResolve` is set: resolves eligible alerts on GitHub via `PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{n}`
6. Generates a JSON report with per-alert handler results

## Handler Contract

The handler is an ESM module (`.mjs`) that exports a default async function:

```javascript
/**
 * @param {object} alert    — GitHub alert object
 *   { number, secret_type, secret_type_display_name, validity, html_url, secret, ... }
 * @param {object} location — One location from the alert
 *   { type, details: { path, start_line, end_line, start_column, end_column, blob_sha, commit_sha } }
 * @param {object} context  — Helper utilities
 *   { repoRoot, log, readFile(relPath), writeFile(relPath, content) }
 * @returns {Promise<{ action: "fixed"|"skipped"|"error", message?: string }>}
 */
export default async function handler(alert, location, context) {
  const filePath = location.details.path;

  try {
    const content = await context.readFile(filePath);

    // Example: replace a known Base64 secret with a placeholder
    const updated = content.replace(/dXNlcjpwYXNz/g, "REDACTED_BASE64");

    if (updated !== content) {
      await context.writeFile(filePath, updated);
      return { action: "fixed", message: "Replaced Base64 secret with placeholder" };
    }

    return { action: "skipped", message: "Secret not found in current file content" };
  } catch (err) {
    return { action: "error", message: err.message };
  }
}
```

### Handler Parameters

| Parameter | Description |
|-----------|-------------|
| `alert` | Full GitHub secret scanning alert object from the API |
| `location` | One location object with `type` and `details` (path, line numbers, blob SHA) |
| `context.repoRoot` | Absolute path to the local repository root |
| `context.log` | Logger function for structured output |
| `context.readFile(relPath)` | Read a file relative to repoRoot (returns UTF-8 string) |
| `context.writeFile(relPath, content)` | Write a file relative to repoRoot |

### Handler Return Value

| Field | Type | Description |
|-------|------|-------------|
| `action` | `"fixed"` \| `"skipped"` \| `"error"` | What happened |
| `message` | string (optional) | Human-readable description |

## Output

### JSON Report Structure

```json
{
  "metadata": {
    "reportVersion": "1.0",
    "toolName": "github-security-secret-scanning",
    "generatedAt": "2026-04-10T...",
    "inputs": { "repo": "...", "mode": "resolve", "handler": "...", ... }
  },
  "summary": {
    "mode": "resolve",
    "totalAlerts": 1,
    "totalLocations": 3,
    "fixed": 3,
    "skipped": 0,
    "errored": 0,
    "autoResolved": 1,
    "autoResolveFailed": 0
  },
  "alerts": [
    {
      "number": 1,
      "secret_type": "generic_api_key",
      "validity": "unknown",
      "html_url": "https://github.com/.../security/secret-scanning/1",
      "locations": [ { "type": "commit", "path": "src/config.mjs", ... } ],
      "handlerResults": [ { "action": "fixed", "message": "...", "path": "src/config.mjs" } ],
      "resolvedOnGitHub": true
    }
  ]
}
```

## Architecture

```
github_security_secret_scanning/
├── bin/secret_scanning.mjs              # Non-interactive entry (delegates to src/main.mjs)
├── cli.mjs                              # Interactive wizard (2 routes with safety confirmations)
├── package.json
└── src/
    ├── main.mjs                         # Commander parse → validate → run
    ├── report-metadata.mjs              # Static constants, buildCriteria, buildFormula
    ├── cli/
    │   ├── program-args.mjs             # Commander options + addCommonOptions
    │   └── defaults-and-validate.mjs    # Token precedence, autoResolve→dryRun coercion, repoRoot auto-detect
    ├── config/
    │   ├── schema.mjs                   # Zod schema: mode, handler, secretResolution, autoResolve, dryRun, repoRoot
    │   └── normalize.mjs               # SDK normalization wrapper
    ├── github/endpoints/
    │   ├── secret-scanning-alerts.mjs   # Re-export from polyglot
    │   ├── secret-scanning-locations.mjs # Paginated locations endpoint (NEW)
    │   └── alert-dismiss.mjs            # Re-export resolveSecretScanningAlert, fetchDefaultBranch
    ├── handler/
    │   ├── handler-loader.mjs           # Dynamic import + validate default export
    │   └── handler-context.mjs          # Build { repoRoot, log, readFile, writeFile }
    ├── services/
    │   └── secret-scanning-service.mjs  # Service class (fetch → check/resolve → report)
    └── reporting/
        ├── report-builder.mjs           # Assembles JSON report with handler results
        └── writers/json-writer.mjs      # writeJsonReport
```
