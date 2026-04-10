# Extract Code From Markdown

A CLI tool to scan a directory for Markdown files (`.md`, `.mdx`) and strip out code fences explicitly into a JSON file collection.

## Installation

This tool is a standalone Python package.

```bash
cd py
pip install -e .
```

## Usage

```bash
extract-code [DIRECTORY] -o [OUTPUT_JSON]
```

### Arguments

- `directory`: The root directory to scan recursively.
- `-o, --output`: Path to save the resulting JSON file.
- `-e, --extensions`: File extensions to include (default: `.md`, `.mdx`).
- `-i, --ignore`: Directories to ignore (default: `.git`, `node_modules`, `__pycache__`, `.venv`).

### Example

```bash
extract-code ../../dataset/repos/ant-design -o ant-design.json
extract-code ../../dataset/repos/blueprint -o blueprint.json
extract-code ../../dataset/repos/chakra-ui -o chakra-ui.json
extract-code ../../dataset/repos/fluentui -o fluentui.json
extract-code ../../dataset/repos/mantine -o mantine.json
extract-code ../../dataset/repos/material-ui -o material-ui.json
extract-code ../../dataset/repos/primitives -o primitives.json
extract-code ../../dataset/repos/react-bootstrap -o react-bootstrap.json
extract-code ../../dataset/repos/Semantic-UI-React -o Semantic-UI-React.json
extract-code ../../dataset/repos/ui -o ui.json
```

## Output Format

The output is a JSON object:

```json
{
  "scanned_files": 10,
  "code_blocks_found": 5,
  "blocks": [
    {
      "file": "/abs/path/to/file.md",
      "start_line": 10,
      "end_line": 15,
      "code": "print('hello')",
      "language": "python",
      "context": "Here is an example:"
    }
  ]
}
```
