from dataclasses import dataclass
from typing import Any

from env_resolve import resolve


@dataclass(frozen=True)
class StatsigEnv:
    api_key: str | None


def resolve_statsig_env(config: dict[str, Any] | None = None) -> StatsigEnv:
    return StatsigEnv(
        api_key=resolve(None, ['STATSIG_API_KEY', 'STATSIG_SERVER_SECRET'], config, 'api_key', None),
    )
