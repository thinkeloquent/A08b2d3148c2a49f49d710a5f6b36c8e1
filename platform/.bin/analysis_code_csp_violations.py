#!/usr/bin/env python3
"""
CSP Violation Static Analysis — identifies source-code patterns that would
trigger Content-Security-Policy violations.

Usage:
    python .bin/analysis_code_csp_violations.py
    python .bin/analysis_code_csp_violations.py --category A --min-severity HIGH
    python .bin/analysis_code_csp_violations.py --format json -o logs/csp-violations.json

Categories:
    A  unsafe-eval / eval / new Function
    B  Inline scripts (inline <script>, dangerouslySetInnerHTML, v-html, …)
    C  Inline styles (style attrs, <style> tags, CSS-in-JS)
    D  Third-party scripts (GTM, analytics, CDN deps)
    E  External endpoints (fetch URLs, fonts, WebSockets, workers)
    F  Sourcemap config (vite/webpack devtool settings)

Exit codes:
    0  No findings
    1  CRITICAL or HIGH findings present
    2  Only MEDIUM or lower findings
"""
import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, NamedTuple, Optional, Tuple


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

class Finding(NamedTuple):
    """A single CSP-violation finding."""
    file: str
    line_number: int
    line_content: str
    category: str          # A-F
    pattern_name: str
    severity: str          # CRITICAL, HIGH, MEDIUM, LOW, INFO
    environment: str       # PROD, DEV, TUTORIAL, UNKNOWN
    app_context: str       # app/route name or empty
    remediation: str
    is_false_positive: bool = False
    fp_reason: str = ""


# ---------------------------------------------------------------------------
# Known false positives
# ---------------------------------------------------------------------------
# Each entry: (file_substring, pattern_name | None, reason)
# file_substring: matched against the relative path (substring match)
# pattern_name:   if not None, must also match the detected pattern name
#                 if None, any pattern match on the file counts

KNOWN_FALSE_POSITIVES: List[Tuple[str, Optional[str], str]] = [
    # Scanner's own regex pattern definitions contain eval/Function/style strings
    (".bin/analysis_code_csp_violations.py", "eval_call",
     "Scanner regex pattern definition, not an actual eval() call"),
    (".bin/analysis_code_csp_violations.py", "new_function",
     "Scanner regex pattern definition, not an actual new Function() call"),
    (".bin/analysis_code_csp_violations.py", "function_constructor",
     "Scanner regex pattern definition, not an actual Function() call"),
    (".bin/analysis_code_csp_violations.py", "style_tag",
     "Scanner regex or docstring contains '<style' literal, not an actual style tag"),

    # Test fixtures with HTML string literals used for testing path-rewriting
    ("static_app_loader/py/__tests__/", "style_tag",
     "Test fixture HTML string, not an actual inline style"),
    ("static_app_loader/mjs/__tests__/", "style_tag",
     "Test fixture HTML string, not an actual inline style"),

    # RAG integration test templates — standalone test apps, not production code
    ("test/integration/RAG001/", "style_tag",
     "RAG integration test template, not production code"),

    # JSDoc / docstring example URLs — not runtime fetch calls
    ("polyglot/confluence_api/mjs/src/adapters/UndiciFetchAdapter.mjs", "external_fetch_url",
     "JSDoc example URL, not a runtime fetch call"),
    ("polyglot/confluence_api/mjs/src/utils/createTimeoutSignal.mjs", "external_fetch_url",
     "JSDoc example URL, not a runtime fetch call"),
    ("polyglot/confluence_api/mjs/src/utils/parseResponseData.mjs", "external_fetch_url",
     "JSDoc example URL, not a runtime fetch call"),
    ("polyglot/fetch_auth_encoding/mjs/examples/", "external_fetch_url",
     "Example documentation URL, not a runtime fetch call"),

    # Dev tooling HTML report writer — generates offline reports, not served to browsers
    ("tools/analysis_github_developer_insights/src/reporting/writers/html-writer.mjs", "style_tag",
     "Dev tool HTML report generator, not a browser-served application"),

    # Dev test harness inline script — only used in local test page
    ("fastify_apps/form_builder/frontend/public/test/", "inline_script_tag",
     "Local test harness HTML, not served in production"),
]


