"""
OpenAPI LLM-friendly endpoint listing and per-endpoint docs.

Reads the shared open-api.yaml registry and renders:
  GET /openapi/llm                  -> plain text table of all endpoints
  GET /openapi/llm.json             -> JSON array of all endpoints
  GET /openapi/docs/{path}          -> detail view for a specific endpoint (exact match)
  GET /openapi/docs-group/{prefix}  -> all endpoints under a path prefix
  GET /openapi/docs-search/{term}   -> fuzzy search across path, name, description
"""
import json
import re
from pathlib import Path

import yaml
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.routing import APIRoute

YAML_PATH = Path(__file__).resolve().parent.parent.parent / "common" / "system" / "open-api.yaml"
SCHEMAS_PATH = Path(__file__).resolve().parent.parent.parent / "common" / "system" / "openapi-schemas.json"
SERVER_KEY = "fastapi"

_cached = None
_schemas_cache = None
_app_ref = None


def _get_base_url(request: Request) -> str:
    """Derive the base URL from the incoming request object.
    Works in both local dev and cloud/microservice deployments.
    """
    proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get("x-forwarded-host", request.headers.get("host", "localhost"))
    return f"{proto}://{host}"


def _generate_auto_name(prefix: str, path_suffix: str) -> str:
    """Auto-generate a friendly name from a wildcard name prefix and URL suffix."""
    if not path_suffix:
        return prefix
    segments = [
        s.replace("-", "_")
        for s in path_suffix.split("/")
        if s and not s.startswith("{") and not re.match(r"^\d{4}-\d{2}-\d{2}$", s)
    ]
    if not segments:
        return prefix
    return f"{prefix}_{'_'.join(segments)}"


def _expand_wildcards(endpoints):
    """Expand endpoints with path ending in /** using the app's registered routes."""
    if _app_ref is None:
        return endpoints

    expanded = []
    for ep in endpoints:
        if not ep.get("path", "").endswith("/**"):
            expanded.append(ep)
            continue

        prefix = ep["path"][:-3]  # strip /**
        name_prefix = ep.get("name", "")
        server_key = ep.get("server", "")
        matches = []

        for route in _app_ref.routes:
            if not isinstance(route, APIRoute):
                continue
            if route.path != prefix and not route.path.startswith(prefix + "/"):
                continue

            suffix = route.path[len(prefix):].lstrip("/")
            auto_name = _generate_auto_name(name_prefix, suffix)

            for method in sorted(route.methods):
                if method == "HEAD":
                    continue
                matches.append({
                    "path": route.path,
                    "method": method,
                    "name": auto_name,
                    "server": server_key,
                })

        matches.sort(key=lambda m: (m["path"], m["method"]))
        expanded.extend(matches)
    return expanded


def _matches_server(server_field) -> bool:
    """Check if an endpoint's server field matches the current server key.
    Supports string ("fastapi"), keyword ("both"), or list (["fastify", "fastapi"]).
    """
    if isinstance(server_field, list):
        return SERVER_KEY in server_field
    return server_field in (SERVER_KEY, "both")


def _load_data():
    global _cached
    if _cached is not None:
        return _cached
    with open(YAML_PATH, "r", encoding="utf-8") as f:
        doc = yaml.safe_load(f)
    endpoints = [
        e for e in (doc.get("endpoints") or [])
        if _matches_server(e.get("server"))
    ]
    endpoints = _expand_wildcards(endpoints)
    _cached = {"endpoints": endpoints}
    return _cached


def _load_schemas():
    global _schemas_cache
    if _schemas_cache is not None:
        return _schemas_cache
    try:
        with open(SCHEMAS_PATH, "r", encoding="utf-8") as f:
            _schemas_cache = json.load(f)
    except Exception:
        _schemas_cache = {"components": {"schemas": {}}, "operations": {}}
    return _schemas_cache


