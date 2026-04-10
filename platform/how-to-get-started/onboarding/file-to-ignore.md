# How to Ignore Folders in the Monorepo

This guide documents all the places where folder exclusions need to be configured when adding directories that should not be processed during build, setup, or development.

## Overview

The monorepo uses multiple tools that scan the filesystem. Each tool has its own ignore mechanism:

| Tool | Config File | Purpose |
|------|-------------|---------|
| NX | `.nxignore` | Project discovery and build orchestration |
| NX path lint | `.bin/lint-nx-project-paths.py` | Validates project.json paths exist |
| pnpm | `pnpm-workspace.yaml` | Package workspace linking |
| TypeScript setup | `.bin/ts-apply-noImplicitAny.sh` | tsconfig.json processing |
| Git | `.gitignore` | Version control |

## 1. NX Ignore (`.nxignore`)

**Location:** `/Users/Shared/autoload/mta-v800/.nxignore`

NX auto-discovers projects by scanning for `project.json` files. Add directories here to prevent NX from:
- Detecting projects in excluded folders
- Running builds/tests on excluded projects
- Validating paths in `project.json` files

**Format:** One directory per line (relative to workspace root)

```
# Ignore spec and stage directories
__SPECS__
__STAGE__
node_modules
dataset
```

**When to use:**
- Reference repositories cloned for analysis (e.g., `dataset/repos/`)
- Archived or backup directories
- Directories containing external `project.json` files

**After editing:** Clear NX cache
```bash
npx nx reset
```

## 2. NX Path Lint Script (`.bin/lint-nx-project-paths.py`)

**Location:** `/Users/Shared/autoload/mta-v800/.bin/lint-nx-project-paths.py`

This custom Python script runs during `make build` and `make dev` to validate that all `cwd` and `sourceRoot` paths in `project.json` files actually exist on disk. This catches mismatches (like hyphens vs underscores in directory names) before they cause cryptic build errors.

**Important:** This script has its own exclusion list, separate from `.nxignore`.

**Format:** Edit the `EXCLUDE_DIRS` set in the script

```python
# Directories to skip when scanning for project.json
EXCLUDE_DIRS = {"node_modules", "__STAGE__", "__SPECS__", ".git", ".venv", "dataset"}
```

**When to use:**
- Directories containing `project.json` files from external projects
- Reference repositories where paths intentionally don't match the local structure
- Any directory already in `.nxignore` should also be added here

**Error message when missing:**
```
ERROR: NX project.json path lint failed.

The following paths in project.json files do not exist on disk:

  package-name (dataset/repos/some-repo/packages/foo/project.json)
    sourceRoot: "packages/foo/src" does not exist
```

## 3. pnpm Workspace (`pnpm-workspace.yaml`)

**Location:** `/Users/Shared/autoload/mta-v800/pnpm-workspace.yaml`

Defines which directories contain npm packages for workspace linking.

**Format:** YAML with glob patterns

```yaml
packages:
  - 'packages_mjs/*'
  - 'fastify_apps/*/backend'
  # Exclude with negation pattern
  - '!dataset/**'
```

**When to use:**
- Add negation patterns (`!folder/**`) if a broad glob accidentally matches unwanted directories
- Usually not needed if patterns are specific enough

**After editing:**
```bash
pnpm install
```

## 4. TypeScript Setup Script (`.bin/ts-apply-noImplicitAny.sh`)

**Location:** `/Users/Shared/autoload/mta-v800/.bin/ts-apply-noImplicitAny.sh`

Scans for `tsconfig.json` files during `make setup` to apply consistent TypeScript settings.

**Format:** Add `-not -path` arguments to the `find` command

```bash
TSCONFIG_FILES=$(find "$SEARCH_DIR" -name "tsconfig.json" \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/.nx/*" \
    -not -path "*/__SPECS__/*" \
    -not -path "*/__STAGE__/*" \
    -not -path "*/__REVIEW__/*" \
    -not -path "*/__BACKUP__/*" \
    -not -path "*/dataset/*" \
    2>/dev/null | sort)
```

**When to use:**
- Directories containing third-party `tsconfig.json` files
- Reference codebases that shouldn't be modified

## 5. Git Ignore (`.gitignore`)

**Location:** `/Users/Shared/autoload/mta-v800/.gitignore`

Standard Git ignore for version control.

```
# Build outputs
dist/
node_modules/

# Dataset repos (too large for git)
dataset/repos/
```

## Example: Adding a New Ignored Directory

When adding a directory like `dataset/` that contains reference code:

### Step 1: Add to `.nxignore`
```bash
echo "dataset" >> .nxignore
```

### Step 2: Add to `.bin/lint-nx-project-paths.py`
Edit the `EXCLUDE_DIRS` set to include the directory:
```python
EXCLUDE_DIRS = {"node_modules", "__STAGE__", "__SPECS__", ".git", ".venv", "dataset"}
```

### Step 3: Update `.bin/ts-apply-noImplicitAny.sh`
Add this line to the `find` command:
```bash
-not -path "*/dataset/*" \
```

### Step 4: Add to `.gitignore` (if not tracked)
```bash
echo "dataset/" >> .gitignore
```

### Step 5: Clear caches and verify
```bash
npx nx reset
make dev
```

## Common Ignored Directories

| Directory | Reason |
|-----------|--------|
| `__SPECS__` | Specification documents, not code |
| `__STAGE__` | Staged/archived code versions |
| `__REVIEW__` | Code review snapshots |
| `__BACKUP__` | Backup copies |
| `dataset/` | Reference repositories for LLM analysis |
| `node_modules/` | Dependencies (managed by pnpm) |
| `dist/` | Build outputs |
| `.nx/` | NX cache |

## Troubleshooting

### NX complains about missing paths in `project.json`
```
ERROR: NX project.json path lint failed.
The following paths in project.json files do not exist on disk:
  package-name (path/to/project.json)
    sourceRoot: "path/to/src" does not exist
```

**Fix:** This error comes from the custom lint script, not NX itself. You need to update **both**:
1. Add the parent directory to `.nxignore`
2. Add the directory to `EXCLUDE_DIRS` in `.bin/lint-nx-project-paths.py`

Then run `npx nx reset` to clear the NX cache.

### `make setup` processes files in excluded directory
Check `.bin/ts-apply-noImplicitAny.sh` has the `-not -path` exclusion for that directory.

### pnpm installs packages from wrong directory
Check `pnpm-workspace.yaml` patterns aren't too broad. Use negation patterns if needed.
