from dataclasses import dataclass
from typing import Any

from env_resolve import resolve, resolve_float, resolve_int


@dataclass(frozen=True)
class GeminiEnv:
    api_key: str | None
    default_model: str
    base_url: str
    system_prompt: str
    default_temperature: float
    default_max_tokens: int
    timeout_seconds: float


def resolve_gemini_env(config: dict[str, Any] | None = None) -> GeminiEnv:
    return GeminiEnv(
        api_key=resolve(None, ['GEMINI_API_KEY'], config, 'api_key', None),
        default_model=resolve(None, ['GEMINI_DEFAULT_MODEL'], config, 'default_model', 'flash'),
        base_url=resolve(None, ['GEMINI_BASE_URL'], config, 'base_url', 'https://generativelanguage.googleapis.com/v1beta/openai'),
        system_prompt=resolve(None, ['GEMINI_SYSTEM_PROMPT'], config, 'system_prompt', 'You are a helpful AI assistant powered by Gemini.'),
        default_temperature=resolve_float(None, ['GEMINI_DEFAULT_TEMPERATURE'], config, 'default_temperature', 0.7),
        default_max_tokens=resolve_int(None, ['GEMINI_DEFAULT_MAX_TOKENS'], config, 'default_max_tokens', 1000),
        timeout_seconds=resolve_float(None, ['GEMINI_TIMEOUT_SECONDS'], config, 'timeout_seconds', 60.0),
    )
