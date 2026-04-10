# GitHub Rule Tree Extractor

Extract conditional logic from a GitHub repository and convert it to rule tree structures using AST parsing. Output is compatible with the `rule-tree-table` API.

## How It Works

The tool scans source files in a GitHub repo, parses them into an AST (Abstract Syntax Tree), and converts control-flow patterns into hierarchical rule trees with groups and conditions.

### Detected Patterns

| Code Pattern | Rule Tree Output |
|---|---|
| `if (a && b)` | AND group with conditions |
| `if (a \|\| b)` | OR group with conditions |
| `if / else if / else` | OR group containing branch groups |
| `switch (field) { case ... }` | OR group with equality conditions |
| `!expr` / `not expr` | NOT group |
| `a === b`, `a >= b` | Condition (equals, greater_than_or_equal, etc.) |
| `a.includes(b)` | Condition (contains) |
| `a.startsWith(b)` | Condition (starts_with) |
| Ternary `a ? b : c` | Condition from the test expression |
| Python `match/case` | OR group with equality conditions |
| Python `a in [...]` | Condition (in) |
| Python `a is not b` | Condition (not_equals) |

### Language Support

- **JavaScript / TypeScript** (`.js`, `.mjs`, `.jsx`, `.ts`, `.tsx`) — parsed with `acorn-loose` (tolerant AST parser)
- **Python** (`.py`) — parsed with regex-based line analysis (covers `if`/`elif`, `match`/`case`, comparisons, logical operators)

## Installation

```bash
npm install
```

## Inputs

| Input | CLI Flag | Interactive Prompt | Required |
|---|---|---|---|
| Repository | `--repo <repo>` | GitHub repo (URL or owner/repo) | Yes |
| Branch | `--branch <branch>` | Branch | Yes |
| Root search folder | `--root-folder <path>` | Root search folder | No |
| Rule Tree Name | `--rule-tree-name <name>` | Rule Tree Name | Yes |
| Files to search | `--search <patterns>` | File patterns to search | No |
| Files to ignore | `--ignore <patterns>` | File patterns to ignore | No |

### Additional Options

| Flag | Description | Default |
|---|---|---|
| `--token <token>` | GitHub personal access token (falls back to `GITHUB_TOKEN` env) | — |
| `--output-dir <dir>` | Output directory for JSON files | `./output` |
| `--upload` | Upload to rule-tree-table API after extraction | `false` |
| `--api-base <url>` | API base URL | `http://localhost:51000/api/rule-tree-table` |
| `--delay <ms>` | Delay between GitHub API requests | `50` |
| `--verbose` | Verbose logging | `false` |
| `--upload-file <path>` | Upload from a previously saved JSON file (skips extraction) | — |

## Usage

### Interactive Mode

```bash
node cli.mjs
```

Prompts for all inputs with a summary and confirmation before running.

### Non-Interactive Mode

**Extract only:**

```bash
node bin/extract.mjs \
  --repo owner/my-app \
  --branch main \
  --rule-tree-name "Access Control Rules" \
  --root-folder src/auth \
  --search "*.mjs,*.ts" \
  --ignore "*.test.mjs,*.spec.ts"
```

**Extract and upload:**

```bash
node bin/extract.mjs \
  --repo owner/my-app \
  --branch main \
  --rule-tree-name "Validation Rules" \
  --upload
```

**Upload from a previously saved JSON file:**

```bash
node bin/extract.mjs --upload-file ./output/rules-my-app-main-2026-03-12.json
```

### Delegating from Interactive to Non-Interactive

`cli.mjs` detects `--repo` or `--upload-file` flags and delegates to `bin/extract.mjs` automatically, so either entrypoint accepts CLI arguments.

## Output

JSON files are written to `./output/` (or the path specified by `--output-dir`) with the naming pattern:

```
rules-{repo}-{branch}-{date}.json
```

### Output Structure

```jsonc
{
  "metadata": {
    "tool": "github_extract_rule_tree_table",
    "version": "0.1.0",
    "generatedAt": "2026-03-12T10:00:00.000Z",
    "source": {
      "repo": "owner/my-app",
      "branch": "main",
      "url": "https://github.com/owner/my-app/tree/main"
    },
    "ruleTreeName": "Access Control Rules",
    "totalFiles": 42,
    "filesWithRules": 15,
    "stats": {
      "total": 120,
      "groups": 35,
      "conditions": 85,
      "enabled": 120
    }
  },
  "ruleTree": {
    "name": "Access Control Rules",
    "description": "Auto-extracted conditional rules from owner/my-app (main)",
    "is_active": true,
    "rules": {
      "id": "...",
      "type": "group",
      "name": "Root",
      "logic": "AND",
      "conditions": [
        // File groups → function groups → conditions
      ]
    }
  }
}
```