def _build_openapi_spec(endpoints, base_url, schemas):
    """Build a proper OpenAPI 3.0.3 spec document from matched endpoints."""
    component_schemas = schemas.get("components", {}).get("schemas", {})
    operations = schemas.get("operations", {})

    referenced_schemas = set()
    paths = {}

    for ep in endpoints:
        method = ep["method"].lower()
        op_key = f"{ep['method']} {ep['path']}"
        op_detail = operations.get(op_key)

        operation = {
            "operationId": (op_detail or {}).get("operationId", ep["name"]),
            "summary": (op_detail or {}).get("summary", ep["name"]),
            "description": (op_detail or {}).get("description", ep.get("description", "")),
        }

        tag = ep.get("tag")
        if tag:
            operation["tags"] = [tag]

        # Request body
        if op_detail and op_detail.get("requestBody"):
            schema_name = op_detail["requestBody"].get("schema")
            if schema_name and schema_name in component_schemas:
                referenced_schemas.add(schema_name)
                operation["requestBody"] = {
                    "required": op_detail["requestBody"].get("required", True),
                    "content": {
                        "application/json": {
                            "schema": {"$ref": f"#/components/schemas/{schema_name}"},
                        },
                    },
                }

        # Responses
        operation["responses"] = {}
        if op_detail and op_detail.get("responses"):
            for code, resp in op_detail["responses"].items():
                resp_obj = {"description": resp.get("description", "")}
                resp_schema = resp.get("schema")
                if resp_schema and resp_schema in component_schemas:
                    referenced_schemas.add(resp_schema)
                    content_type = resp.get("contentType", "application/json")
                    resp_obj["content"] = {
                        content_type: {
                            "schema": {"$ref": f"#/components/schemas/{resp_schema}"},
                        },
                    }
                elif resp.get("contentType"):
                    resp_obj["content"] = {resp["contentType"]: {}}
                operation["responses"][str(code)] = resp_obj
        else:
            operation["responses"]["200"] = {"description": "Success"}

        if ep["path"] not in paths:
            paths[ep["path"]] = {}
        paths[ep["path"]][method] = operation

    # Collect only referenced schemas
    used_schemas = {
        name: component_schemas[name]
        for name in referenced_schemas
        if name in component_schemas
    }

    # Collect unique tags
    tag_set = {ep.get("tag") for ep in endpoints if ep.get("tag")}

    spec = {
        "openapi": "3.0.3",
        "info": {
            "title": "MTA-V800 API",
            "description": f"OpenAPI specification for matched endpoints on {SERVER_KEY}",
            "version": "1.0.0",
        },
        "servers": [{"url": base_url, "description": f"{SERVER_KEY} server"}],
        "paths": paths,
    }

    if tag_set:
        spec["tags"] = [{"name": t} for t in sorted(tag_set)]

    if used_schemas:
        spec["components"] = {"schemas": used_schemas}

    return spec


def _format_table(endpoints):
    if not endpoints:
        return "No endpoints found.\n"
    path_width = max(4, *(len(e["path"]) for e in endpoints))
    method_width = max(6, *(len(e["method"]) for e in endpoints))

    divider = f"{'-' * path_width} | {'-' * method_width} | {'-' * 30}"
    header = f"{'Path':<{path_width}} | {'Method':<{method_width}} | Name"
    lines = [header, divider]

    for ep in endpoints:
        lines.append(f"{ep['path']:<{path_width}} | {ep['method']:<{method_width}} | {ep['name']}")

    return "\n".join(lines) + "\n"


def _normalize_path(p: str) -> str:
    """Collapse {param} segments and strip trailing slash for comparison."""
    return re.sub(r"\{[^}]+\}", "{_}", p.rstrip("/"))


def _format_links(base_url, context=None):
    """HATEOAS-style navigation links appended to every response."""
    ctx = context or {}
    links = [
        ("self",      "GET", ctx.get("self", "/openapi/docs"), "This page"),
        ("index",     "GET", "/openapi/docs",                  "Docs index"),
        ("list",      "GET", "/openapi/llm",                   "Full endpoint table (plain text)"),
        ("list-json", "GET", "/openapi/llm.json",              "Full endpoint table (JSON)"),
    ]

    if ctx.get("path"):
        links.append(("detail", "GET", f"/openapi/docs{ctx['path']}", f"Exact match for {ctx['path']}"))
        links.append(("group",  "GET", f"/openapi/docs-group{ctx['path']}", f"All under {ctx['path']}*"))
    if ctx.get("search_hint"):
        links.append(("search", "GET", f"/openapi/docs-search/{ctx['search_hint']}", f"Search \"{ctx['search_hint']}\""))

    lines = ["", "_links:"]
    for rel, method, href, desc in links:
        lines.append(f"  {rel:<12} {method:<5} {base_url}{href}")
        lines.append(f"  {'':<12} {desc}")

    return "\n".join(lines) + "\n"


