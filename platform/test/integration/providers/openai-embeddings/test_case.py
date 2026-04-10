#!/usr/bin/env python3
"""Direct package test for openai_embeddings provider auth config."""

from __future__ import annotations

import argparse
import json
import os

import re
import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_PLATFORM = _HERE
while _PLATFORM.name != "platform" and _PLATFORM != _PLATFORM.parent:
    _PLATFORM = _PLATFORM.parent

def _inject_paths():
    """Add polyglot/packages_py source dirs to sys.path from platform pyproject.toml."""
    toml = _PLATFORM / "pyproject.toml"
    if not toml.exists():
        return
    for line in toml.read_text().splitlines():
        m = re.search(r'path\s*=\s*"([^"]+)"', line)
        if not m:
            continue
        pkg_path = (_PLATFORM / m.group(1)).resolve()
        src = pkg_path / "src"
        sys.path.insert(0, str(src if src.is_dir() else pkg_path))

_inject_paths()

from app_yaml_load import load_app_yaml_config
from auth_config import build_sdk_auth_options, resolve_api_key

def _effective_api_key(provider_config):
    key = resolve_api_key(provider_config)
    if not key or key.startswith("{{"):
        key = os.environ.get("OPENAI_API_KEY")
    return key

def test_config_resolution(app_cfg) -> dict:
    provider_config = app_cfg.get_nested("providers", "openai_embeddings", default={})
    auth_options = build_sdk_auth_options(provider_config, default_auth_type="bearer")
    api_key = resolve_api_key(provider_config)

    return {
        "service": "openai-embeddings",
        "mode": "direct-package-import",
        "python_package": "auth_config",
        "app_yaml_initialized": True,
        "app_yaml_providers_openai_embeddings": provider_config,
        "resolved_config": {
            "base_url": provider_config.get("base_url"),
            "model": provider_config.get("model"),
            "health_endpoint": provider_config.get("health_endpoint"),
            "auth_type": auth_options.get("type") if auth_options else None,
            "has_api_key": api_key is not None,
        },
        "uses_app_yaml_directly": True,
        "note": "auth_config resolves provider auth from AppYamlConfig + env/context.",
    }

def test_embedding(app_cfg) -> dict:
    from openai import OpenAI

    provider_config = app_cfg.get_nested("providers", "openai_embeddings", default={})
    api_key = _effective_api_key(provider_config)
    base_url = provider_config.get("base_url", "https://api.openai.com/v1")

    if not api_key:
        return {"test": "embedding", "skipped": True, "reason": "no api key"}

    client = OpenAI(api_key=api_key, base_url=base_url)
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input="Hello, world!",
    )

    embedding = response.data[0].embedding
    return {
        "test": "embedding",
        "skipped": False,
        "model": response.model,
        "dimensions": len(embedding),
        "usage_total_tokens": response.usage.total_tokens,
        "first_5_values": embedding[:5],
        "passed": len(embedding) > 0,
    }

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-env", default="dev")
    parser.add_argument("--config-dir", required=True)
    args = parser.parse_args()

    app_cfg = load_app_yaml_config(config_dir=args.config_dir, app_env=args.app_env).config

    config_result = test_config_resolution(app_cfg)
    embedding_result = test_embedding(app_cfg)

    if embedding_result.get("skipped"):
        connection_test = {"skipped": True, "reason": embedding_result.get("reason")}
    else:
        connection_test = {"skipped": False, "connected": embedding_result.get("passed", False), "status": "embedding_returned"}

    summary = {**config_result, "embedding_test": embedding_result, "connection_test": connection_test}
    print(json.dumps(summary, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
