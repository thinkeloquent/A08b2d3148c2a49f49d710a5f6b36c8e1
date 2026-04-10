# Security Alert Triage

Aggregate open security alerts across code scanning (CodeQL), secret scanning, and Dependabot -- normalizes severity and produces a prioritized triage report.

## Prerequisites

- Node.js >= 20
- GitHub personal access token with `security_events` scope (and `repo` for private repositories)
- pnpm for dependency installation

## Setup

```bash
cd platform/tools/analysis_github_security_alert_triage
pnpm install
```

Set your GitHub token via environment variable or `.env` file:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
# or
echo "GITHUB_TOKEN=ghp_xxxxxxxxxxxx" > .env
```

## Usage

### Interactive Mode

```bash
node cli.mjs
```

The interactive wizard prompts for:

1. **Triage scope** -- select one of four routes:
   - Full Security Triage (all 3 alert types)
   - Code Scanning Only
   - Secret Scanning Only
   - Dependabot Only
2. **Repository** -- hierarchy scope picker (org/repo)
3. **Alert state** -- open, dismissed, or all
4. **Minimum severity** -- all, critical, error/high, warning/medium, note/low
5. **Tool name filter** -- (code-scanning routes only) e.g. "CodeQL"
6. **Output options** -- format, output directory, filename, verbosity

A confirmation summary is displayed before execution.

### Non-Interactive Mode (CI/Agents)

```bash
node bin/security_alert_triage.mjs --repo owner/repo [options]
# or
node cli.mjs --repo owner/repo [options]
```

Passing `--repo` on the command line bypasses the interactive wizard and delegates to the non-interactive path.

## Configuration

### Environment Variables

| Variable | Description |
|---|---|
| `GITHUB_TOKEN` | GitHub personal access token (can also use `--token` flag) |

### CLI Options

#### Common Options (from SDK)

| Flag | Type | Default | Description |
|---|---|---|---|
| `--token <token>` | string | `GITHUB_TOKEN` env | GitHub personal access token |
| `--repo <repo>` | string | -- | Repository in `owner/repo` format (required) |
| `--org <org>` | string | -- | GitHub organization |
| `--searchUser <user>` | string | -- | GitHub username(s), comma-separated |
| `--format <format>` | string | `json` | Output format: `json` |
| `--outputDir <dir>` | string | `./output` | Directory to save report files |
| `--filename <name>` | string | auto-generated | Base name for output files |
| `--totalRecords <n>` | string | `0` | Max records to fetch (0 = no limit) |
| `--delay <seconds>` | string | `6` | Delay between API requests in seconds |
| `--verbose` | boolean | `false` | Enable verbose logging |
| `--debug` | boolean | `false` | Enable debug logging and audit file output |
| `--baseUrl <url>` | string | `https://api.github.com` | GitHub API base URL (for GHES) |
| `--meta-tags <key=value>` | string[] | `[]` | Metadata tags (repeatable) |
| `--start <date>` | string | -- | Start date (YYYY-MM-DD) |
| `--end <date>` | string | -- | End date (YYYY-MM-DD) |
| `--ignoreDateRange` | boolean | `false` | Ignore date range, search all time |
| `--loadData <path>` | string | -- | Path to JSON file to load at runtime |
| `--daysAgo <n>` | string | -- | Relative time window in days |

#### Tool-Specific Options

| Flag | Type | Default | Description |
|---|---|---|---|
| `--alertTypes <types>` | string | `code-scanning,secret-scanning,dependabot` | Comma-separated alert types to fetch |
| `--alertState <state>` | string | `open` | Alert state filter: `open`, `closed`, `dismissed`, `all` |
| `--minSeverity <level>` | string | -- | Minimum severity: `note`, `warning`, `error`, `critical` |
| `--toolName <name>` | string | -- | Filter code-scanning alerts by tool name (e.g. `CodeQL`) |

## Output

### JSON Report

The report is saved as `security-alert-triage-{repo}-{date}.json` (or custom `--filename`) with this structure:

