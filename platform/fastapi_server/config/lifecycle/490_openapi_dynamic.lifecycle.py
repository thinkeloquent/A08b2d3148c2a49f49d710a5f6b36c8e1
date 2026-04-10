"""
Dynamic OpenAPI Spec Generator - FastAPI

Adds HTTP middleware that intercepts requests to /openapi.json and /openapi.yaml
under any provider prefix (/~/api/rest/v1/providers/*/openapi.*) and returns
a dynamically generated OpenAPI spec based on the actual registered routes.

Loading Order: 490 (before provider SDKs at 500+)
"""

import logging

logger = logging.getLogger("lifecycle:openapi_dynamic")


def onInit(app, config):
    """Register middleware that intercepts openapi requests."""
    logger.info("Starting openapi_dynamic lifecycle hook...")
    try:
        import json
        import re
        from fastapi.responses import Response

        _provider_pattern = re.compile(
            r'^(/~/api/rest/v1/providers/[^/]+)/openapi\.(json|yaml)$'
        )
        _cache = {}  # prefix -> {"json": str, "yaml": str}

        @app.middleware("http")
        async def openapi_dynamic_middleware(request, call_next):
            match = _provider_pattern.match(request.url.path)
            if not match:
                return await call_next(request)

            prefix = match.group(1)
            fmt = match.group(2)

            if prefix not in _cache:
                full_spec = request.app.openapi()
                provider_paths = {}
                for path_key, path_item in full_spec.get("paths", {}).items():
                    if path_key.startswith(prefix):
                        relative = path_key[len(prefix):] or "/"
                        # Skip the openapi routes themselves
                        if relative.startswith("/openapi."):
                            continue
                        provider_paths[relative] = path_item

                if not provider_paths:
                    return await call_next(request)

                # Derive title from prefix slug
                slug = prefix.rsplit("/", 1)[-1]
                title = slug.replace("_", " ").title()

                spec_dict = {
                    "openapi": full_spec.get("openapi", "3.1.0"),
                    "info": {"title": title, "version": "1.0.0"},
                    "paths": provider_paths,
                }
                if "components" in full_spec:
                    spec_dict["components"] = full_spec["components"]

                _cache[prefix] = {
                    "json": json.dumps(spec_dict, indent=2),
                }
                try:
                    import yaml
                    _cache[prefix]["yaml"] = yaml.dump(
                        spec_dict, default_flow_style=False, sort_keys=False
                    )
                except Exception:
                    _cache[prefix]["yaml"] = None

            if fmt == "json":
                return Response(
                    content=_cache[prefix]["json"],
                    media_type="application/json",
                )
            else:
                if _cache[prefix]["yaml"] is None:
                    return Response(
                        content='{"error":"YAML serializer unavailable"}',
                        status_code=501,
                        media_type="application/json",
                    )
                return Response(
                    content=_cache[prefix]["yaml"],
                    media_type="text/yaml",
                )

        logger.info("OpenAPI dynamic middleware registered")
        logger.info("openapi_dynamic lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("openapi_dynamic lifecycle hook failed: %s", exc, exc_info=True)
        raise
