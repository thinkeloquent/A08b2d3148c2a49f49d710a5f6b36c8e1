"""
Pytest configuration and shared fixtures for Smart Fetch Router tests.
"""

import pytest
from pathlib import Path

# Sample configuration for tests
SAMPLE_CONFIG = {
    "endpoints": {
        "llm001": {
            "baseUrl": "http://localhost:51000/api/llm/gemini-openai-v1",
            "description": "Primary LLM Service",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "X-Service-ID": "llm-primary",
            },
            "timeout": 30000,
            "bodyType": "json",
        },
        "llm002": {
            "baseUrl": "http://localhost:52000/api/llm/gemini-openai-v1",
            "description": "Secondary LLM Service",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "X-Service-ID": "llm-secondary",
            },
            "timeout": 30000,
            "bodyType": "json",
        },
        "text001": {
            "baseUrl": "http://localhost:53000/api/text",
            "description": "Text Service",
            "method": "POST",
            "headers": {},
            "timeout": 10000,
            "bodyType": "text",
        },
    },
    "intent_mapping": {
        "mappings": {
            "persona": "llm001",
            "chat": "llm001",
            "agent": "llm002",
        },
        "default_intent": "llm001",
    },
}


@pytest.fixture
def sample_config():
    """Return sample configuration for tests."""
    return SAMPLE_CONFIG.copy()


@pytest.fixture
def temp_yaml_file(tmp_path):
    """Create a temporary YAML config file."""
    import yaml

    config_path = tmp_path / "endpoint.yaml"
    with open(config_path, "w") as f:
        yaml.safe_dump(SAMPLE_CONFIG, f)
    return config_path


@pytest.fixture
def reset_config():
    """Reset module-level config after test."""
    from app_yaml_endpoints import config as cfg_module

    yield
    cfg_module._config = None


@pytest.fixture
def log_capture():
    """Capture log messages for verification."""
    messages = []

    def handler(level, msg, data, ctx):
        messages.append({"level": level, "msg": msg, "data": data, "ctx": ctx})

    return messages, handler
