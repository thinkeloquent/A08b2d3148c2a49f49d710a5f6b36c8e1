# Security Alert Resolver

Checks open GitHub security alerts against the default branch and optionally auto-closes alerts that have been resolved. Outputs a JSON report consumable by the other security analysis tools.

## Prerequisites

- Node.js >= 20
- GitHub personal access token with `security_events` scope (for code scanning) and `repo` scope
- pnpm for dependency installation

## Setup

```bash
cd platform/tools/analysis_github_security_alert_resolver
pnpm install
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN_SECSCAN` | Preferred | Token with security scanning permissions (checked first) |
| `GITHUB_TOKEN` | Fallback | Standard GitHub token (used if `GITHUB_TOKEN_SECSCAN` not set) |
| `GITHUB_HOSTNAME` | No | Custom GitHub hostname (default: `github.com`) |

Token precedence: `GITHUB_TOKEN_SECSCAN` > `GITHUB_TOKEN` > `--token` flag.

Create a `.env` file:

```env
GITHUB_TOKEN_SECSCAN=ghp_your_security_token_here
# or
GITHUB_TOKEN=ghp_your_token_here
```

## Usage

### Interactive Mode

```bash
node cli.mjs
```

The interactive wizard provides 3 routes:

| Route | Description | Safety |
|-------|-------------|--------|
| **Dry Run — Check Resolutions** | Preview which alerts are resolved without any API writes | Safe (read-only) |
| **Auto-Close Resolved Alerts** | Check and close resolved alerts via GitHub PATCH API | Requires double confirmation |
| **Code Scanning Only** | Check only CodeQL/SAST findings (dry run) | Safe (read-only) |

The wizard prompts for:
1. Route selection
2. Repository (hierarchy scope picker)
3. Alert types to check (for dry run route)
4. Branch override (or auto-detect)
5. Dismiss reason/comment (for auto-close route)
6. Output options

### Non-Interactive Mode (CI/Agents)

```bash
# Dry run — preview resolved alerts (default, safe)
node bin/security_alert_resolver.mjs \
  --repo thinkeloquent/mta-v800 \
  --token $GITHUB_TOKEN_SECSCAN

# Auto-close resolved alerts on main branch
node bin/security_alert_resolver.mjs \
  --repo thinkeloquent/mta-v800 \
  --autoClose --no-dryRun \
  --dismissReason "false positive" \
  --dismissComment "Auto-resolved: fixed on main branch"

# Check only code scanning, against a specific branch
node bin/security_alert_resolver.mjs \
  --repo thinkeloquent/mta-v800 \
  --alertTypes code-scanning \
  --ref main

# Full debug output with audit log
node bin/security_alert_resolver.mjs \
  --repo thinkeloquent/mta-v800 \
  --autoClose --no-dryRun \
  --debug --verbose \
  --outputDir ./output/resolver
```

## Configuration

### CLI Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--repo <owner/repo>` | string | required | Repository in `owner/repo` format |
| `--token <token>` | string | env var | GitHub token (overrides env vars) |
| `--alertTypes <types>` | string | all three | Comma-separated: `code-scanning,secret-scanning,dependabot` |
| `--dryRun` | boolean | `true` | Preview only — no API writes |
| `--no-dryRun` | boolean | - | Disable dry run mode |
| `--autoClose` | boolean | `false` | Auto-close resolved alerts (implies `--no-dryRun`) |
| `--dismissReason <reason>` | string | `"false positive"` | Reason sent to GitHub API |
| `--dismissComment <comment>` | string | auto-generated | Comment sent to GitHub API |
| `--secretResolution <resolution>` | string | `"revoked"` | Resolution for secret scanning: `false_positive`, `wont_fix`, `revoked`, `used_in_tests` |
| `--ref <branch>` | string | auto-detect | Override default branch (e.g., `main`, `develop`) |
| `--format <fmt>` | string | `json` | Output format |
| `--outputDir <dir>` | string | `./output` | Output directory |
| `--filename <name>` | string | auto-generated | Output filename (without extension) |
| `--verbose` | boolean | `false` | Verbose logging |
| `--debug` | boolean | `false` | Debug mode (generates `.audit.json`) |