def _search_hint_from_path(path):
    """Extract a searchable keyword from a path."""
    segments = [s for s in path.split("/") if s and not s.startswith("{")]
    return next((s for s in segments if len(s) > 3), segments[0] if segments else "")


def _format_endpoint_detail(matches, lookup_path, base_url):
    lines = [
        f"Endpoint: {lookup_path}",
        f"Server:   {SERVER_KEY} ({base_url})",
        "",
        "Methods:",
    ]

    for ep in matches:
        desc = f"  -- {ep['description']}" if ep.get("description") else ""
        method = ep["method"]
        lines.append(f"  {method:<7} {ep['name']}{desc}")
        curl_method = f" -X {method}" if method != "GET" else ""
        lines.append(f"          curl {base_url}{ep['path']}{curl_method}")
        lines.append("")

    hint = _search_hint_from_path(lookup_path)
    lines.append(_format_links(base_url, {"self": f"/openapi/docs{lookup_path}", "path": lookup_path, "search_hint": hint}))
    return "\n".join(lines) + "\n"


def _format_group_detail(matches, prefix, base_url):
    lines = [
        f"Group:    {prefix}*",
        f"Server:   {SERVER_KEY} ({base_url})",
        f"Matched:  {len(matches)} endpoint(s)",
        "",
    ]

    if not matches:
        return "\n".join(lines) + "\n"

    path_width = max(4, *(len(e["path"]) for e in matches))
    lines.append(f"{'Path':<{path_width}} | Method  | Name")
    lines.append(f"{'-' * path_width} | ------- | {'-' * 30}")

    for ep in matches:
        lines.append(f"{ep['path']:<{path_width}} | {ep['method']:<7} | {ep['name']}")

    lines.append("")
    lines.append("curl examples:")
    for ep in matches:
        curl_method = f" -X {ep['method']}" if ep["method"] != "GET" else ""
        lines.append(f"  curl {base_url}{ep['path']}{curl_method}")

    hint = _search_hint_from_path(prefix)
    lines.append(_format_links(base_url, {"self": f"/openapi/docs-group{prefix}", "path": prefix, "search_hint": hint}))
    return "\n".join(lines) + "\n"


def _format_search_results(matches, term, base_url):
    lines = [
        f'Search:   "{term}"',
        f"Server:   {SERVER_KEY} ({base_url})",
        f"Matched:  {len(matches)} endpoint(s)",
        "",
    ]

    path_width = max(4, *(len(e["path"]) for e in matches))
    lines.append(f"{'Path':<{path_width}} | Method  | Name")
    lines.append(f"{'-' * path_width} | ------- | {'-' * 30}")

    for ep in matches:
        lines.append(f"{ep['path']:<{path_width}} | {ep['method']:<7} | {ep['name']}")

    lines.append(_format_links(base_url, {"self": f"/openapi/docs-search/{term}", "search_hint": term}))
    return "\n".join(lines) + "\n"