def _check_false_positive(rel_path: str, pattern_name: str) -> Tuple[bool, str]:
    """Check if a finding is a known false positive.

    Returns (is_fp, reason).
    """
    for file_substr, fp_pattern, reason in KNOWN_FALSE_POSITIVES:
        if file_substr not in rel_path:
            continue
        if fp_pattern is not None and fp_pattern != pattern_name:
            continue
        return True, reason
    return False, ""


# ---------------------------------------------------------------------------
# Severity helpers
# ---------------------------------------------------------------------------

SEVERITY_ORDER = {"CRITICAL": 5, "HIGH": 4, "MEDIUM": 3, "LOW": 2, "INFO": 1}

_DOWNGRADE = {
    "CRITICAL": "HIGH",
    "HIGH": "MEDIUM",
    "MEDIUM": "LOW",
    "LOW": "INFO",
    "INFO": "INFO",
}


def downgrade_severity(severity: str) -> str:
    return _DOWNGRADE.get(severity, severity)


# ---------------------------------------------------------------------------
# Excluded dirs / scannable extensions
# ---------------------------------------------------------------------------

EXCLUDE_DIRS = {
    ".git", ".venv", "node_modules", "__pycache__",
    "__STAGE__", "__SPECS__", "__REVIEW__", "__BACKUP__",
    "logs", "playwright", "dist", "build", "coverage",
    ".next", ".cache", "data/repos", "dataset/repos",
}

# Split multi-segment excludes for part-based matching
_EXCLUDE_SEGMENTS = set()
for d in EXCLUDE_DIRS:
    if "/" in d:
        _EXCLUDE_SEGMENTS.add(tuple(d.split("/")))
    else:
        _EXCLUDE_SEGMENTS.add((d,))

ALL_EXTENSIONS = {
    ".py", ".mjs", ".js", ".ts", ".tsx", ".jsx",
    ".html", ".htm", ".ejs", ".hbs", ".vue", ".svelte",
}

_CODE_EXTENSIONS = {".py", ".mjs", ".js", ".ts", ".tsx", ".jsx"}
_TEMPLATE_EXTENSIONS = {".html", ".htm", ".ejs", ".hbs", ".jsx", ".tsx", ".vue", ".svelte"}
_HTML_ONLY = {".html", ".htm", ".ejs", ".hbs"}
_CONFIG_GLOB_PATTERNS = {"vite.config", "webpack.config"}


# ---------------------------------------------------------------------------
# Pattern definitions per category
# ---------------------------------------------------------------------------

# Each entry: (pattern_name, regex_string, severity, remediation, allowed_extensions | None)
# None for allowed_extensions means use the category default.

CATEGORY_A_PATTERNS: List[Tuple[str, str, str, str, Optional[set]]] = [
    ("eval_call",           r"\beval\s*\(",                          "CRITICAL", "Replace eval() with a safe parser or structured dispatch",       None),
    ("new_function",        r"\bnew\s+Function\s*\(",                "CRITICAL", "Replace new Function() with a static function reference",        None),
    ("function_constructor", r"(?<!\w)Function\s*\(\s*['\"]",        "CRITICAL", "Replace Function() constructor with a static function reference", None),
    ("settimeout_string",   r"setTimeout\s*\(\s*['\"]",             "HIGH",     "Pass a function reference to setTimeout instead of a string",     None),
    ("setinterval_string",  r"setInterval\s*\(\s*['\"]",            "HIGH",     "Pass a function reference to setInterval instead of a string",    None),
]

CATEGORY_B_PATTERNS: List[Tuple[str, str, str, str, Optional[set]]] = [
    ("inline_script_tag",          r"<script\b(?![^>]*\bsrc\s*=)[^>]*>",         "HIGH",   "Move inline script to an external .js file",                      None),
    ("external_script_tag",        r"<script\b[^>]*\bsrc\s*=\s*['\"]https?://",  "MEDIUM", "Host the script locally or add its hash/nonce to script-src",     None),
    ("dangerously_set_inner_html", r"dangerouslySetInnerHTML",                    "HIGH",   "Use a sanitization library (DOMPurify) or render safe components", None),
    ("v_html",                     r"\bv-html\b",                                 "HIGH",   "Use v-text or sanitize content before rendering",                 None),
    ("svelte_html",                r"\{@html\b",                                  "HIGH",   "Sanitize content before using {@html}",                           None),
    ("inner_html_assignment",      r"\.innerHTML\s*=",                            "HIGH",   "Use textContent or a DOM API instead of innerHTML",               None),
]

