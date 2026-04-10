from dataclasses import dataclass
from typing import Any

from env_resolve import resolve


@dataclass(frozen=True)
class ConfluenceEnv:
    base_url: str | None
    username: str | None
    api_token: str | None


def resolve_confluence_env(config: dict[str, Any] | None = None) -> ConfluenceEnv:
    return ConfluenceEnv(
        base_url=resolve(None, ['CONFLUENCE_BASE_URL'], config, 'base_url', None),
        username=resolve(None, ['CONFLUENCE_USERNAME'], config, 'username', None),
        api_token=resolve(None, ['CONFLUENCE_API_TOKEN'], config, 'api_token', None),
    )
