"""Template engine resolver and SSR utilities."""

import html
import json
from typing import Any, Dict, Optional

from .errors import UnsupportedTemplateEngineError
from .types import ILogger, TemplateEngine


async def resolve_template_engine(
    engine: TemplateEngine,
    root_path: str,
    logger: ILogger | None = None,
) -> Any | None:
    """Resolve and configure the template engine.

    Args:
        engine: The template engine to use
        root_path: The root path for template files
        logger: Logger instance for diagnostics

    Returns:
        Configured template engine instance or None for 'none'

    Raises:
        UnsupportedTemplateEngineError: If the engine is not supported
    """
    if engine == "none":
        if logger:
            logger.debug("No template engine configured")
        return None

    if engine == "liquid":
        try:
            from liquid import Environment

            env = Environment()
            if logger:
                logger.info(f"Template engine configured: {engine}")
            return env
        except ImportError as e:
            if logger:
                logger.error(f"Failed to import liquid: {e}")
            raise

    if engine == "mustache":
        # Python doesn't have a direct mustache equivalent built-in
        # We'll use chevron if available, otherwise fall back to simple replacement
        try:
            import chevron

            if logger:
                logger.info(f"Template engine configured: {engine}")
            return chevron
        except ImportError:
            if logger:
                logger.warn("chevron not installed, using basic mustache replacement")
            return None

    if engine == "edge":
        # Edge.js is Node.js specific, we'll use Jinja2 as Python equivalent
        try:
            from jinja2 import Environment, FileSystemLoader

            env = Environment(loader=FileSystemLoader(root_path))
            if logger:
                logger.info("Template engine configured: jinja2 (edge equivalent)")
            return env
        except ImportError as e:
            if logger:
                logger.error(f"Failed to import jinja2: {e}")
            raise

    raise UnsupportedTemplateEngineError(engine)


async def render_template(
    template_html: str,
    context: dict[str, Any],
    engine: TemplateEngine,
) -> str:
    """Render HTML content with the specified template engine.

    Args:
        template_html: The HTML template content
        context: The context data for rendering
        engine: The template engine to use

    Returns:
        Rendered HTML content
    """
    if engine == "none":
        return template_html

    if engine == "liquid":
        try:
            from liquid import Environment

            env = Environment()
            template = env.from_string(template_html)
            return template.render(**context)
        except ImportError:
            return template_html

    if engine == "mustache":
        try:
            import chevron

            return chevron.render(template_html, context)
        except ImportError:
            # Basic mustache replacement fallback
            result = template_html
            for key, value in context.items():
                result = result.replace("{{" + key + "}}", str(value))
                result = result.replace("{{ " + key + " }}", str(value))
            return result

    if engine == "edge":
        # Use Jinja2 syntax for edge equivalent
        try:
            from jinja2 import Environment

            env = Environment()
            template = env.from_string(template_html)
            return template.render(**context)
        except ImportError:
            return template_html

    return template_html


def inject_initial_state(html_content: str, data: dict[str, Any]) -> str:
    """Inject server-side data as window.INITIAL_STATE.

    Properly escapes data to prevent XSS attacks.

    Args:
        html_content: The HTML content
        data: The data to inject

    Returns:
        HTML with injected script tag
    """
    # Escape data to prevent XSS
    escaped_data = (
        json.dumps(data)
        .replace("<", "\\u003c")
        .replace(">", "\\u003e")
        .replace("&", "\\u0026")
        .replace("'", "\\u0027")
    )

    script = f"<script>window.INITIAL_STATE={escaped_data};</script>"

    # Insert before closing </head> or at the beginning of <body>
    if "</head>" in html_content:
        return html_content.replace("</head>", f"{script}</head>")

    if "<body" in html_content:
        import re

        return re.sub(r"<body([^>]*)>", rf"<body\1>{script}", html_content, count=1)

    # Fallback: prepend to HTML
    return script + html_content