```
{
  metadata: {
    reportVersion,        // "1.0"
    toolName,             // "security-alert-triage"
    description,          // Report description
    insight,              // Analytical insight text
    improves,             // What this improves
    repository,           // owner/repo
    generatedAt,          // ISO timestamp
    metaTags,             // User-supplied metadata
    inputs,               // All input parameters used
    criteria,             // Human-readable filter criteria
    formula               // Priority score formulas
  },
  summary: {
    totalAlerts,           // Total alerts after filtering
    totalCodeScanning,     // Code scanning alert count
    totalSecretScanning,   // Secret scanning alert count
    totalDependabot,       // Dependabot alert count
    bySeverityCount: {     // Counts per normalized severity
      critical, high, medium, low
    },
    alertTypes,            // Which alert types were fetched
    alertState,            // Which state was filtered
    minSeverityApplied     // minSeverity filter value or null
  },
  triage: {
    prioritizedAlerts,     // All alerts sorted by priority score descending
    byType,                // Alerts grouped by type
    bySeverity,            // Alerts grouped by severity
    topAffectedFiles       // Top 10 files with most code-scanning alerts
  }
}
```

### Debug/Audit File

When `--debug` is enabled, an additional `.audit.json` file is written containing all API call details and errors.

### Stream Output

A crash-safe JSONL stream file is written incrementally during execution.

## Priority Score Formula

Each alert receives a priority score computed as:

```
Priority Score = severityWeight x typeWeight x recencyWeight
```

| Factor | Values |
|---|---|
| Severity weights | critical=4, high=3, medium=2, low=1 |
| Type weights | secret-scanning=1.5, code-scanning=1.2, dependabot=1.0 |
| Recency weights | <7 days=1.5, <30 days=1.2, else=1.0 |

Severity normalization across alert types:
- **Code scanning**: error -> critical, warning -> high, note -> medium
- **Secret scanning**: active -> critical, possibly_valid -> high, unknown -> medium, inactive/invalid -> low
- **Dependabot**: direct mapping (critical/high/medium/low)

## Examples

### Basic usage -- full triage of a repository

```bash
node bin/security_alert_triage.mjs \
  --repo octocat/hello-world \
  --token ghp_xxxxxxxxxxxx
```

### Code scanning only, critical alerts

```bash
node bin/security_alert_triage.mjs \
  --repo octocat/hello-world \
  --alertTypes code-scanning \
  --minSeverity critical \
  --verbose
```

### Dependabot triage with custom output directory

```bash
node bin/security_alert_triage.mjs \
  --repo octocat/hello-world \
  --alertTypes dependabot \
  --alertState all \
  --outputDir ./reports \
  --filename my-triage-report
```

### CI/agent automation with debug audit

```bash
GITHUB_TOKEN=$GH_TOKEN node bin/security_alert_triage.mjs \
  --repo "$REPO" \
  --alertTypes code-scanning,secret-scanning,dependabot \
  --alertState open \
  --minSeverity warning \
  --format json \
  --outputDir ./ci-output \
  --debug
```

## Architecture

```
analysis_github_security_alert_triage/
  cli.mjs                          # Interactive wizard entry point
  bin/security_alert_triage.mjs    # Non-interactive entry point
  package.json
  src/
    main.mjs                       # CLI parser + service bootstrap
    report-metadata.mjs            # Static report metadata constants
    cli/
      program-args.mjs             # Commander option definitions
      defaults-and-validate.mjs    # Validation, defaults, type coercion
    config/
      schema.mjs                   # Zod schema (extends BaseConfigSchema)
      normalize.mjs                # Schema-based normalization
    github/endpoints/
      code-scanning-alerts.mjs     # Re-export from shared polyglot module
      secret-scanning-alerts.mjs   # Re-export from shared polyglot module
      dependabot-alerts.mjs        # Re-export from shared polyglot module
    analysis/
      triage-analyzer.mjs          # Severity normalization, priority scoring, grouping
    reporting/
      report-builder.mjs           # Assembles full report object
      writers/
        json-writer.mjs            # JSON file writer
    services/
      security-alert-triage.mjs    # Main service class (SecurityAlertTriage)
```

The endpoint files under `src/github/endpoints/` are thin re-exports from the shared `polyglot/github_sdk_api_security_alerts` module. The service class builds a `ctx` object and passes it to the shared endpoint generators.
