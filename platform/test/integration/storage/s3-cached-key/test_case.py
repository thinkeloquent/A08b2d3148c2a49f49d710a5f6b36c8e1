#!/usr/bin/env python3
"""
Integration test for cache_json_awss3_storage — S3 JSON Cache workbench.

Mirrors the webapp workbench operations:
  1. Resolves config via get_client_factory_from_app_config (three-tier).
  2. Creates an async S3 client + JsonS3Storage instance.
  3. SAVE  — write a JSON entry with TTL.
  4. LOAD  — read it back, verify data round-trips.
  5. EXISTS — confirm the key is present.
  6. LIST  — list keys with prefix, confirm the test key appears.
  7. DELETE — remove the key.
  8. LOAD (miss) — confirm load returns None after delete.
  9. Cleanup: close storage + client.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import sys
import time
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
from cache_json_awss3_storage.config_bridge import get_client_factory_from_app_config
from cache_json_awss3_storage import create_storage, ClientAsync


# ---------------------------------------------------------------------------
# Test data
# ---------------------------------------------------------------------------

TEST_KEY = f"integ-py-{int(time.time() * 1000)}"
TEST_DATA = {
    "source": "test_case.py",
    "id": TEST_KEY,
    "items": [1, 2, 3],
    "nested": {"ok": True},
}
TEST_TTL = 600
KEY_PREFIX = "jss3:"


# ---------------------------------------------------------------------------
# Run workbench-style operations
# ---------------------------------------------------------------------------

DEFAULT_TEST_BUCKET = "figma-component-inspector"


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-env", default="dev")
    parser.add_argument("--config-dir", required=True)
    parser.add_argument("--bucket", default="")
    args = parser.parse_args()

    app_cfg = load_app_yaml_config(config_dir=args.config_dir, app_env=args.app_env).config
    yaml_s3 = app_cfg.get_nested("storage", "s3", default={}) or {}

    # Resolve bucket: CLI arg → env → YAML → default test bucket
    bucket_override = args.bucket or os.environ.get("AWS_S3_BUCKET", "")
    overrides = {}
    if bucket_override:
        overrides["bucket_name"] = bucket_override

    cfg = get_client_factory_from_app_config(yaml_s3, **overrides)

    # If config resolution left bucket empty, use the default test bucket
    if not cfg.bucket_name:
        cfg.bucket_name = bucket_override or DEFAULT_TEST_BUCKET

    results: dict = {
        "service": "s3-cached-key",
        "mode": "storage-workbench",
        "python_package": "cache_json_awss3_storage",
        "app_yaml_initialized": True,
        "config": {
            "bucket_name": cfg.bucket_name,
            "region_name": cfg.region_name,
            "endpoint_url": cfg.endpoint_url or "(default)",
            "key_prefix": KEY_PREFIX,
            "ttl": TEST_TTL,
        },
        "steps": {},
    }

    try:
        async with ClientAsync(cfg) as s3_client:
            # Step 1: Create storage
            storage = create_storage(
                s3_client,
                bucket_name=cfg.bucket_name,
                key_prefix=KEY_PREFIX,
                ttl=TEST_TTL,
                region=cfg.region_name,
            )
            results["steps"]["create_storage"] = {"ok": True}

            # Step 2: SAVE
            save_start = time.monotonic()
            saved_key = await storage.save(TEST_KEY, TEST_DATA, ttl=TEST_TTL)
            save_latency = round((time.monotonic() - save_start) * 1000)
            results["steps"]["save"] = {
                "ok": saved_key == TEST_KEY,
                "key": saved_key,
                "s3_key": f"{KEY_PREFIX}{saved_key}",
                "ttl": TEST_TTL,
                "latency_ms": save_latency,
            }

            # Step 3: LOAD
            load_start = time.monotonic()
            loaded = await storage.load(TEST_KEY)
            load_latency = round((time.monotonic() - load_start) * 1000)
            data_matches = loaded is not None and loaded == TEST_DATA
            results["steps"]["load"] = {
                "ok": data_matches,
                "key": TEST_KEY,
                "found": loaded is not None,
                "data_matches": data_matches,
                "latency_ms": load_latency,
            }

            # Step 4: EXISTS
            exists_start = time.monotonic()
            does_exist = await storage.exists(TEST_KEY)
            exists_latency = round((time.monotonic() - exists_start) * 1000)
            results["steps"]["exists"] = {
                "ok": does_exist is True,
                "key": TEST_KEY,
                "exists": does_exist,
                "latency_ms": exists_latency,
            }

            # Step 5: LIST
            list_start = time.monotonic()
            keys = await storage.list_keys()
            list_latency = round((time.monotonic() - list_start) * 1000)
            test_key_found = TEST_KEY in keys
            results["steps"]["list"] = {
                "ok": test_key_found,
                "key_prefix": KEY_PREFIX,
                "count": len(keys),
                "test_key_found": test_key_found,
                "latency_ms": list_latency,
            }

            # Step 6: DELETE
            delete_start = time.monotonic()
            deleted = await storage.delete(TEST_KEY)
            delete_latency = round((time.monotonic() - delete_start) * 1000)
            results["steps"]["delete"] = {
                "ok": deleted is True,
                "key": TEST_KEY,
                "deleted": deleted,
                "latency_ms": delete_latency,
            }

            # Step 7: LOAD after delete (should be None)
            load_miss_start = time.monotonic()
            loaded_after = await storage.load(TEST_KEY)
            load_miss_latency = round((time.monotonic() - load_miss_start) * 1000)
            results["steps"]["load_after_delete"] = {
                "ok": loaded_after is None,
                "key": TEST_KEY,
                "found": loaded_after is not None,
                "latency_ms": load_miss_latency,
            }

            await storage.close()

        # Overall
        all_ok = all(step.get("ok") for step in results["steps"].values())
        results["overall"] = "PASS" if all_ok else "FAIL"

    except Exception as exc:
        results["error"] = {"name": type(exc).__name__, "message": str(exc)}
        results["overall"] = "FAIL"

    print(json.dumps(results, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
