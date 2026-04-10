# pyproject-poetry-dep-copy

CLI tool that copies the `[tool.poetry.dependencies]` section from one `pyproject.toml` (source) to another (target).

## Install

```bash
pip install -e platform/tools/pyproject_poetry_dep_copy
```

## Usage

```bash
pyproject-poetry-dep-copy <source> <target> [--dry-run]
```

| Argument    | Description                                      |
|-------------|--------------------------------------------------|
| `source`    | Source `pyproject.toml` (A) to read from          |
| `target`    | Target `pyproject.toml` (B) to write to           |
| `--dry-run` | Preview the result without modifying target file  |

### Run without installing

```bash
python platform/tools/pyproject_poetry_dep_copy/src/pyproject_poetry_dep_copy/cli.py <source> <target> [--dry-run]
```

## Examples

### Preview changes (dry run)

```bash
pyproject-poetry-dep-copy pyproject.toml fastapi_server/pyproject.toml --dry-run
```

### Copy dependencies

```bash
pyproject-poetry-dep-copy pyproject.toml fastapi_server/pyproject.toml
```

Output:

```
Copied 85 dependencies from pyproject.toml to pyproject.toml
```

## Behavior

- Replaces the entire `[tool.poetry.dependencies]` section in the target with the source's section
- If the target has no `[tool.poetry.dependencies]` section, one is inserted before `[build-system]` (or appended at EOF)
- Preserves all other sections in the target file
- Preserves original formatting (comments, blank lines, inline tables) from the source
- Exits with code `1` if either file is missing or the source has no `[tool.poetry.dependencies]` section

## Related

- `platform/.bin/pyproject-sync-pkg-repo.py` — scans local packages and updates both root and `fastapi_server` pyproject.toml files with path dependencies
- `platform/.bin/pyproject-lint-dep-versions.py` — validates sub-package dependency versions against root
