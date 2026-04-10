# GitHub Component Extract

Extract JSX component definitions from a GitHub repo and upload to the `ui-component-metadata` API.

## Usage

```bash
# Non-interactive: extract only
node bin/extract.mjs --repo mui/material-ui --branch master --prepend "MUI latest"

# Non-interactive: extract + upload
node bin/extract.mjs --repo mui/material-ui --branch v6.x --prepend "MUI v6.x" --upload

# Upload from previously saved JSON
node bin/extract.mjs --upload-file ./output/components-material-ui-v6_x-2026-03-12.json

# Interactive mode
node cli.mjs
```
