# OpenAPI Splitter

Split large OpenAPI specifications into smaller, manageable files by tags or path prefixes while maintaining component reference integrity.

## Features

- **Split by Tags**: Group API endpoints by their OpenAPI tags
- **Split by Path Prefixes**: Group endpoints by URL path patterns
- **Smart Component Filtering**: Automatically includes only referenced components
- **Preserves References**: Handles transitive component dependencies
- **Multiple Formats**: Supports both YAML and JSON input/output
- **CLI and SDK**: Use as command-line tool or Python library
- **Type Hints**: Full type annotation support for better IDE integration

## Installation

### From PyPI

```bash
pip install openapi-splitter
```

### From Source

```bash
git clone https://github.com/yourusername/openapi-splitter.git
cd openapi-splitter
pip install -e .
```

### Development Installation

```bash
git clone https://github.com/yourusername/openapi-splitter.git
cd openapi-splitter
pip install -e ".[dev]"
```

## Quick Start

### CLI Usage

```bash
# Split by tags (default)
# Auto-detects output format from input file extension (e.g., .yaml -> .yaml, .json -> .json)
openapi-splitter openapi.yaml

# Split by path prefixes
openapi-splitter openapi.yaml -m paths

# Custom output directory
openapi-splitter openapi.yaml -o my_output

# Explicitly output as JSON (overrides auto-detection)
openapi-splitter openapi.yaml -f json

# Explicitly output as YAML (overrides auto-detection)
openapi-splitter input.json -f yaml

# Split paths by 3 levels
openapi-splitter openapi.yaml -m paths -l 3

# Enable verbose logging
openapi-splitter openapi.yaml -v
```

### SDK Usage

```python
from openapi_splitter import OpenAPISplitter

# Initialize splitter
splitter = OpenAPISplitter(
    input_file="openapi.yaml",
    output_dir="split_specs",
    output_format="yaml"
)

# Split by tags
files = splitter.split(method="tags")
print(f"Created {len(files)} files")

# Split by paths with custom levels
files = splitter.split(method="paths", path_levels=3)

# Or use individual methods
splitter.load_spec()
splitter.create_base_spec()
tag_files = splitter.split_by_tags()
path_files = splitter.split_by_paths(levels=2)
```

## How It Works

### Splitting by Tags

When splitting by tags, the tool:

1. Analyzes all paths in your OpenAPI specification
2. Groups paths by their operation tags
3. Creates separate files for each tag
4. Includes only the components referenced by each group
5. Handles paths without tags by grouping them into an "untagged" file

### Splitting by Path Prefixes

When splitting by path prefixes, the tool:

1. Analyzes URL patterns in your specification
2. Groups paths by their prefix (e.g., `/users/*`, `/products/*`)
3. Creates separate files for each prefix group
4. Maintains component references for each group

### Component Resolution

The tool intelligently handles OpenAPI components:

- Detects all `$ref` references in included paths
- Recursively resolves transitive dependencies
- Includes only components actually used by each split file
- Maintains referential integrity across the specification

## API Reference

### OpenAPISplitter Class

```python
class OpenAPISplitter:
    def __init__(
        self,
        input_file: Union[str, Path],
        output_dir: Union[str, Path] = "split_specs",
        output_format: Optional[str] = None
    )
```

**Parameters:**

- `input_file`: Path to the OpenAPI specification file
- `output_dir`: Directory for output files (default: "split_specs")
- `output_format`: Output format - "yaml" or "json" (default: auto-detect based on input file)

#### Methods

##### `load_spec() -> Dict[str, Any]`

Load the OpenAPI specification from file.

##### `create_base_spec() -> Dict[str, Any]`

Create base specification with common elements.

##### `split(method: str = 'tags', path_levels: int = 2) -> List[Path]`

Main method to split the specification.

##### `split_by_tags() -> List[Path]`

Split the specification by operation tags.

##### `split_by_paths(levels: int = 2) -> List[Path]`

Split the specification by path prefixes.

## Examples

### Example 1: Large E-commerce API

```bash
# Original file: ecommerce-api.yaml (5000+ lines)
openapi-splitter ecommerce-api.yaml -o api-modules

# Creates:
# api-modules/products.yaml     (product endpoints)
# api-modules/orders.yaml       (order endpoints)
# api-modules/users.yaml        (user endpoints)
# api-modules/payments.yaml     (payment endpoints)
```

### Example 2: Versioned API

```bash
# Split by version prefixes
openapi-splitter api.yaml -m paths -l 1

# Creates files for each version:
# split_specs/v1.yaml
# split_specs/v2.yaml
# split_specs/admin.yaml
```

### Example 3: SDK Integration

```python
from openapi_splitter import OpenAPISplitter
from pathlib import Path

def process_api_specs(input_dir: Path):
    """Process all OpenAPI specs in a directory."""

    for spec_file in input_dir.glob("*.yaml"):
        print(f"Processing {spec_file.name}...")

        splitter = OpenAPISplitter(
            input_file=spec_file,
            output_dir=input_dir / "split" / spec_file.stem,
            output_format="yaml"
        )

        try:
            files = splitter.split(method="tags")
            print(f"  Created {len(files)} files")

            for file in files:
                print(f"    - {file.name}")

        except Exception as e:
            print(f"  Error: {e}")

# Usage
process_api_specs(Path("./api-specifications"))
```

## Error Handling

The package uses `OpenAPISplitterError` for all custom exceptions:

```python
from openapi_splitter import OpenAPISplitter, OpenAPISplitterError

try:
    splitter = OpenAPISplitter("api.yaml")
    files = splitter.split()
except OpenAPISplitterError as e:
    print(f"Splitting failed: {e}")
```

## Command Line Options

```
usage: openapi-splitter [-h] [-m {tags,paths}] [-o OUTPUT] [-l LEVELS]
                        [-f {yaml,json}] [-v] [--version]
                        input_file

Split large OpenAPI YAML files into smaller groupings

positional arguments:
  input_file            Path to the input OpenAPI YAML file

optional arguments:
  -h, --help            show this help message and exit
  -m, --method {tags,paths}
                        Splitting method: by tags or path prefixes (default: tags)
  -o, --output OUTPUT   Output directory for split files (default: split_specs)
  -l, --levels LEVELS   Number of path levels for path-based splitting (default: 2)
  -f, --format {yaml,json}
                        Output format: yaml or json (default: auto-detect based on input)
  -v, --verbose         Enable verbose output
  --version             show program's version number and exit
```

## Testing

Run the test suite:

```bash
# Install development dependencies
pip install -e ".[dev]"

# Run tests
python -m pytest tests/

# Run with coverage
python -m pytest tests/ --cov=openapi_splitter

# Run specific test
python -m pytest tests/test_core.py::TestOpenAPISplitter::test_split_by_tags
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the need to manage large OpenAPI specifications
- Built with PyYAML for robust YAML processing
- Thanks to the OpenAPI Initiative for the specification standard

## Support

For issues, questions, or suggestions, please:

- Open an issue on [GitHub](https://github.com/yourusername/openapi-splitter/issues)
- Check existing issues before creating a new one
- Provide clear reproduction steps for bugs
