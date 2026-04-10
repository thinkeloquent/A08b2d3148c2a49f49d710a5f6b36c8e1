"""
Configuration management for the Jira API client.
Priority: env vars > .env file > ~/.jira-api/config.json
"""

from __future__ import annotations

import json
import stat
from pathlib import Path
from typing import Any

from pydantic import BaseModel
from pydantic_settings import BaseSettings

from env_resolver import resolve_jira_env
from jira_api.logger import create_logger

log = create_logger("jira-api", __file__)

CONFIG_DIR = Path.home() / ".jira-api"
CONFIG_FILE = CONFIG_DIR / "config.json"


class JiraConfig(BaseModel):
    """Jira API credentials."""

    base_url: str
    email: str
    api_token: str


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    jira_base_url: str | None = None
    jira_email: str | None = None
    jira_api_token: str | None = None
    server_host: str = "0.0.0.0"
    server_port: int = 8000
    server_reload: bool = False
    server_api_key: str | None = None
    log_level: str = "INFO"

    model_config = {"env_prefix": "", "case_sensitive": False}


def load_config_from_file() -> JiraConfig | None:
    """Load config from ~/.jira-api/config.json."""
    try:
        if not CONFIG_FILE.exists():
            return None
        raw = CONFIG_FILE.read_text(encoding="utf-8")
        data: dict[str, Any] = json.loads(raw)
        log.debug("config loaded from file", {"path": str(CONFIG_FILE)})
        return JiraConfig(
            base_url=data.get("base_url", ""),
            email=data.get("email", ""),
            api_token=data.get("api_token", ""),
        )
    except Exception as e:
        log.warning("failed to load config file", {"error": str(e)})
        return None


def load_config_from_env() -> JiraConfig | None:
    """Load config from environment variables."""
    _jira_env = resolve_jira_env()
    base_url = _jira_env.base_url
    email = _jira_env.email
    api_token = _jira_env.api_token

    if base_url and email and api_token:
        log.debug("config loaded from env")
        return JiraConfig(base_url=base_url, email=email, api_token=api_token)
    return None


def get_config() -> JiraConfig | None:
    """Get configuration with priority: env > file."""
    return load_config_from_env() or load_config_from_file()


def save_config(config: JiraConfig) -> None:
    """Save config to ~/.jira-api/config.json with 0600 permissions."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    CONFIG_DIR.chmod(0o700)

    data = {
        "base_url": config.base_url,
        "email": config.email,
        "api_token": config.api_token,
    }
    CONFIG_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
    CONFIG_FILE.chmod(stat.S_IRUSR | stat.S_IWUSR)  # 0600
    log.info("config saved", {"path": str(CONFIG_FILE)})
