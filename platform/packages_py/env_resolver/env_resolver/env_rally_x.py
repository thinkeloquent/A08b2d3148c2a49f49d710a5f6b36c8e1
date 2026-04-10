from dataclasses import dataclass
from typing import Any

from env_resolve import resolve


@dataclass(frozen=True)
class RallyEnv:
    api_key: str | None
    base_url: str


def resolve_rally_env(config: dict[str, Any] | None = None) -> RallyEnv:
    return RallyEnv(
        api_key=resolve(None, ['RALLY_API_KEY'], config, 'api_key', None),
        base_url=resolve(None, ['RALLY_BASE_URL'], config, 'base_url', 'https://rally1.rallydev.com'),
    )