CATEGORY_C_PATTERNS: List[Tuple[str, str, str, str, Optional[set]]] = [
    ("html_style_attr",   r"""\bstyle\s*=\s*"[^"]*\"""",     "MEDIUM", "Move inline styles to a CSS class",                          _HTML_ONLY),
    ("style_tag",         r"<style\b",                        "MEDIUM", "Use external CSS files or CSS modules",                      None),
    ("styled_components", r"styled\.\w+`|styled\(",           "LOW",    "Audit styled-components CSP compatibility (nonce injection)", None),
    ("emotion_import",    r"from\s+['\"]@emotion/",           "LOW",    "Audit Emotion CSP compatibility (nonce injection)",           None),
    ("make_styles",       r"\bmakeStyles\s*\(",               "LOW",    "Audit makeStyles CSP compatibility",                         None),
    ("create_styles",     r"\bcreateStyles\s*\(",             "LOW",    "Audit createStyles CSP compatibility",                       None),
]

CATEGORY_D_PATTERNS: List[Tuple[str, str, str, str, Optional[set]]] = [
    ("google_tag_manager", r"googletagmanager\.com|gtag\s*\(|ga\s*\(",                           "HIGH",   "Replace GTM with server-side analytics or add nonce",             None),
    ("analytics_tracker",  r"google-analytics\.com|segment\.com|hotjar\.com|facebook\.net",      "MEDIUM", "Allowlist the analytics domain in connect-src or replace",        None),
    ("cdn_dependency",     r"cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com",              "MEDIUM", "Self-host the dependency or add its hash to script-src",          None),
]

CATEGORY_E_PATTERNS: List[Tuple[str, str, str, str, Optional[set]]] = [
    ("external_fetch_url", r"(?:fetch|axios|new\s+URL)\s*\(\s*['\"]https?://(?!localhost|127\.0\.0\.1)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", "LOW", "Add the domain to connect-src", None),
    ("external_font_url",  r"https?://fonts\.(?:googleapis|gstatic)\.com",                                                           "LOW", "Add Google Fonts domains to font-src and style-src", None),
    ("websocket_url",      r"wss?://[a-zA-Z0-9.-]+",                                                                                 "LOW", "Add the WebSocket domain to connect-src", None),
    ("worker_constructor", r"new\s+(?:Worker|SharedWorker)\s*\(",                                                                     "LOW", "Add 'self' or blob: to worker-src", None),
]

CATEGORY_F_PATTERNS: List[Tuple[str, str, str, str, Optional[set]]] = [
    ("sourcemap_enabled", r"sourcemap\s*:\s*true",                             "MEDIUM", "Disable sourcemaps in production builds",           None),
    ("devtool_eval",      r"devtool\s*:\s*['\"](?:eval|cheap-eval)",           "HIGH",   "Use a non-eval devtool setting (e.g. source-map)", None),
]

CATEGORIES = {
    "A": ("unsafe-eval / eval / new Function", CATEGORY_A_PATTERNS, _CODE_EXTENSIONS),
    "B": ("Inline scripts", CATEGORY_B_PATTERNS, _TEMPLATE_EXTENSIONS),
    "C": ("Inline styles", CATEGORY_C_PATTERNS, ALL_EXTENSIONS),
    "D": ("Third-party scripts", CATEGORY_D_PATTERNS, _HTML_ONLY),
    "E": ("External endpoints", CATEGORY_E_PATTERNS, ALL_EXTENSIONS),
    "F": ("Sourcemap config", CATEGORY_F_PATTERNS, ALL_EXTENSIONS),
}

CATEGORY_LABELS = {
    "A": "unsafe-eval / eval / new Function",
    "B": "Inline scripts",
    "C": "Inline styles",
    "D": "Third-party scripts",
    "E": "External endpoints",
    "F": "Sourcemap config",
}


# ---------------------------------------------------------------------------
# Environment + route-impact detection
# ---------------------------------------------------------------------------

