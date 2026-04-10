from dataclasses import dataclass
from typing import Any

from env_resolve import resolve


@dataclass(frozen=True)
class AnthropicEnv:
    api_key: str | None
    model: str


def resolve_anthropic_env(config: dict[str, Any] | None = None) -> AnthropicEnv:
    return AnthropicEnv(
        api_key=resolve(None, ['ANTHROPIC_API_KEY'], config, 'api_key', None),
        model=resolve(None, ['ANTHROPIC_MODEL'], config, 'model', 'claude-sonnet-4-5-20250514'),
    )