### Rule Hierarchy

Rules are organized in a three-level hierarchy:

1. **File groups** — one per source file that contains conditionals (color: `#6366F1`)
2. **Function groups** — one per function/method with rule logic (color: `#8B5CF6`)
3. **Rule items** — groups (AND `#3B82F6` / OR `#F59E0B` / NOT `#EF4444`) and leaf conditions

## Examples

### Input: JavaScript

```js
function checkAccess(user, resource) {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }
  if (user.age >= 18 && user.isActive && !user.isBanned) {
    return resource.type === 'public';
  }
  switch (user.clearanceLevel) {
    case 'top_secret':
    case 'secret':
    case 'confidential':
      return true;
  }
}
```

### Output: Rule Tree

```
Root (AND)
└── auth/access.mjs (AND)
    └── checkAccess() (AND)
        ├── if (OR)
        │   ├── user.role equals "admin"
        │   └── user.role equals "superadmin"
        ├── if (AND)
        │   ├── user.age greater_than_or_equal 18
        │   ├── user.isActive equals true
        │   └── NOT: user.isBanned equals true
        └── switch user.clearanceLevel (OR)
            ├── user.clearanceLevel equals "top_secret"
            ├── user.clearanceLevel equals "secret"
            └── user.clearanceLevel equals "confidential"
```

### Input: Python

```python
def validate_request(user, request):
    if user.role == 'admin' and user.is_active:
        return True
    if user.age >= 18 or user.has_parental_consent:
        return True
    match user.tier:
        case 'premium':
            return True
        case 'standard':
            return request.is_free
```

### Output: Rule Tree

```
Root (AND)
└── auth/validate.py (AND)
    └── validate_request() (AND)
        ├── AND group
        │   ├── user.role equals "admin"
        │   └── user.is_active equals true
        ├── OR group
        │   ├── user.age greater_than_or_equal 18
        │   └── user.has_parental_consent equals true
        └── match user.tier (OR)
            ├── user.tier equals "premium"
            └── user.tier equals "standard"
```

## File Filtering

### Default Scanned Extensions

When `--search` is not specified, the tool scans: `.mjs`, `.js`, `.jsx`, `.ts`, `.tsx`, `.py`

### Always Skipped Directories

`node_modules`, `dist`, `build`, `.next`, `.nuxt`, `coverage`, `__tests__`, `__mocks__`, `__snapshots__`, `__fixtures__`, `.storybook`, `.github`, `.vscode`, `.git`, `vendor`, `__pycache__`, `.mypy_cache`, `.pytest_cache`

### Always Skipped File Patterns

`*.test.*`, `*.spec.*`, `*.stories.*`, `*.story.*`, `*.config.js`, `*.config.ts`, `*.d.ts`

## API Integration

The tool uploads to the `rule-tree-table` API at `POST /trees`, which creates a new rule tree with its full nested rule structure in a single request.

Before uploading, the tool:

1. Checks API health (`GET /api/rule-tree-table`)
2. Validates the rule structure (`POST /api/rule-tree-table/rules/validate`)
3. Creates the tree (`POST /api/rule-tree-table/trees`)

## Rate Limits

- **Unauthenticated GitHub API**: ~60 requests/hour
- **Authenticated** (with `--token` or `GITHUB_TOKEN` env): ~5,000 requests/hour

If a rate limit is hit mid-scan, the tool saves whatever rules have been extracted so far and exits gracefully.

## Project Structure

```
github_extract_rule_tree_table/
├── bin/
│   └── extract.mjs           # Non-interactive entrypoint (commander)
├── src/
│   ├── main.mjs              # Two-stage orchestration (extract → upload)
│   ├── github-client.mjs     # GitHub API client with configurable file filters
│   ├── rule-extractor.mjs    # AST-based rule extraction engine
│   ├── api-uploader.mjs      # rule-tree-table API client
│   └── output-writer.mjs     # JSON payload builder and file writer
├── output/                    # Generated JSON files (gitignored)
├── cli.mjs                   # Interactive entrypoint (@clack/prompts)
├── package.json
└── .gitignore
```
