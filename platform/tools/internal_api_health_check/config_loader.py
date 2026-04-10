"""YAML configuration loading, merging, and normalization."""

from __future__ import annotations

from pathlib import Path

import yaml

from .models import ServerConfig, TestCase, TestSuite

_ROOT = Path(__file__).resolve().parent.parent.parent
_RELEASE_DATE_PATH = _ROOT / "common" / "config" / "api-release-date.yml"


def _load_release_dates() -> dict[str, str]:
    """Load contract_snapshot_date mapping from api-release-date.yml."""
    if not _RELEASE_DATE_PATH.exists():
        return {}
    with open(_RELEASE_DATE_PATH) as f:
        data = yaml.safe_load(f) or {}
    return {
        k: str(v)
        for k, v in data.get("api_release_date", {}).get("contract_snapshot_date", {}).items()
    }


def _normalize_expected_status(raw) -> list[int]:
    if isinstance(raw, int):
        return [raw]
    if isinstance(raw, list):
        return [int(s) for s in raw]
    return [200]


def _build_test(raw: dict, suite_defaults: dict) -> TestCase:
    timeout = raw.get("timeout", suite_defaults.get("timeout", 10.0))
    headers = {**suite_defaults.get("headers", {}), **raw.get("headers", {})}
    variables = {k: str(v) for k, v in raw.get("variables", {}).items()}
    return TestCase(
        id=raw["id"],
        description=raw.get("description", ""),
        path=raw["path"],
        method=raw.get("method", "GET"),
        expected_status=_normalize_expected_status(raw.get("expected_status", 200)),
        expected_body=raw.get("expected_body"),
        timeout=float(timeout),
        headers=headers,
        body=raw.get("body"),
        skip=raw.get("skip", False),
        variables=variables,
    )


def load_defaults(config_dir: Path) -> dict:
    path = config_dir / "defaults.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Defaults config not found: {path}")
    with open(path) as f:
        return yaml.safe_load(f)


def load_suite(path: Path, suite_defaults: dict) -> TestSuite:
    with open(path) as f:
        raw = yaml.safe_load(f)
    tests = [_build_test(t, suite_defaults) for t in raw.get("tests", [])]
    return TestSuite(
        name=raw.get("name", path.stem),
        description=raw.get("description", ""),
        tests=tests,
    )


def _match_provider(filename_stem: str, providers: dict) -> str | None:
    """Match a suite filename to a provider by longest prefix match."""
    best = None
    for name in providers:
        if filename_stem.startswith(f"{name}_") and (best is None or len(name) > len(best)):
            best = name
    return best


def load_config(
    config_dir: Path,
    suite_filter: list[str] | None = None,
) -> tuple[list[ServerConfig], list[TestSuite], dict[str, str], str]:
    """Load all configuration and return (servers, suites, variables, prefix)."""
    defaults = load_defaults(config_dir)

    servers = [
        ServerConfig(
            name=s["name"],
            base_url=s["base_url"],
            description=s.get("description", ""),
        )
        for s in defaults.get("servers", [])
    ]

    suite_defaults: dict = defaults.get("suite_defaults", {})
    providers: dict = defaults.get("providers", {})

    # Backward compat: top-level prefix/variables used when no providers defined
    global_prefix: str = defaults.get("prefix", "")
    global_variables: dict[str, str] = {
        k: str(v) for k, v in defaults.get("variables", {}).items()
    }

    release_dates = _load_release_dates()

    # Discover suite files for each provider
    suite_files: set[Path] = set()
    for provider_name in providers:
        for sf in config_dir.glob(f"{provider_name}_*.yaml"):
            suite_files.add(sf)

    # Backward compat: if no providers, fall back to all non-defaults YAML
    if not providers:
        for sf in config_dir.glob("*.yaml"):
            if sf.name != "defaults.yaml":
                suite_files.add(sf)

    suites: list[TestSuite] = []
    for sf in sorted(suite_files):
        suite_name = sf.stem
        if suite_filter and suite_name not in suite_filter:
            continue

        suite = load_suite(sf, suite_defaults)

        # Attach provider-specific prefix and variables
        provider_name = _match_provider(suite_name, providers)
        if provider_name is not None:
            pconfig = providers[provider_name]
            suite.prefix = pconfig.get("prefix", "")
            suite.variables = {
                k: str(v) for k, v in pconfig.get("variables", {}).items()
            }
            # Inject api_release_date from api-release-date.yml
            release_key = pconfig.get("release_date_key")
            if release_key and release_key in release_dates:
                suite.variables["api_release_date"] = release_dates[release_key]

        suites.append(suite)

    return servers, suites, global_variables, global_prefix