### Safety Defaults

- **`dryRun` defaults to `true`** — the tool will NOT close any alerts unless you explicitly pass `--autoClose`
- **`--autoClose` implies `--no-dryRun`** — no need to pass both
- Interactive mode shows a **danger confirmation prompt** before auto-closing

## How Resolution Checking Works

### Code Scanning Alerts

1. Fetches all open alerts (no ref filter)
2. Fetches open alerts filtered by `ref=refs/heads/<defaultBranch>`
3. **Diff**: alerts in set #1 but NOT in set #2 have been fixed on the default branch
4. Those are marked as `resolved` — candidates for auto-close

### Secret Scanning Alerts

1. For each open alert, fetches locations via `GET /repos/{owner}/{repo}/secret-scanning/alerts/{number}/locations`
2. For each commit-type location, fetches the file at that path on the default branch via `GET /repos/{owner}/{repo}/contents/{path}?ref={defaultBranch}`
3. Compares the location's `blob_sha` against the current file's `sha` on the default branch
4. If the blob SHA **matches** → the exact file content containing the secret is still present → `stillOpen`
5. If the blob SHA **differs** (file modified) or file returns 404 (deleted) → that location is resolved
6. If **all** commit locations are resolved → the alert is `resolved`
7. On fetch failure → conservatively treated as `stillOpen`
8. File blob SHAs are cached per path to avoid redundant API calls across alerts

### Dependabot Alerts

Dependabot alerts are auto-managed by GitHub. The tool re-checks each alert's state:
- If `state !== "open"` → `resolved`
- Otherwise → `stillOpen`

## Output

### JSON Report Structure

```json
{
  "metadata": {
    "reportVersion": "1.0",
    "toolName": "security-alert-resolver",
    "description": "...",
    "generatedAt": "2026-04-09T...",
    "inputs": {
      "repo": "thinkeloquent/mta-v800",
      "dryRun": false,
      "autoClose": true,
      "dismissReason": "false positive",
      "ref": "main"
    }
  },
  "summary": {
    "defaultBranch": "main",
    "totalOpen": 100,
    "totalResolved": 30,
    "totalStillOpen": 70,
    "totalAutoClosed": 30,
    "totalFailed": 0,
    "byType": {
      "code-scanning": { "open": 80, "resolved": 25, "autoClosed": 25, "failed": 0 },
      "secret-scanning": { "open": 5, "resolved": 3, "autoClosed": 3, "failed": 0 },
      "dependabot": { "open": 15, "resolved": 2, "autoClosed": 2, "failed": 0 }
    }
  },
  "resolutions": {
    "codeScanningResolved": [
      { "number": 123, "rule": { "id": "js/clear-text-logging", ... }, "file": "src/app.mjs" }
    ],
    "codeScanningStillOpen": [...],
    "secretScanningResolved": [...],
    "secretScanningStillOpen": [...],
    "dependabotResolved": [...],
    "dependabotStillOpen": [...],
    "failed": [
      { "number": 456, "type": "code-scanning", "error": "403 Forbidden" }
    ]
  }
}
```

### Consuming the Report from Other Tools

The report JSON is designed to be consumed by the triage and tracker tools:

```bash
# 1. Run resolver to check what's been fixed
node bin/security_alert_resolver.mjs \
  --repo thinkeloquent/mta-v800 \
  --outputDir ./output

# 2. Feed results into triage for remaining open alerts
node ../analysis_github_security_alert_triage/bin/security_alert_triage.mjs \
  --repo thinkeloquent/mta-v800 \
  --outputDir ./output

# 3. Deep-dive into remaining code scanning alerts
node ../analysis_github_codescan_remediation_tracker/bin/codescan_remediation_tracker.mjs \
  --repo thinkeloquent/mta-v800 \
  --outputDir ./output
```

