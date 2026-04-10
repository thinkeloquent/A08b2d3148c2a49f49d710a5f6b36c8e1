import os
import re
from typing import List, Generator, Tuple
from extract_code.models import CodeBlock, ExtractionResult

def scan_directory(
    root_dir: str, 
    extensions: List[str] = ['.md', '.mdx'], 
    ignore_dirs: List[str] = ['.git', 'node_modules', '__pycache__']
) -> Generator[str, None, None]:
    """Recursively scan directory for matching files."""
    for root, dirs, files in os.walk(root_dir):
        # Filter explicitly ignored directories
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                yield os.path.join(root, file)

def extract_code_blocks_from_lines(lines: List[str], filename: str) -> List[CodeBlock]:
    """Parse lines to extract fenced code blocks."""
    blocks = []
    in_block = False
    start_line = 0
    language = None
    code_content = []
    
    # Regex for fence: start of line, optional whitespace, 3 backticks, optional language, optional attributes
    fence_pattern = re.compile(r'^(\s*)```(\w*)(.*)$')
    
    for i, line in enumerate(lines):
        line_num = i + 1
        match = fence_pattern.match(line)
        
        if match:
            if in_block:
                # Closing fence
                # We assume closing fence has same indentation or minimal care, strictly just ``` is often enough
                # But typically it's just ```
                in_block = False
                end_line = line_num
                
                # Context: look back from start_line - 1
                context = None
                if start_line > 1:
                    # simplistic context: previous non-empty line
                    for j in range(start_line - 2, -1, -1):
                        prev = lines[j].strip()
                        if prev and not prev.startswith('```'):
                            context = prev
                            break
                            
                blocks.append(CodeBlock(
                    file=filename,
                    start_line=start_line,
                    end_line=end_line,
                    code='\n'.join(code_content),
                    language=language or None,
                    context=context
                ))
            else:
                # Opening fence
                in_block = True
                start_line = line_num
                code_content = []
                language = match.group(2).strip()
                # We ignore match.group(3) which might be extra attributes like {fileName=...}
        elif in_block:
            code_content.append(line)
            
    return blocks

def process_file(filepath: str) -> List[CodeBlock]:
    """Read file and extract code blocks."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.read().splitlines()
        return extract_code_blocks_from_lines(lines, filepath)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return []

def run_extraction(
    root_dir: str,
    output_file: str,
    extensions: List[str],
    ignore_dirs: List[str]
) -> ExtractionResult:
    """Main execution flow."""
    all_blocks = []
    scanned_count = 0
    
    # Resolve absolute path for root
    abs_root = os.path.abspath(root_dir)
    
    for filepath in scan_directory(abs_root, extensions, ignore_dirs):
        scanned_count += 1
        blocks = process_file(filepath)
        all_blocks.extend(blocks)
        
    result = ExtractionResult(
        scanned_files=scanned_count,
        code_blocks_found=len(all_blocks),
        blocks=all_blocks
    )
    
    return result