def detect_environment(rel_path: str) -> str:
    parts = rel_path.split("/")
    name = parts[-1] if parts else ""

    # Tutorial content
    if "how-to-get-started" in parts:
        return "TUTORIAL"

    # Test files / dirs
    if "tests" in parts or "test" in parts:
        return "DEV"
    for suffix in (".test.", ".spec."):
        if suffix in name:
            return "DEV"
    if name == "conftest.py":
        return "DEV"

    # Scripts / tooling
    if ".bin" in parts or "scripts" in parts:
        return "DEV"

    # Production app code
    prod_prefixes = ("fastify_apps", "fastapi_apps", "frontend_apps",
                     "fastify_server", "fastapi_server", "polyglot", "packages_mjs", "packages_py")
    for prefix in prod_prefixes:
        if prefix in parts:
            return "PROD"

    return "UNKNOWN"


def detect_app_context(rel_path: str) -> str:
    parts = rel_path.split("/")

    # fastify_apps/<name>/... or fastapi_apps/<name>/...
    for prefix in ("fastify_apps", "fastapi_apps", "frontend_apps"):
        if prefix in parts:
            idx = parts.index(prefix)
            if idx + 1 < len(parts):
                return parts[idx + 1]

    # *_server/routes/<route>.route.*
    for seg in parts:
        if seg.endswith("_server"):
            if "routes" in parts:
                route_file = parts[-1]
                if ".route." in route_file:
                    return route_file.split(".route.")[0]

    # polyglot/<name>/...
    if "polyglot" in parts:
        idx = parts.index("polyglot")
        if idx + 1 < len(parts):
            return f"{parts[idx + 1]} (shared lib)"

    # packages_*/<name>/...
    for seg in parts:
        if seg.startswith("packages_"):
            idx = parts.index(seg)
            if idx + 1 < len(parts):
                return f"{parts[idx + 1]} (shared pkg)"

    return ""


# ---------------------------------------------------------------------------
# File filtering
# ---------------------------------------------------------------------------

def _is_excluded(path: Path, scan_root: Path) -> bool:
    try:
        rel = path.relative_to(scan_root)
    except ValueError:
        return True
    parts = rel.parts
    for exc in _EXCLUDE_SEGMENTS:
        exc_len = len(exc)
        for i in range(len(parts) - exc_len + 1):
            if parts[i:i + exc_len] == exc:
                return True
    return False


def _is_config_file(path: Path) -> bool:
    stem = path.stem
    for pattern in _CONFIG_GLOB_PATTERNS:
        if stem.startswith(pattern.split(".")[0]) and pattern.split(".")[1] in stem:
            return True
    # More straightforward check
    name = path.name
    return name.startswith("vite.config") or name.startswith("webpack.config")


def should_scan(path: Path, scan_root: Path) -> bool:
    if not path.is_file():
        return False
    if _is_excluded(path, scan_root):
        return False
    if path.suffix.lower() in ALL_EXTENSIONS:
        return True
    if _is_config_file(path):
        return True
    return False


# ---------------------------------------------------------------------------
# Core scanner
# ---------------------------------------------------------------------------

def scan_file(
    file_path: Path,
    scan_root: Path,
    selected_categories: List[str],
    min_severity_val: int,
    verbose: bool = False,
) -> List[Finding]:
    findings: List[Finding] = []
    ext = file_path.suffix.lower()

    try:
        rel_path = str(file_path.relative_to(scan_root))
    except ValueError:
        rel_path = str(file_path)

    env = detect_environment(rel_path)
    app_ctx = detect_app_context(rel_path)

    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return findings

    lines = content.split("\n")

    for cat_key in selected_categories:
        cat_label, patterns, default_exts = CATEGORIES[cat_key]

        for pattern_name, regex_str, base_severity, remediation, allowed_exts in patterns:
            exts_to_check = allowed_exts if allowed_exts is not None else default_exts

            # Category F: only config files
            if cat_key == "F":
                if not _is_config_file(file_path):
                    continue
            elif ext not in exts_to_check:
                continue

            compiled = re.compile(regex_str)

            for line_num, line in enumerate(lines, start=1):
                stripped = line.strip()
                # Skip comment lines
                if stripped.startswith("#") or stripped.startswith("//"):
                    continue

                if compiled.search(line):
                    severity = base_severity
                    # Downgrade severity for non-prod environments
                    if env in ("DEV", "TUTORIAL"):
                        severity = downgrade_severity(severity)

                    if SEVERITY_ORDER.get(severity, 0) < min_severity_val:
                        continue

                    is_fp, fp_reason = _check_false_positive(rel_path, pattern_name)

                    findings.append(Finding(
                        file=rel_path,
                        line_number=line_num,
                        line_content=stripped[:200],
                        category=cat_key,
                        pattern_name=pattern_name,
                        severity=severity,
                        environment=env,
                        app_context=app_ctx,
                        remediation=remediation,
                        is_false_positive=is_fp,
                        fp_reason=fp_reason,
                    ))

    return findings


