from dataclasses import dataclass
from typing import Any

from env_resolve import resolve


@dataclass(frozen=True)
class SonarqubeEnv:
    api_token: str | None
    base_url: str


def resolve_sonarqube_env(config: dict[str, Any] | None = None) -> SonarqubeEnv:
    return SonarqubeEnv(
        api_token=resolve(None, ['SONAR_API_TOKEN', 'SONAR_TOKEN', 'SONARQUBE_TOKEN'], config, 'api_token', None),
        base_url=resolve(None, ['SONAR_BASE_URL'], config, 'base_url', 'https://sonarcloud.io'),
    )
