"""
Gemini OpenAI Embedding Routes

REST API endpoints exposing OpenAI-compatible embedding functionality.
Base path: /api/llm/gemini-openai-embedding-v1/

API key resolution uses AppYamlConfig provider config with auth_config,
falling back to OPENAI_EMBEDDINGS_API_KEY / OPENAI_API_KEY env vars.
"""

import math
import time
from typing import Optional, List
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from rag_embedding_client import HttpxEmbeddingClient
from rag_embedding_config import DEFAULT_EMBEDDINGS_BASE_URL
from env_resolver import resolve_openai_env


BASE_PATH = "/api/llm/gemini-openai-embedding-v1"

# Lazy-initialized client (resolved on first request after AppYamlConfig is ready)
_client: Optional[HttpxEmbeddingClient] = None
_resolved_config: Optional[dict] = None

_TAG = "[embedding-route]"
_openai_env = resolve_openai_env()


def _is_unresolved_template(value: Optional[str]) -> bool:
    """Check if a value is an unresolved {{...}} template."""
    return isinstance(value, str) and value.strip().startswith("{{")


def _redact_key(value: Optional[str]) -> str:
    """Redact a secret for safe logging: first 4 chars + *** + last 4 chars."""
    if not value or not isinstance(value, str):
        return "(empty)"
    if len(value) <= 12:
        return value[:3] + "***"
    return value[:4] + "***" + value[-4:]


def _build_config_snapshot(cfg: dict) -> dict:
    """Build a safe-to-log snapshot of connection configuration."""
    base_url = cfg.get("base_url", "")
    return {
        "base_url": base_url,
        "endpoint": f"{base_url}/v1/embeddings" if base_url else "(unknown)",
        "has_api_key": bool(cfg.get("api_key")),
        "api_key_preview": _redact_key(cfg.get("api_key")),
        "organization": cfg.get("organization") or "(none)",
        "timeout_s": cfg.get("timeout"),
        "proxy_url": cfg.get("proxy_url") or "(none)",
        "ssl_verify": cfg.get("verify_ssl", True),
        "ca_bundle": cfg.get("ca_bundle_path") or "(none)",
        "config_source": cfg.get("_config_source", "unknown"),
    }


def _resolve_provider_config() -> dict:
    """Resolve embedding provider config from AppYamlConfig + env vars."""
    provider_config = {}
    config_source = "env-only"

    # Try reading from resolved config (with {{fn:...}} templates expanded)
    try:
        from auth_config.utils.provider_auth import get_resolved_provider_config
        provider_config = get_resolved_provider_config("openai_embeddings")
        if provider_config:
            config_source = "app-yaml-resolved"
            print(f"{_TAG} Resolved config loaded, provider keys: [{', '.join(provider_config.keys())}]")
    except Exception as e:
        print(f"{_TAG} Resolved config not available: {e}")

    # --- API key ---
    api_key = None
    api_key_source = "none"
    try:
        from auth_config import resolve_api_key
        api_key = resolve_api_key(provider_config)
        if api_key and not _is_unresolved_template(api_key):
            api_key_source = "auth-config"
    except Exception as e:
        print(f"{_TAG} auth-config resolve failed: {e}")
    if _is_unresolved_template(api_key):
        api_key = None
    if not api_key:
        if _openai_env.embeddings_api_key:
            api_key = _openai_env.embeddings_api_key
            api_key_source = "env:OPENAI_EMBEDDINGS_API_KEY"
        elif _openai_env.api_key:
            api_key = _openai_env.api_key
            api_key_source = "env:OPENAI_API_KEY"
        else:
            api_key = ""
            api_key_source = "none"

    # --- Base URL ---
    if provider_config.get("base_url"):
        base_url = provider_config["base_url"]
        base_url_source = "yaml:providers.openai_embeddings.base_url"
    elif _openai_env.embeddings_base_url:
        base_url = _openai_env.embeddings_base_url
        base_url_source = "env:OPENAI_EMBEDDINGS_BASE_URL"
    else:
        base_url = DEFAULT_EMBEDDINGS_BASE_URL
        base_url_source = "default"
    base_url = base_url.rstrip("/")

    # --- Organization ---
    org = provider_config.get("organization") or _openai_env.embeddings_org

    # --- Timeout ---
    yaml_timeout = (provider_config.get("client") or {}).get("timeout_seconds")
    if yaml_timeout is not None:
        timeout = float(yaml_timeout)
    else:
        timeout_str = _openai_env.embeddings_timeout
        timeout = float(timeout_str) if timeout_str else 120.0

    # --- Proxy ---
    proxy_url = provider_config.get("proxy_url")
    if proxy_url is False or proxy_url is None:
        proxy_url = _openai_env.embeddings_proxy_url

    # --- SSL ---
    verify_ssl = provider_config.get("verify_ssl", True) is not False
    ca_bundle_path = provider_config.get("ca_bundle_path")

    print(
        f"{_TAG} CONFIG resolved"
        f" | source={config_source}"
        f" base_url={base_url} ({base_url_source})"
        f" api_key={_redact_key(api_key)} ({api_key_source})"
        f" org={org or '(none)'}"
        f" timeout={timeout}s"
        f" proxy={proxy_url if isinstance(proxy_url, str) else '(none)'}"
        f" ssl_verify={verify_ssl}"
        f" ca_bundle={ca_bundle_path or '(none)'}"
    )

    return {
        "api_key": api_key,
        "base_url": base_url,
        "organization": org,
        "timeout": timeout,
        "proxy_url": proxy_url if isinstance(proxy_url, str) else None,
        "verify_ssl": verify_ssl,
        "ca_bundle_path": ca_bundle_path,
        "_config_source": config_source,
        "_api_key_source": api_key_source,
        "_base_url_source": base_url_source,
    }


