# OpenAPI Spec Splitter

A powerful Python tool that splits large OpenAPI specifications into smaller, manageable files. This tool helps you break down monolithic API specifications by tags or path prefixes while maintaining component integrity and references.

## Features

- **Split by Tags**: Organize your API endpoints based on their tags
- **Split by Path Prefixes**: Group endpoints by their URL path structure
- **Component Resolution**: Automatically includes only the components (schemas, responses, parameters, etc.) used by each split specification
- **Transitive Dependencies**: Resolves nested component references to ensure all required definitions are included
- **Multiple Output Formats**: Support for both YAML and JSON output formats
- **CLI & SDK**: Use as a command-line tool or import as a Python library

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd openapi_spec_splitter

# Install the Python package
pip install ./py
```

## Usage

### Command Line Interface

The tool provides a comprehensive CLI for splitting OpenAPI specifications:

```bash
# Split by tags (default)
python -m openapi_splitter openapi.yaml

# Split by path prefixes
python -m openapi_splitter openapi.yaml -m paths

# Specify custom output directory
python -m openapi_splitter openapi.yaml -o my_output

# Output as JSON files
python -m openapi_splitter openapi.yaml -f json

# Split by 3-level path prefixes
python -m openapi_splitter openapi.yaml -m paths -l 3

# Enable verbose logging
python -m openapi_splitter openapi.yaml -v
```

#### CLI Options

- `input_file`: Path to the input OpenAPI YAML/JSON file (required)
- `-m, --method`: Splitting method - `tags` or `paths` (default: tags)
- `-o, --output`: Output directory for split files (default: split_specs)
- `-l, --levels`: Number of path levels for path-based splitting (default: 2)
- `-f, --format`: Output format - `yaml` or `json` (default: yaml)
- `-v, --verbose`: Enable verbose output
- `--version`: Show version information

### Python SDK

Use the OpenAPI Splitter as a Python library for programmatic access:

```python
from openapi_splitter import OpenAPISplitter

# Initialize the splitter
splitter = OpenAPISplitter(
    input_file="openapi.yaml",
    output_dir="split_specs",
    output_format="yaml"
)

# Split by tags
created_files = splitter.split_by_tags()

# Or split by paths with custom level
created_files = splitter.split_by_paths(levels=3)

# Or use the generic split method
created_files = splitter.split(method="tags")
```

#### Advanced SDK Usage

```python
from openapi_splitter import OpenAPISplitter, ComponentResolver

# Load and process specification manually
splitter = OpenAPISplitter("openapi.yaml")
spec = splitter.load_spec()
base_spec = splitter.create_base_spec()

# Group paths by tags
tag_groups = splitter.group_by_tags()

# Group paths by prefix
path_groups = splitter.group_by_path_prefix(levels=2)

# Create a custom grouped specification
for group_name, paths in tag_groups.items():
    grouped_spec = splitter.create_grouped_spec(group_name, paths)
    splitter.write_spec(grouped_spec, f"{group_name}_api")
```

## How It Works

### Splitting by Tags

When splitting by tags, the tool:
1. Analyzes all endpoints in your OpenAPI specification
2. Groups endpoints based on their assigned tags
3. Creates separate specification files for each tag
4. Includes only the components (schemas, responses, etc.) referenced by the endpoints in each file
5. Endpoints without tags are grouped into an "untagged" specification

### Splitting by Path Prefixes

When splitting by path prefixes, the tool:
1. Examines the URL structure of all endpoints
2. Groups endpoints based on their path prefix (e.g., `/users/*`, `/products/*`)
3. The level parameter controls how many path segments to use (e.g., level 2: `/api/v1/*`)
4. Creates separate specifications for each prefix group

### Component Resolution

The tool intelligently handles OpenAPI components:
- **Direct References**: Includes components directly referenced by endpoints
- **Transitive Dependencies**: Recursively resolves nested component references
- **Minimal Output**: Each split file contains only the components it needs
- **Reference Integrity**: Maintains all `$ref` links correctly

## Output Structure

The tool creates a directory structure like:

```
split_specs/
├── users.yaml         # Endpoints tagged with "users"
├── products.yaml      # Endpoints tagged with "products"
├── orders.yaml        # Endpoints tagged with "orders"
└── untagged.yaml      # Endpoints without tags
```

Or when splitting by paths:

```
split_specs/
├── users.yaml         # Endpoints under /users/*
├── products.yaml      # Endpoints under /products/*
├── api_v1.yaml        # Endpoints under /api/v1/*
└── root.yaml          # Root-level endpoints
```

## Features in Detail

### Component Filtering

The tool includes a sophisticated component resolution system:
- Scans all endpoint definitions for component references
- Follows `$ref` chains to find transitive dependencies
- Supports all OpenAPI component types (schemas, responses, parameters, examples, requestBodies, headers, securitySchemes, callbacks)
- Preserves the minimal set of components needed for each split specification

### Error Handling

The tool provides comprehensive error handling:
- Validates input file existence and format
- Provides clear error messages for parsing issues
- Supports both YAML and JSON input formats with automatic detection
- Graceful handling of malformed specifications

### Logging

- Standard output for normal operations
- Verbose mode (`-v`) for detailed debugging information
- Progress reporting for large specifications
- Clear reporting of created files

## Requirements

- Python 3.6+
- PyYAML
- Standard library modules: json, pathlib, logging, argparse

## License

[Specify your license here]

## Contributing

[Add contribution guidelines if applicable]

## Support

For issues, questions, or suggestions, please [open an issue](link-to-issues) on the project repository.