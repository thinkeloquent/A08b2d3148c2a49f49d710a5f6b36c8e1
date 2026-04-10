from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class CodeBlock:
    file: str
    start_line: int
    end_line: int
    code: str
    language: Optional[str] = None
    context: Optional[str] = None

@dataclass
class ExtractionResult:
    scanned_files: int
    code_blocks_found: int
    blocks: List[CodeBlock] = field(default_factory=list)
