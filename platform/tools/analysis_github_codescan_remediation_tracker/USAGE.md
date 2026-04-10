# CodeQL Code Scanning Remediation Tracker

Deep-dive into CodeQL code scanning alerts -- group by rule, map to hotspot files, track remediation velocity over time.

## Prerequisites

- Node.js >= 20
- GitHub personal access token with `security_events` scope (and `repo` for private repositories)
- pnpm for dependency installation
- Repository must have code scanning (CodeQL) enabled

## Setup

```bash
cd platform/tools/analysis_github_codescan_remediation_tracker
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

1. **Analysis mode** -- select one of three routes:
   - **Full Remediation Report** -- all severities with velocity analysis
   - **Severity Focus** -- filter to error-only or warning-only
   - **Hotspot Analysis** -- file heatmap focus, skips velocity
2. **Repository** -- hierarchy scope picker (org/repo)
3. **Route-specific options**:
   - Full: severity multi-select, include fixed alerts, velocity window (weeks)
   - Severity Focus: severity selection, include fixed, velocity window
   - Hotspot: number of top files, number of top rules (skips velocity)
4. **Output options** -- format, output directory, filename, verbosity

A confirmation summary is displayed before execution.

### Non-Interactive Mode (CI/Agents)

```bash
node bin/codescan_remediation_tracker.mjs --repo owner/repo [options]
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
| `--format <format>` | string | `json` | Output format: `json` or `csv` |
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
| `--severity <levels>` | string | -- | Comma-separated severity levels: `error`, `warning`, `note`. Omit for all. |
| `--toolName <name>` | string | `CodeQL` | Code scanning tool name to filter by |
| `--includeFixed` | boolean | `false` (CLI) / `true` (schema) | Include fixed/closed alerts in velocity analysis |
| `--velocityWeeks <n>` | number | `12` | Number of weeks to analyze for remediation velocity (1-52) |
| `--topFiles <n>` | number | `20` | Number of top hotspot files to include in report (1-100) |
| `--topRules <n>` | number | `30` | Number of top rules to include in report (1-100) |

## Output

### JSON Report

The report is saved as `codescan-remediation-tracker-{owner}-{repo}-{date}.json` with this structure:

```
{
  metadata: {
    reportVersion,          // "1.0"
    toolName,               // "codescan-remediation-tracker"
    description,
    insight,
    improves,
    repo,                   // owner/repo
    generatedAt,            // ISO timestamp
    metaTags,
    inputs,                 // All input parameters used
    criteria,               // Human-readable filter criteria
    formula,                // Analysis formulas
    dateRange               // If date range is active
  },
  summary: {
    totalOpenAlerts,         // Open alert count
    totalFixedAlerts,        // Fixed alert count
    uniqueRules,             // Number of distinct CodeQL rules
    topRule,                 // Rule ID with most alerts
    topRuleCount,            // Alert count for top rule
    topFile,                 // File path with highest hotspot score
    topFileScore,            // Hotspot score for top file
    avgFixesPerWeek,         // Average fixes per week
    projectedWeeksToZero,    // Estimated weeks to clear all open alerts (or "N/A")
    trendDirection,          // "improving", "stable", or "declining"
    batchCandidates          // Number of rules suitable for batch remediation
  },
  analytics: {
    ruleBreakdown,           // Top N rules with open/fixed counts and fix rate
    fileHeatmap,             // Top N files by hotspot score
    velocity: {
      openCount,
      fixedCount,
      weeksAnalyzed,
      avgFixesPerWeek,
      trend,                 // Linear regression slope
      trendDirection,
      projectedWeeksToZero,
      weeklyData,            // Per-week fix/open/net/cumulative counts
      batchCandidates        // Rules with fix rate > 2x average
    }
  }
}
```

### CSV Reports

When `--format csv` is used, four CSV files are generated:

| File Suffix | Columns |
|---|---|
| `-rule-breakdown.csv` | `ruleId`, `description`, `severity`, `openCount`, `fixedCount`, `fixRate` |
| `-file-heatmap.csv` | `filePath`, `alertCount`, `hotspotScore`, `topRules` |
| `-weekly-velocity.csv` | `week`, `fixedCount`, `openedCount`, `netChange`, `cumulativeOpen` |
| `-summary.csv` | All summary keys as columns (single-row) |

### Debug/Audit File

When `--debug` is enabled, an additional `.audit.json` file is written containing all API call details and errors.

## Analysis Formulas

| Formula | Description |
|---|---|
| `hotspotScore = alertCount x severityWeight` | error=3, warning=2, note=1 |
| `avgFixesPerWeek = totalFixed / weeksAnalyzed` | Over the velocity window |
| `projectedWeeksToZero = openCount / avgFixesPerWeek` | Linear projection |
| `trend = linear regression slope` | Over weekly fix counts |
| `batchCandidate = ruleFixCount > 2 x avgRuleFixRate` | Rules suitable for batch fix |

## Examples

### Basic full remediation report

```bash
node bin/codescan_remediation_tracker.mjs \
  --repo octocat/hello-world \
  --token ghp_xxxxxxxxxxxx
```

### Error-only alerts with 24-week velocity window

```bash
node bin/codescan_remediation_tracker.mjs \
  --repo octocat/hello-world \
  --severity error \
  --includeFixed \
  --velocityWeeks 24 \
  --verbose
```

### Hotspot analysis with CSV output

```bash
node bin/codescan_remediation_tracker.mjs \
  --repo octocat/hello-world \
  --topFiles 50 \
  --topRules 50 \
  --format csv \
  --outputDir ./reports
```

### CI/agent automation

```bash
GITHUB_TOKEN=$GH_TOKEN node bin/codescan_remediation_tracker.mjs \
  --repo "$REPO" \
  --includeFixed \
  --velocityWeeks 12 \
  --format json \
  --outputDir ./ci-output \
  --filename "codescan-report" \
  --debug
```

## Architecture

```
analysis_github_codescan_remediation_tracker/
  cli.mjs                               # Interactive wizard entry point
  bin/codescan_remediation_tracker.mjs   # Non-interactive entry point
  package.json
  src/
    main.mjs                             # CLI parser + service bootstrap
    report-metadata.mjs                  # Static report metadata constants
    cli/
      program-args.mjs                   # Commander option definitions
      defaults-and-validate.mjs          # Validation, defaults, type coercion
    config/
      schema.mjs                         # Zod schema (extends BaseConfigSchema)
      normalize.mjs                      # Schema-based normalization
    github/endpoints/
      code-scanning-alerts.mjs           # Re-export from shared polyglot module
    analysis/
      rule-grouper.mjs                   # Groups alerts by CodeQL rule ID
      file-heatmap.mjs                   # Maps alerts to file paths, computes hotspot scores
      remediation-velocity.mjs           # Weekly fix rate, trend, projections, batch candidates
    reporting/
      report-builder.mjs                 # Assembles full report object
      writers/
        json-writer.mjs                  # JSON file writer
        csv-writer.mjs                   # CSV file writer (4 files)
    services/
      codescan-remediation-tracker.mjs   # Main service class (CodescanRemediationTracker)
```

The endpoint file under `src/github/endpoints/` is a thin re-export from the shared `polyglot/github_sdk_api_security_alerts` module. The service class fetches both open and fixed alerts (when `includeFixed` is true) and passes them through three analysis modules before building the final report.