def scan_tree(
    scan_root: Path,
    selected_categories: List[str],
    min_severity_val: int,
    verbose: bool = False,
) -> Tuple[List[Finding], int]:
    all_findings: List[Finding] = []
    files_scanned = 0

    for path in sorted(scan_root.rglob("*")):
        if not should_scan(path, scan_root):
            continue
        files_scanned += 1
        if verbose:
            try:
                rel = path.relative_to(scan_root)
            except ValueError:
                rel = path
            print(f"  scanning {rel}", file=sys.stderr)
        findings = scan_file(path, scan_root, selected_categories, min_severity_val, verbose)
        all_findings.extend(findings)

    return all_findings, files_scanned


# ---------------------------------------------------------------------------
# CSP policy cross-reference
# ---------------------------------------------------------------------------

def parse_security_yml(yml_path: Path) -> Dict[str, List[str]]:
    """Minimal line parser for security.yml — extracts CSP directives.

    Returns a dict like {"scriptSrc": ["'self'"], "styleSrc": ["'self'"], ...}
    No PyYAML dependency.
    """
    directives: Dict[str, List[str]] = {}
    if not yml_path.is_file():
        return directives

    lines = yml_path.read_text(errors="ignore").split("\n")
    in_directives = False
    current_directive: Optional[str] = None

    for line in lines:
        stripped = line.strip()
        if stripped == "directives:":
            in_directives = True
            continue
        if not in_directives:
            continue
        # A non-indented line (or a top-level key) signals end of directives block
        if stripped and not line.startswith(" ") and not line.startswith("\t"):
            break
        # Detect directive key (e.g. "    scriptSrc:")
        if stripped.endswith(":") and not stripped.startswith("-"):
            current_directive = stripped[:-1].strip()
            directives[current_directive] = []
            continue
        # Detect list item under current directive
        if stripped.startswith("- ") and current_directive is not None:
            val = stripped[2:].strip().strip("'\"")
            directives[current_directive].append(val)

    return directives


_CATEGORY_TO_DIRECTIVE = {
    "A": "scriptSrc",
    "B": "scriptSrc",
    "C": "styleSrc",
    "D": "scriptSrc",
    "E": "connectSrc",
    "F": None,
}


