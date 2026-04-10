from dataclasses import dataclass
from typing import Any

from env_resolve import resolve


@dataclass(frozen=True)
class ServicenowEnv:
    base_url: str | None
    username: str | None
    password: str | None


def resolve_servicenow_env(config: dict[str, Any] | None = None) -> ServicenowEnv:
    return ServicenowEnv(
        base_url=resolve(None, ['SERVICENOW_BASE_URL'], config, 'base_url', None),
        username=resolve(None, ['SERVICENOW_USERNAME'], config, 'username', None),
        password=resolve(None, ['SERVICENOW_PASSWORD'], config, 'password', None),
    )
