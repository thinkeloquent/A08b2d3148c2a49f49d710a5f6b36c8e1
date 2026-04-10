import argparse
import json
import sys
from dataclasses import asdict
from extract_code.core import run_extraction

def main():
    parser = argparse.ArgumentParser(description="Extract code blocks from markdown files.")
    parser.add_argument("directory", help="Directory to scan recursively")
    parser.add_argument("--output", "-o", required=True, help="Filepath to save JSON output")
    parser.add_argument("--extensions", "-e", nargs="+", default=[".md", ".mdx"], help="File extensions to search (default: .md .mdx)")
    parser.add_argument("--ignore", "-i", nargs="+", default=[".git", "node_modules", "__pycache__", ".venv"], help="Directories to ignore")
    
    args = parser.parse_args()
    
    print(f"Scanning {args.directory}...")
    
    try:
        result = run_extraction(
            root_dir=args.directory,
            output_file=args.output,
            extensions=args.extensions,
            ignore_dirs=args.ignore
        )
        
        print(f"Scanned {result.scanned_files} files.")
        print(f"Found {result.code_blocks_found} code blocks.")
        
        # Convert to dictionary using dataclasses.asdict
        output_data = asdict(result)
        
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2)
            
        print(f"Results saved to {args.output}")
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
