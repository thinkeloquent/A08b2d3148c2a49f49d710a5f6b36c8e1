from dataclasses import dataclass
from typing import Any

from env_resolve import resolve, resolve_int


@dataclass(frozen=True)
class FigmaEnv:
    token: str | None
    api_base_url: str
    timeout: int
    proxy_url: str | None


def resolve_figma_env(config: dict[str, Any] | None = None) -> FigmaEnv:
    return FigmaEnv(
        token=resolve(None, ['FIGMA_TOKEN', 'FIGMA_ACCESS_TOKEN'], config, 'token', None),
        api_base_url=resolve(None, ['FIGMA_API_BASE_URL'], config, 'api_base_url', 'https://api.figma.com'),
        timeout=resolve_int(None, ['FIGMA_TIMEOUT'], config, 'timeout', 30),
        proxy_url=resolve(None, ['FIGMA_PROXY_URL'], config, 'proxy_url', None),
    )