async def _get_client(model: str = "text-embedding-3-small") -> HttpxEmbeddingClient:
    """Return (and cache) the embedding client."""
    global _client, _resolved_config
    if _client is None or _client.model != model:
        print(f"{_TAG} creating client for model={model}")
        cfg = _resolve_provider_config()
        _client = HttpxEmbeddingClient(
            model=model,
            api_key=cfg["api_key"],
            base_url=cfg["base_url"],
            organization=cfg["organization"],
            timeout=cfg["timeout"],
            proxy_url=cfg["proxy_url"],
            verify=cfg["verify_ssl"],
            ca_bundle=cfg["ca_bundle_path"],
        )
        _resolved_config = cfg
        print(f"{_TAG} client ready: endpoint={_client._endpoint} timeout={_client._timeout}s")
    return _client


class HealthDiagnosticRequest(BaseModel):
    """Optional request model for POST health diagnostic."""
    text: str = Field(default="Hello, this is a connection test.")
    model: str = Field(default="text-embedding-3-small")


class EmbedRequest(BaseModel):
    """Request model for embedding."""
    input: str | List[str]
    model: str = Field(default="text-embedding-3-small")


class EmbedQueryRequest(BaseModel):
    """Request model for single-query embedding."""
    text: str
    model: str = Field(default="text-embedding-3-small")


