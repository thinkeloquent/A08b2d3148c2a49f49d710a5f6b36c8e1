"""Code/text separation for RAG search results.

Provides three-tier separation:
1. File extension check (known code files)
2. Markdown fenced code block extraction
3. Regex heuristic line-by-line classification
"""

import os
import re

import markdown
from html import unescape as _html_unescape


CODE_FILE_EXTENSIONS = frozenset({
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".css", ".less", ".scss", ".sass",
    ".json", ".yaml", ".yml",
    ".sh", ".bash", ".zsh",
    ".py", ".rb", ".java", ".go", ".rs", ".c", ".cpp", ".h", ".hpp",
    ".vue", ".svelte", ".astro",
})

_HEURISTIC_CODE_RE = re.compile(
    r"^("
    r"import\s+.+\s+from\s+['\"]"
    r"|export\s+(?:default\s+)?(?:function|const|class|interface|type)\b"
    r"|(?:const|let|var)\s+\w+\s*="
    r"|function\s+\w+\s*\("
    r"|return\s*[\(\<]"
    r"|<[A-Z][a-zA-Z0-9]*"
    r"|</[A-Z][a-zA-Z0-9]*"
    r"|(?:interface|type)\s+[A-Z]\w*"
    r"|[}\])];\s*$"
    r"|[}\])]\s*$"
    r"|\w+\.\w+\("
    r"|@\w+"
    r"|(?:props|state|this)\."
    r")",
    re.MULTILINE,
)

_PRE_CODE_RE = re.compile(r"<pre><code[^>]*>([\s\S]*?)</code></pre>")


def _heuristic_split_lines(text: str) -> dict:
    lines = text.split("\n")
    code_parts: list[str] = []
    text_parts: list[str] = []
    cur_code: list[str] = []
    cur_text: list[str] = []
    in_code = False

    def flush_code():
        nonlocal cur_code
        if cur_code:
            while cur_code and not cur_code[-1].strip():
                cur_code.pop()
            if cur_code:
                code_parts.append("\n".join(cur_code))
            cur_code = []

    def flush_text():
        nonlocal cur_text
        if cur_text:
            text_parts.append("\n".join(cur_text))
            cur_text = []

    for line in lines:
        stripped = line.strip()
        if _HEURISTIC_CODE_RE.match(stripped):
            if not in_code:
                flush_text()
                in_code = True
            cur_code.append(line.rstrip())
        elif in_code and stripped == "":
            cur_code.append("")
        elif in_code:
            flush_code()
            in_code = False
            cur_text.append(line.rstrip())
        else:
            cur_text.append(line.rstrip())

    if in_code:
        flush_code()
    flush_text()
    return {"code_parts": code_parts, "text_parts": text_parts}


def separate_code_text_regex(content: str, file_name: str = "") -> dict:
    """3-tier code/text separation: file extension, markdown, regex heuristics."""
    content = content.strip()
    if not content:
        return {"code_parts": [], "text_parts": []}

    if file_name:
        _, ext = os.path.splitext(file_name)
        if ext.lower() in CODE_FILE_EXTENSIONS:
            return {"code_parts": [content], "text_parts": []}

    md = markdown.Markdown(extensions=["fenced_code"])
    html_out = md.convert(content)

    code_parts: list[str] = []
    text_parts: list[str] = []

    segments = re.split(r"(<pre><code[^>]*>[\s\S]*?</code></pre>)", html_out)

    for seg in segments:
        seg = seg.strip()
        if not seg:
            continue
        m = _PRE_CODE_RE.match(seg)
        if m:
            code = _html_unescape(m.group(1)).strip()
            if code:
                code_parts.append(code)
        else:
            plain = re.sub(
                r"</(?:p|div|h[1-6]|li|blockquote|ul|ol|tr|td|th)>", "\n", seg
            )
            plain = re.sub(r"<(?:br|hr)\s*/?>", "\n", plain)
            plain = re.sub(r"<[^>]+>", "", plain)
            plain = _html_unescape(plain).strip()
            if not plain:
                continue
            sub = _heuristic_split_lines(plain)
            code_parts.extend(sub["code_parts"])
            text_parts.extend(sub["text_parts"])

    return {"code_parts": code_parts, "text_parts": text_parts}
