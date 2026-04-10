from dataclasses import dataclass
from typing import Any

from env_resolve import resolve


@dataclass(frozen=True)
class JiraEnv:
    base_url: str | None
    email: str | None
    api_token: str | None


def resolve_jira_env(config: dict[str, Any] | None = None) -> JiraEnv:
    return JiraEnv(
        base_url=resolve(None, ['JIRA_BASE_URL'], config, 'base_url', None),
        email=resolve(None, ['JIRA_EMAIL'], config, 'email', None),
        api_token=resolve(None, ['JIRA_API_TOKEN'], config, 'api_token', None),
    )