def mount(app: FastAPI):
    """
    Mount routes to the FastAPI application.
    This function is called by the server bootstrap process.
    """

    async def _health_diagnostic(test_text: str = "Hello, this is a connection test.", model: str = "text-embedding-3-small"):
        """Shared health diagnostic handler."""
        config_snapshot = {}
        try:
            client = await _get_client(model)
            config_snapshot = _build_config_snapshot(_resolved_config or _resolve_provider_config())
        except Exception as e:
            print(f"{_TAG} HEALTH client-init FAILED: {e}")
            try:
                config_snapshot = _build_config_snapshot(_resolve_provider_config())
            except Exception:
                pass
            return {
                "status": "error",
                "service": "gemini-openai-embedding-v1",
                "error": "Client initialization failed",
                "connection_config": config_snapshot,
            }

        print(f"{_TAG} HEALTH check: model={model} endpoint={client._endpoint}")
        try:
            start = time.monotonic()
            result = await client.aembed_query(test_text)
            latency_s = time.monotonic() - start

            norm = math.sqrt(sum(v * v for v in result))

            return {
                "status": "ok",
                "service": "gemini-openai-embedding-v1",
                "model": client.model,
                "endpoint": client._endpoint,
                "timeout": client._timeout,
                "proxy_url": client._proxy_url or "(none)",
                "test_text": test_text,
                "dimensions": len(result),
                "latency_ms": round(latency_s * 1000),
                "latency": f"{latency_s:.3f}s",
                "vector_preview": [round(v, 6) for v in result[:5]],
                "vector_norm": round(norm, 6),
                "connection_config": config_snapshot,
            }
        except Exception as e:
            print(
                f"{_TAG} HEALTH check FAILED: {e}"
                f" | endpoint={client._endpoint}"
                f" | proxy={client._proxy_url or '(none)'}"
            )
            return {
                "status": "error",
                "service": "gemini-openai-embedding-v1",
                "error": "Health check failed",
                "connection_config": config_snapshot,
            }

    @app.get(f"{BASE_PATH}/health")
    async def llm_embedding_health(request: Request):
        """Embedding service health check (GET)."""
        return await _health_diagnostic()

    @app.post(f"{BASE_PATH}/health")
    async def llm_embedding_health_post(request: Request, body: HealthDiagnosticRequest):
        """Embedding service health diagnostic (POST with test payload)."""
        return await _health_diagnostic(test_text=body.text, model=body.model)

    @app.post(f"{BASE_PATH}/embed")
    async def llm_embed(request: Request, body: EmbedRequest):
        """Generate embeddings for one or more inputs.

        Follows the OpenAI embeddings API shape:
        - input: string or list of strings
        - model: embedding model name
        """
        try:
            client = await _get_client(body.model)
        except Exception as e:
            print(f"{_TAG} EMBED client-init FAILED: {e}")
            return JSONResponse(status_code=502, content={"error": "Client initialization failed"})

        texts = [body.input] if isinstance(body.input, str) else body.input
        print(f"{_TAG} EMBED: {len(texts)} text(s), model={body.model}, endpoint={client._endpoint}")
        try:
            embeddings = await client._apost(texts)
            data = [
                {"object": "embedding", "index": i, "embedding": emb}
                for i, emb in enumerate(embeddings)
            ]
            return {
                "object": "list",
                "data": data,
                "model": client.model,
                "usage": {"total_tokens": sum(len(t.split()) for t in texts)},
            }
        except Exception as e:
            cfg = _resolved_config or {}
            print(
                f"{_TAG} EMBED FAILED: {e}"
                f" | endpoint={client._endpoint}"
                f" | proxy={client._proxy_url or '(none)'}"
                f" | api_key={_redact_key(cfg.get('api_key'))}"
                f" | timeout={client._timeout}s"
                f" | texts={len(texts)}"
            )
            return JSONResponse(
                status_code=502,
                content={"error": "Embedding request failed"},
            )

    @app.post(f"{BASE_PATH}/embed-query")
    async def llm_embed_query(request: Request, body: EmbedQueryRequest):
        """Embed a single query string and return the vector."""
        try:
            client = await _get_client(body.model)
        except Exception as e:
            print(f"{_TAG} EMBED-QUERY client-init FAILED: {e}")
            return JSONResponse(status_code=502, content={"error": "Client initialization failed"})

        print(f"{_TAG} EMBED-QUERY: model={body.model}, endpoint={client._endpoint}")
        try:
            embedding = await client.aembed_query(body.text)
            return {
                "object": "embedding",
                "embedding": embedding,
                "model": client.model,
                "dimensions": len(embedding),
            }
        except Exception as e:
            cfg = _resolved_config or {}
            print(
                f"{_TAG} EMBED-QUERY FAILED: {e}"
                f" | endpoint={client._endpoint}"
                f" | proxy={client._proxy_url or '(none)'}"
                f" | api_key={_redact_key(cfg.get('api_key'))}"
                f" | timeout={client._timeout}s"
            )
            return JSONResponse(
                status_code=502,
                content={"error": "Embedding request failed"},
            )

    @app.post(f"{BASE_PATH}/embed-batch")
    async def llm_embed_batch(request: Request, body: EmbedRequest):
        """Embed a batch of texts with automatic sub-batching.

        Uses embed_documents which handles batch splitting for large inputs.
        """
        try:
            client = await _get_client(body.model)
        except Exception as e:
            print(f"{_TAG} EMBED-BATCH client-init FAILED: {e}")
            return JSONResponse(status_code=502, content={"error": "Client initialization failed"})

        texts = [body.input] if isinstance(body.input, str) else body.input
        print(f"{_TAG} EMBED-BATCH: {len(texts)} text(s), model={body.model}, endpoint={client._endpoint}")
        try:
            embeddings = client.embed_documents(texts)
            data = [
                {"object": "embedding", "index": i, "embedding": emb}
                for i, emb in enumerate(embeddings)
            ]
            return {
                "object": "list",
                "data": data,
                "model": client.model,
                "usage": {"total_tokens": sum(len(t.split()) for t in texts)},
            }
        except Exception as e:
            cfg = _resolved_config or {}
            print(
                f"{_TAG} EMBED-BATCH FAILED: {e}"
                f" | endpoint={client._endpoint}"
                f" | proxy={client._proxy_url or '(none)'}"
                f" | api_key={_redact_key(cfg.get('api_key'))}"
                f" | timeout={client._timeout}s"
                f" | texts={len(texts)}"
            )
            return JSONResponse(
                status_code=502,
                content={"error": "Embedding request failed"},
            )
