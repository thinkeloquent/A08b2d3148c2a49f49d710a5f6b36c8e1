from dataclasses import dataclass
from typing import Any

from env_resolve import resolve, resolve_bool


@dataclass(frozen=True)
class GithubEnv:
    token: str | None
    base_api_url: str
    hostname: str | None
    auth: str | None
    actions: bool


def resolve_github_env(config: dict[str, Any] | None = None) -> GithubEnv:
    return GithubEnv(
        token=resolve(None, ['GITHUB_TOKEN', 'GH_TOKEN', 'GITHUB_ACCESS_TOKEN', 'GITHUB_PAT'], config, 'token', None),
        base_api_url=resolve(None, ['GITHUB_BASE_API_URL', 'GITHUB_API_BASE_URL', 'GITHUB_BASE_URL'], config, 'base_api_url', 'https://api.github.com'),
        hostname=resolve(None, ['GITHUB_HOSTNAME'], config, 'hostname', None),
        auth=resolve(None, ['GITHUB_AUTH'], config, 'auth', None),
        actions=resolve_bool(None, ['GITHUB_ACTIONS'], config, 'actions', False),
    )
