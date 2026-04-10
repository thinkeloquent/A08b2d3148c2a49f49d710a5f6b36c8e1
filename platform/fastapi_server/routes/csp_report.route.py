"""
CSP Violation Report Endpoint

Receives browser Content-Security-Policy violation reports in both
legacy (application/csp-report) and modern (application/reports+json)
Reporting API formats.
"""

import json
import logging

from fastapi import FastAPI, Request

logger = logging.getLogger("csp_report")

REPORT_FIELDS = (
    "document-uri",
    "violated-directive",
    "effective-directive",
    "blocked-uri",
    "script-sample",
    "disposition",
    "source-file",
    "line-number",
    "column-number",
)


def _normalize_report(body: dict) -> dict:
    """Extract known violation fields from a report body."""
    return {field: body[field] for field in REPORT_FIELDS if field in body}


def mount(app: FastAPI):
    """Mount CSP report routes to the FastAPI application."""

    @app.post("/api/csp-report", status_code=204)
    async def csp_report(request: Request):
        raw = await request.body()
        if not raw:
            return

        try:
            data = json.loads(raw)
        except (json.JSONDecodeError, UnicodeDecodeError):
            logger.warning("CSP report: invalid JSON body")
            return

        content_type = request.headers.get("content-type", "")
        violations: list[dict] = []

        if "application/csp-report" in content_type and isinstance(data, dict):
            # Legacy format: { "csp-report": { ... } }
            csp_report_body = data.get("csp-report", data)
            violations = [_normalize_report(csp_report_body)]
        elif "application/reports+json" in content_type and isinstance(data, list):
            # Modern Reporting API format: [{ type, body: { ... } }, ...]
            violations = [
                _normalize_report(entry["body"])
                for entry in data
                if entry.get("type") == "csp-violation" and isinstance(entry.get("body"), dict)
            ]
        elif isinstance(data, dict):
            # Fallback: try to extract what we can
            csp_report_body = data.get("csp-report", data)
            violations = [_normalize_report(csp_report_body)]

        for violation in violations:
            logger.warning("CSP violation report received: %s", violation)