def build_csp_crossref(
    findings: List[Finding],
    directives: Dict[str, List[str]],
) -> List[str]:
    """Build a cross-reference of findings vs. current CSP policy."""
    lines: List[str] = []
    lines.append("=" * 80)
    lines.append("CSP POLICY CROSS-REFERENCE")
    lines.append("=" * 80)
    lines.append("")

    if not directives:
        lines.append("  (security.yml not found or has no directives)")
        return lines

    # Show current policy
    lines.append("Current directives (from common/config/security.yml):")
    for d_name, d_values in sorted(directives.items()):
        lines.append(f"  {d_name}: {', '.join(d_values)}")
    lines.append("")

    # Gather unique categories with findings
    cats_with_findings = sorted(set(f.category for f in findings))

    lines.append("Directive coverage for found violations:")
    lines.append("")

    gaps: List[str] = []

    for cat in cats_with_findings:
        directive_name = _CATEGORY_TO_DIRECTIVE.get(cat)
        if directive_name is None:
            lines.append(f"  Category {cat} ({CATEGORY_LABELS[cat]}): N/A (build config, not a CSP directive)")
            continue

        values = directives.get(directive_name, [])
        cat_findings = [f for f in findings if f.category == cat]
        count = len(cat_findings)
        sev_counts = {}
        for f in cat_findings:
            sev_counts[f.severity] = sev_counts.get(f.severity, 0) + 1
        sev_str = ", ".join(f"{s}: {c}" for s, c in sorted(sev_counts.items(), key=lambda x: -SEVERITY_ORDER.get(x[0], 0)))

        has_unsafe_inline = "'unsafe-inline'" in values
        has_unsafe_eval = "'unsafe-eval'" in values

        status_parts = []
        if cat == "A" and not has_unsafe_eval:
            status_parts.append(f"BLOCKED by {directive_name} (no 'unsafe-eval')")
            if any(f.severity in ("CRITICAL", "HIGH") and f.environment == "PROD" for f in cat_findings):
                gaps.append(f"Category {cat}: {count} finding(s) would be blocked — runtime errors expected")
        elif cat in ("B", "C") and not has_unsafe_inline:
            status_parts.append(f"BLOCKED by {directive_name} (no 'unsafe-inline')")
            if any(f.environment == "PROD" for f in cat_findings):
                gaps.append(f"Category {cat}: {count} finding(s) would be blocked — runtime errors expected")
        else:
            if has_unsafe_inline:
                status_parts.append(f"ALLOWED by 'unsafe-inline' in {directive_name}")
            if has_unsafe_eval:
                status_parts.append(f"ALLOWED by 'unsafe-eval' in {directive_name}")
            if not status_parts:
                status_parts.append(f"Partially covered by {directive_name}: {', '.join(values)}")

        lines.append(f"  Category {cat} ({CATEGORY_LABELS[cat]}): {count} finding(s) [{sev_str}]")
        for sp in status_parts:
            lines.append(f"    -> {sp}")

    if gaps:
        lines.append("")
        lines.append("GAPS (violations that current policy would block in production):")
        for g in gaps:
            lines.append(f"  ! {g}")
    else:
        lines.append("")
        lines.append("No critical gaps detected between findings and current policy.")

    return lines


# ---------------------------------------------------------------------------
# Output formatting — text report
# ---------------------------------------------------------------------------

def format_text_report(
    findings: List[Finding],
    files_scanned: int,
    scan_root: Path,
    directives: Dict[str, List[str]],
) -> str:
    lines: List[str] = []
    now = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

    lines.append("=" * 80)
    lines.append("CSP VIOLATION ANALYSIS REPORT")
    lines.append("=" * 80)
    lines.append(f"Timestamp:     {now}")
    lines.append(f"Scan root:     {scan_root}/")
    lines.append(f"Files scanned: {files_scanned:,}")
    real_findings = [f for f in findings if not f.is_false_positive]
    fp_findings = [f for f in findings if f.is_false_positive]
    lines.append(f"Total findings: {len(real_findings)}")
    if fp_findings:
        lines.append(f"False positives: {len(fp_findings)} (excluded from counts)")
    lines.append("")

    # Severity summary (real findings only)
    sev_counts: Dict[str, int] = {}
    for f in real_findings:
        sev_counts[f.severity] = sev_counts.get(f.severity, 0) + 1

    lines.append("SEVERITY SUMMARY")
    for sev in ("CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"):
        count = sev_counts.get(sev, 0)
        if count > 0:
            lines.append(f"  {sev}: {count}")
    if fp_findings:
        lines.append(f"  (+ {len(fp_findings)} false positive(s) excluded from counts)")
    lines.append("")

    # Category summary
    cat_counts: Dict[str, int] = {}
    for f in real_findings:
        cat_counts[f.category] = cat_counts.get(f.category, 0) + 1
    lines.append("CATEGORY SUMMARY")
    for cat_key in ("A", "B", "C", "D", "E", "F"):
        label = CATEGORY_LABELS[cat_key]
        count = cat_counts.get(cat_key, 0)
        if count > 0:
            lines.append(f"  {cat_key}. {label + ':':40s} {count} finding(s)")
    lines.append("")

    # Environment summary
    env_counts: Dict[str, int] = {}
    for f in real_findings:
        env_counts[f.environment] = env_counts.get(f.environment, 0) + 1
    lines.append("ENVIRONMENT SUMMARY")
    for env in ("PROD", "DEV", "TUTORIAL", "UNKNOWN"):
        count = env_counts.get(env, 0)
        if count > 0:
            lines.append(f"  {env}: {count}")
    lines.append("")

    # Detailed findings grouped by category (real findings only)
    for cat_key in ("A", "B", "C", "D", "E", "F"):
        cat_findings = [f for f in real_findings if f.category == cat_key]
        if not cat_findings:
            continue

        label = CATEGORY_LABELS[cat_key]
        lines.append("=" * 80)
        lines.append(f"SECTION {cat_key}: {label}")
        lines.append("=" * 80)
        lines.append("")

        # Sort by severity (highest first), then file path
        cat_findings.sort(key=lambda x: (-SEVERITY_ORDER.get(x.severity, 0), x.file, x.line_number))

        for f in cat_findings:
            lines.append(f"[{f.severity}] [{f.environment}] {f.file}:{f.line_number}")
            lines.append(f"  Pattern:   {f.pattern_name}")
            lines.append(f"  Code:      {f.line_content}")
            if f.app_context:
                lines.append(f"  App:       {f.app_context}")
            lines.append(f"  Remediate: {f.remediation}")
            lines.append("")

    # False positives section
    if fp_findings:
        lines.append("")
        lines.append("=" * 80)
        lines.append("FALSE POSITIVES (excluded from counts)")
        lines.append("=" * 80)
        lines.append("")

        fp_findings.sort(key=lambda x: (x.category, x.file, x.line_number))

        for f in fp_findings:
            lines.append(f"[{f.severity}] [{f.environment}] {f.file}:{f.line_number} (false positive)")
            lines.append(f"  Pattern:   {f.pattern_name}")
            lines.append(f"  Code:      {f.line_content}")
            lines.append(f"  Reason:    {f.fp_reason}")
            lines.append("")

    # CSP cross-reference (real findings only)
    lines.append("")
    lines.extend(build_csp_crossref(real_findings, directives))
    lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Output formatting — JSON