def mount(app: FastAPI):
    global _app_ref
    _app_ref = app

    @app.get("/openapi/llm")
    async def openapi_llm():
        data = _load_data()
        return PlainTextResponse(_format_table(data["endpoints"]))

    @app.get("/openapi/llm.json")
    async def openapi_llm_json():
        data = _load_data()
        result = []
        for e in data["endpoints"]:
            entry = {"path": e["path"], "method": e["method"], "name": e["name"]}
            if e.get("description"):
                entry["description"] = e["description"]
            result.append(entry)
        return result

    @app.get("/openapi/docs")
    async def openapi_docs_index(request: Request):
        data = _load_data()
        base_url = _get_base_url(request)
        text = "\n".join([
            f"OpenAPI Docs -- {SERVER_KEY} ({base_url})",
            f"Total endpoints: {len(data['endpoints'])}",
            "",
            "\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510",
            "\u2502 Route                      \u2502 Purpose                                                 \u2502",
            "\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524",
            "\u2502 /openapi/llm               \u2502 Full endpoint table (plain text)                        \u2502",
            "\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524",
            "\u2502 /openapi/llm.json          \u2502 Full endpoint table (JSON)                              \u2502",
            "\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524",
            "\u2502 /openapi/docs              \u2502 This index page                                         \u2502",
            "\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524",
            "\u2502 /openapi/docs/*            \u2502 Exact path match (single endpoint, all methods)         \u2502",
            "\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524",
            "\u2502 /openapi/docs-group/*      \u2502 Prefix grouping (all endpoints under a path)            \u2502",
            "\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524",
            "\u2502 /openapi/docs-search/*     \u2502 Fuzzy search (path, name, description; use + for AND)   \u2502",
            "\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518",
            "",
            "Examples:",
            "",
            "  Exact match:",
            f"    {base_url}/openapi/docs/health",
            f"    {base_url}/openapi/docs/api/llm/gemini-openai-v1/chat",
            "",
            "  Group by prefix:",
            f"    {base_url}/openapi/docs-group/api/runtime-app-config/endpoints",
            f"    {base_url}/openapi/docs-group/api/llm/gemini-openai-v1",
            "",
            "  Fuzzy search:",
            f"    {base_url}/openapi/docs-search/github",
            f"    {base_url}/openapi/docs-search/persona+audit",
            f"    {base_url}/openapi/docs-search/jira+health",
            "",
            "_links:",
            f"  self         GET  {base_url}/openapi/docs",
            f"               This index page",
            f"  list         GET  {base_url}/openapi/llm",
            f"               Full endpoint table (plain text)",
            f"  list-json    GET  {base_url}/openapi/llm.json",
            f"               Full endpoint table (JSON)",
            "",
        ])
        return PlainTextResponse(text)

    @app.get("/openapi/docs-search/{term:path}")
    async def openapi_docs_search(term: str, request: Request):
        data = _load_data()
        base_url = _get_base_url(request)
        search_term = (term or request.query_params.get("search", "")).strip().lower()

        if not search_term:
            return PlainTextResponse(
                "Usage: /openapi/docs-search/<term>  or  /openapi/docs-search?search=<term>\n\n"
                "Example: /openapi/docs-search/github\n"
                "         /openapi/docs-search?search=github\n",
                status_code=400,
            )

        terms = re.split(r"[\s+/]+", search_term)
        terms = [t for t in terms if t]

        matches = [
            e for e in data["endpoints"]
            if all(
                t in f"{e['path']} {e['name']} {e.get('description', '')}".lower()
                for t in terms
            )
        ]

        if not matches:
            return PlainTextResponse(
                f'No endpoints matching: "{search_term}"\n\nAll endpoints: /openapi/llm\n',
                status_code=404,
            )

        if request.query_params.get("openapi") == "true":
            schemas = _load_schemas()
            spec = _build_openapi_spec(matches, base_url, schemas)
            return JSONResponse(spec)

        return PlainTextResponse(
            _format_search_results(matches, search_term, base_url),
        )

    @app.get("/openapi/docs-search")
    async def openapi_docs_search_query(request: Request):
        search_term = request.query_params.get("search", "").strip()
        if search_term:
            from starlette.responses import RedirectResponse
            qs = "?openapi=true" if request.query_params.get("openapi") == "true" else ""
            return RedirectResponse(f"/openapi/docs-search/{search_term}{qs}")
        return RedirectResponse("/openapi/docs")

    @app.get("/openapi/docs-group/{prefix:path}")
    async def openapi_docs_group(prefix: str, request: Request):
        data = _load_data()
        base_url = _get_base_url(request)
        prefix_path = "/" + prefix.strip("/")

        matches = [
            e for e in data["endpoints"]
            if e["path"] == prefix_path or e["path"].startswith(prefix_path + "/")
        ]

        if not matches:
            return PlainTextResponse(
                f"No endpoints found under prefix: {prefix_path}\n\nAll endpoints: /openapi/llm\n",
                status_code=404,
            )

        return PlainTextResponse(
            _format_group_detail(matches, prefix_path, base_url),
        )

    @app.get("/openapi/docs/{path:path}")
    async def openapi_docs_detail(path: str, request: Request):
        data = _load_data()
        base_url = _get_base_url(request)
        lookup_path = "/" + path.lstrip("/")
        normalized = _normalize_path(lookup_path)

        matches = [
            e for e in data["endpoints"]
            if _normalize_path(e["path"]) == normalized or e["path"] == lookup_path
        ]

        if not matches:
            return PlainTextResponse(
                f"No endpoint found for: {lookup_path}\n\n"
                f"Try /openapi/docs-group{lookup_path} for prefix matching\n"
                f"All endpoints: /openapi/llm\n",
                status_code=404,
            )

        return PlainTextResponse(
            _format_endpoint_detail(matches, lookup_path, base_url),
        )