## Examples

### 1. Basic dry run — see what's been fixed

```bash
GITHUB_TOKEN_SECSCAN=ghp_xxx node bin/security_alert_resolver.mjs \
  --repo thinkeloquent/mta-v800
```

### 2. Auto-close after pushing fixes to main

```bash
# After pushing security fixes:
git push origin main

# Wait for CodeQL to re-scan, then close stale alerts:
node bin/security_alert_resolver.mjs \
  --repo thinkeloquent/mta-v800 \
  --autoClose \
  --dismissComment "Fixed in commit $(git rev-parse --short HEAD)"
```

### 3. CI pipeline integration

```bash
# In CI after security fixes merge:
node bin/security_alert_resolver.mjs \
  --repo $GITHUB_REPOSITORY \
  --token $GITHUB_TOKEN_SECSCAN \
  --autoClose --no-dryRun \
  --alertTypes code-scanning \
  --ref main \
  --outputDir ./security-reports \
  --debug
```

### 4. AI agent automation (repeatable process)

```bash
# Step 1: Triage to understand the landscape
node ../analysis_github_security_alert_triage/bin/security_alert_triage.mjs \
  --repo thinkeloquent/mta-v800 --outputDir ./reports

# Step 2: Apply fixes (manual or automated)
# ... fix code ...
# git commit && git push

# Step 3: Resolve — check and close fixed alerts
node bin/security_alert_resolver.mjs \
  --repo thinkeloquent/mta-v800 \
  --autoClose \
  --outputDir ./reports

# Step 4: Verify — re-triage to confirm resolution
node ../analysis_github_security_alert_triage/bin/security_alert_triage.mjs \
  --repo thinkeloquent/mta-v800 --outputDir ./reports
```

## Architecture

```
analysis_github_security_alert_resolver/
├── bin/security_alert_resolver.mjs    # Non-interactive entry (delegates to src/main.mjs)
├── cli.mjs                            # Interactive wizard (3 routes with safety confirmations)
├── package.json
└── src/
    ├── main.mjs                       # Commander parse → validate → run
    ├── cli/
    │   ├── program-args.mjs           # Commander options + addCommonOptions
    │   └── defaults-and-validate.mjs  # Token precedence, autoClose→dryRun coercion
    ├── config/
    │   ├── schema.mjs                 # Zod schema: alertTypes, dryRun, autoClose, dismissReason, secretResolution, ref
    │   └── normalize.mjs              # SDK normalization wrapper
    ├── github/endpoints/              # Re-exports from polyglot shared module
    │   ├── code-scanning-alerts.mjs   # fetchCodeScanningAlerts, fetchCodeScanningAlert
    │   ├── secret-scanning-alerts.mjs # fetchSecretScanningAlerts
    │   ├── dependabot-alerts.mjs      # fetchDependabotAlerts
    │   └── alert-dismiss.mjs          # fetchDefaultBranch, dismiss*, resolve*
    ├── analysis/
    │   └── resolution-checker.mjs     # Core: diff open alerts vs default branch
    ├── services/
    │   └── security-alert-resolver.mjs # Service class (fetch → check → close → report)
    ├── reporting/
    │   ├── report-builder.mjs         # Assembles JSON report
    │   └── writers/json-writer.mjs
    └── report-metadata.mjs            # Static constants, buildCriteria, buildFormula
```

### Key Flow: `SecurityAlertResolver.run()`

1. **Detect default branch** — `fetchDefaultBranch()` or use `--ref` override
2. **Fetch open alerts** — all three types via async generators
3. **Check resolutions** — `ResolutionChecker` diffs open vs default-branch-filtered sets
4. **Auto-close** (if enabled) — PATCH API calls for resolved alerts
5. **Generate report** — JSON with resolved/stillOpen/failed breakdown
6. **Display summary** — terminal output with counts and colors