# ---------------------------------------------------------------------------

def format_json_report(
    findings: List[Finding],
    files_scanned: int,
    scan_root: Path,
    directives: Dict[str, List[str]],
) -> str:
    now = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

    real_findings = [f for f in findings if not f.is_false_positive]
    fp_findings = [f for f in findings if f.is_false_positive]

    sev_counts: Dict[str, int] = {}
    cat_counts: Dict[str, int] = {}
    env_counts: Dict[str, int] = {}
    for f in real_findings:
        sev_counts[f.severity] = sev_counts.get(f.severity, 0) + 1
        cat_counts[f.category] = cat_counts.get(f.category, 0) + 1
        env_counts[f.environment] = env_counts.get(f.environment, 0) + 1

    report = {
        "timestamp": now,
        "scan_root": str(scan_root),
        "files_scanned": files_scanned,
        "total_findings": len(real_findings),
        "false_positives": len(fp_findings),
        "severity_summary": sev_counts,
        "category_summary": {k: {"label": CATEGORY_LABELS[k], "count": v} for k, v in cat_counts.items()},
        "environment_summary": env_counts,
        "csp_directives": directives,
        "findings": [f._asdict() for f in real_findings],
        "false_positive_findings": [f._asdict() for f in fp_findings],
    }
    return json.dumps(report, indent=2)


# ---------------------------------------------------------------------------
# ANSI color stdout summary
# ---------------------------------------------------------------------------

# Colors matching scan-secrets.sh
_RED = "\033[0;31m"
_YELLOW = "\033[0;33m"
_GREEN = "\033[0;32m"
_BLUE = "\033[0;34m"
_BOLD = "\033[1m"
_NC = "\033[0m"

_SEV_COLOR = {
    "CRITICAL": _RED,
    "HIGH": _RED,
    "MEDIUM": _YELLOW,
    "LOW": _BLUE,
    "INFO": _NC,
}


