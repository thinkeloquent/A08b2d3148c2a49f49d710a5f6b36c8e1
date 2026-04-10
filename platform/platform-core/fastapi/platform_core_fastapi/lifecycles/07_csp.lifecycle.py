"""
Content Security Policy Lifecycle Module

Sets the Content-Security-Policy header on all responses.
Reads CSP directives from security.yml via AppYamlConfig.

Uses onInit hook because middleware must be added before app starts.
"""

import logging
import re
from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("lifecycle:csp")


def _to_directive_name(name: str) -> str:
    """Convert camelCase directive name to kebab-case CSP directive.
    e.g. 'defaultSrc' -> 'default-src'
    """
    return re.sub(r'([A-Z])', r'-\1', name).lower()


def _build_csp_header(directives: dict) -> str:
    """Build a CSP header string from a directives dict."""
    parts = []
    for key, values in directives.items():
        directive = _to_directive_name(key)
        parts.append(f"{directive} {' '.join(values)}")
    return '; '.join(parts)


class CSPMiddleware(BaseHTTPMiddleware):
    """Middleware that sets Content-Security-Policy header on all responses."""

    def __init__(
        self,
        app,
        csp_header: str,
        header_name: str = 'Content-Security-Policy',
        reporting_endpoints_header: str | None = None,
    ):
        super().__init__(app)
        self.csp_header = csp_header
        self.header_name = header_name
        self.reporting_endpoints_header = reporting_endpoints_header

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers[self.header_name] = self.csp_header
        if self.reporting_endpoints_header:
            response.headers['Reporting-Endpoints'] = self.reporting_endpoints_header
        return response


def onInit(app: FastAPI, config: dict) -> None:
    """Configure Content-Security-Policy middleware on init (before app starts)."""
    logger.info("Starting csp lifecycle hook...")
    try:
        logger.info("Configuring Content-Security-Policy")

        report_only = False
        report_endpoint = None
        directives = {}

        if hasattr(app.state, 'config'):
            logger.debug("Reading CSP config from app.state.config")
            report_only = app.state.config.get_nested(
                'contentSecurityPolicy', 'reportOnly', default=False
            )
            report_endpoint = app.state.config.get_nested(
                'contentSecurityPolicy', 'reportEndpoint', default=None
            )
            directives = app.state.config.get_nested(
                'contentSecurityPolicy', 'directives', default={}
            )
        else:
            logger.warning("app.state.config not available, using CSP defaults")

        logger.debug(
            "CSP config: report_only=%s, report_endpoint=%s, directive_count=%d",
            report_only, report_endpoint, len(directives),
        )

        if not directives:
            raise ValueError(
                "No CSP directives provided in config. "
                "Set contentSecurityPolicy.directives in security.yml"
            )

        # Clone directives and inject report-to when reportEndpoint is configured
        effective_directives = dict(directives)
        if report_endpoint:
            effective_directives['reportTo'] = ['csp-endpoint']
            logger.debug("Injecting report-to directive for endpoint: %s", report_endpoint)

        header_name = (
            'Content-Security-Policy-Report-Only' if report_only
            else 'Content-Security-Policy'
        )

        csp_header = _build_csp_header(effective_directives)
        logger.debug("Built CSP header (%d directives)", len(effective_directives))

        reporting_endpoints_header = (
            f'csp-endpoint="{report_endpoint}"' if report_endpoint
            else None
        )

        app.add_middleware(
            CSPMiddleware,
            csp_header=csp_header,
            header_name=header_name,
            reporting_endpoints_header=reporting_endpoints_header,
        )

        mode = "(Report-Only) " if report_only else ""
        logger.info("CSP %senabled with %d directives", mode, len(effective_directives))
        logger.info("csp lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("csp lifecycle hook failed: %s", exc, exc_info=True)
        raise
