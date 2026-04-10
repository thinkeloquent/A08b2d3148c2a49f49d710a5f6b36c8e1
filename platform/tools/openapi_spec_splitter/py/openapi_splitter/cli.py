"""
Command-line interface for OpenAPI Splitter.
"""

import argparse
import sys
import os
import logging
from pathlib import Path
from .core import OpenAPISplitter, OpenAPISplitterError


def setup_logging(verbose: bool = False) -> None:
    """
    Configure logging for the CLI.
    
    Args:
        verbose: Enable verbose logging
    """
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(message)s' if not verbose else '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )


def create_parser() -> argparse.ArgumentParser:
    """
    Create and configure the argument parser.
    
    Returns:
        Configured ArgumentParser instance
    """
    parser = argparse.ArgumentParser(
        description='Split large OpenAPI YAML files into smaller groupings',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s openapi.yaml                    # Split by tags (default)
  %(prog)s openapi.yaml -m paths          # Split by path prefixes
  %(prog)s openapi.yaml -o my_output      # Custom output directory
  %(prog)s openapi.yaml -f json           # Output as JSON files
  %(prog)s openapi.yaml -m paths -l 3     # Split by 3-level path prefixes
        """
    )
    
    parser.add_argument(
        'input_file',
        help='Path to the input OpenAPI YAML file'
    )
    
    parser.add_argument(
        '-m', '--method',
        choices=['tags', 'paths'],
        default='tags',
        help='Splitting method: by tags or path prefixes (default: tags)'
    )
    
    parser.add_argument(
        '-o', '--output',
        default='split_specs',
        help='Output directory for split files (default: split_specs)'
    )
    
    parser.add_argument(
        '-l', '--levels',
        type=int,
        default=2,
        help='Number of path levels for path-based splitting (default: 2)'
    )
    
    parser.add_argument(
        '-f', '--format',
        choices=['yaml', 'json'],
        default=None,
        help='Output format: yaml or json (default: auto-detect based on input)'
    )
    
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Enable verbose output'
    )
    
    parser.add_argument(
        '--version',
        action='version',
        version='%(prog)s 1.0.0'
    )
    
    return parser


def main():
    """Main entry point for CLI."""
    parser = create_parser()
    args = parser.parse_args()
    
    # Set up logging
    setup_logging(args.verbose)
    logger = logging.getLogger(__name__)
    
    # Validate input file exists
    if not os.path.exists(args.input_file):
        print(f"Error: Input file '{args.input_file}' not found", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Initialize splitter
        splitter = OpenAPISplitter(args.input_file, args.output, args.format)
        
        # Perform the split
        print(f"Splitting {args.input_file} using method: {args.method} (format: {args.format})")
        created_files = splitter.split(args.method, args.levels)
        
        # Report results
        print(f"Split complete. Output files in: {args.output}")
        for filepath in created_files:
            print(f"Created: {filepath}")
        
    except OpenAPISplitterError as e:
        logger.error(f"Error: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        logger.info("Operation cancelled by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()