def print_summary(findings: List[Finding], files_scanned: int, output_path: str) -> None:
    real_findings = [f for f in findings if not f.is_false_positive]
    fp_findings = [f for f in findings if f.is_false_positive]
    total = len(real_findings)
    sev_counts: Dict[str, int] = {}
    for f in real_findings:
        sev_counts[f.severity] = sev_counts.get(f.severity, 0) + 1

    print(f"\n{_BOLD}CSP Violation Analysis{_NC}", file=sys.stderr)
    print(f"  Files scanned: {files_scanned:,}", file=sys.stderr)
    print(f"  Total findings: {total}", file=sys.stderr)
    if fp_findings:
        print(f"  False positives: {len(fp_findings)} (excluded)", file=sys.stderr)

    if total == 0:
        print(f"  {_GREEN}No CSP violations detected.{_NC}", file=sys.stderr)
    else:
        parts = []
        for sev in ("CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"):
            count = sev_counts.get(sev, 0)
            if count > 0:
                color = _SEV_COLOR.get(sev, _NC)
                parts.append(f"{color}{sev}: {count}{_NC}")
        print(f"  Severity: {', '.join(parts)}", file=sys.stderr)

        # Category breakdown
        cat_counts: Dict[str, int] = {}
        for f in real_findings:
            cat_counts[f.category] = cat_counts.get(f.category, 0) + 1
        for cat_key in ("A", "B", "C", "D", "E", "F"):
            count = cat_counts.get(cat_key, 0)
            if count > 0:
                label = CATEGORY_LABELS[cat_key]
                print(f"    {cat_key}. {label}: {count}", file=sys.stderr)

        # Show top CRITICAL/HIGH PROD findings (real only)
        prod_critical = [f for f in real_findings if f.environment == "PROD" and f.severity in ("CRITICAL", "HIGH")]
        if prod_critical:
            print(f"\n  {_RED}{_BOLD}Production CRITICAL/HIGH findings:{_NC}", file=sys.stderr)
            for f in prod_critical[:10]:
                print(f"    {_RED}[{f.severity}]{_NC} {f.file}:{f.line_number} ({f.pattern_name})", file=sys.stderr)
            if len(prod_critical) > 10:
                print(f"    ... and {len(prod_critical) - 10} more", file=sys.stderr)

    print(f"\n  Report written to: {output_path}", file=sys.stderr)


# ---------------------------------------------------------------------------
# CLI + main
# ---------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(
        description="CSP violation static analysis — find code patterns that would trigger CSP violations"
    )
    parser.add_argument(
        "--format", "-f",
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)",
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        default=None,
        help="Output file (default: logs/analysis_code_csp_violations.log)",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Show per-file scan progress",
    )
    parser.add_argument(
        "--category",
        type=str,
        default="all",
        help="Category to scan: A|B|C|D|E|F|all (default: all)",
    )
    parser.add_argument(
        "--min-severity",
        type=str,
        default="LOW",
        choices=["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
        help="Minimum severity to report (default: LOW)",
    )

    args = parser.parse_args()

    # Resolve paths
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent  # platform/
    scan_root = project_root

    # Output path — CLI-supplied paths resolve from CWD; default is relative to platform/
    if args.output:
        output_path = Path(args.output)
        if not output_path.is_absolute():
            output_path = Path.cwd() / output_path
    else:
        output_path = project_root / "logs" / "analysis_code_csp_violations.log"

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Parse selected categories
    if args.category.upper() == "ALL":
        selected_categories = list(CATEGORIES.keys())
    else:
        cat = args.category.upper()
        if cat not in CATEGORIES:
            print(f"Error: unknown category '{args.category}'. Choose from A, B, C, D, E, F, or all.", file=sys.stderr)
            return 1
        selected_categories = [cat]

    min_severity_val = SEVERITY_ORDER.get(args.min_severity.upper(), 1)

    # Run scan
    print(f"Scanning {scan_root}/ ...", file=sys.stderr)
    findings, files_scanned = scan_tree(scan_root, selected_categories, min_severity_val, args.verbose)

    # Sort findings: severity desc, then category, then file
    findings.sort(key=lambda x: (-SEVERITY_ORDER.get(x.severity, 0), x.category, x.file, x.line_number))

    # Parse security.yml for cross-reference
    security_yml = project_root / "common" / "config" / "security.yml"
    directives = parse_security_yml(security_yml)

    # Format report
    if args.format == "json":
        report = format_json_report(findings, files_scanned, scan_root, directives)
    else:
        report = format_text_report(findings, files_scanned, scan_root, directives)

    # Write report
    output_path.write_text(report)

    # Print ANSI summary to stderr
    print_summary(findings, files_scanned, str(output_path))

    # Exit code: 0 = clean, 1 = CRITICAL/HIGH found, 2 = MEDIUM or lower only
    # False positives do not count toward exit code
    real = [f for f in findings if not f.is_false_positive]
    real_sev: Dict[str, int] = {}
    for f in real:
        real_sev[f.severity] = real_sev.get(f.severity, 0) + 1

    if real_sev.get("CRITICAL", 0) > 0 or real_sev.get("HIGH", 0) > 0:
        return 1
    elif real:
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
