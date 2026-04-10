from dataclasses import dataclass
from typing import Any

from env_resolve import resolve, resolve_int


@dataclass(frozen=True)
class OpenaiEnv:
    embeddings_api_key: str | None
    api_key: str | None
    embeddings_base_url: str
    embeddings_org: str | None
    embeddings_timeout: int
    embeddings_proxy_url: str | None
    embeddings_ca_bundle: str | None
    org_id: str | None
    project_id: str | None
    base_url: str


def resolve_openai_env(config: dict[str, Any] | None = None) -> OpenaiEnv:
    return OpenaiEnv(
        embeddings_api_key=resolve(None, ['OPENAI_EMBEDDINGS_API_KEY', 'OPENAI_API_KEY'], config, 'embeddings_api_key', None),
        api_key=resolve(None, ['OPENAI_API_KEY'], config, 'api_key', None),
        embeddings_base_url=resolve(None, ['OPENAI_EMBEDDINGS_BASE_URL'], config, 'embeddings_base_url', 'https://api.openai.com/v1'),
        embeddings_org=resolve(None, ['OPENAI_EMBEDDINGS_ORG'], config, 'embeddings_org', None),
        embeddings_timeout=resolve_int(None, ['OPENAI_EMBEDDINGS_TIMEOUT'], config, 'embeddings_timeout', 120),
        embeddings_proxy_url=resolve(None, ['OPENAI_EMBEDDINGS_PROXY_URL'], config, 'embeddings_proxy_url', None),
        embeddings_ca_bundle=resolve(None, ['OPENAI_EMBEDDINGS_CA_BUNDLE'], config, 'embeddings_ca_bundle', None),
        org_id=resolve(None, ['OPENAI_ORG_ID'], config, 'org_id', None),
        project_id=resolve(None, ['OPENAI_PROJECT_ID'], config, 'project_id', None),
        base_url=resolve(None, ['OPENAI_BASE_URL'], config, 'base_url', 'https://api.openai.com/v1'),
    )
