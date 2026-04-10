"""Unit tests for jira_api.config."""

import json
import os
from pathlib import Path
from unittest.mock import patch

import pytest

from jira_api.config import (
    JiraConfig,
    Settings,
    get_config,
    load_config_from_env,
    load_config_from_file,
    save_config,
)


class TestJiraConfig:
    class TestStatementCoverage:
        def test_create(self):
            config = JiraConfig(
                base_url="https://test.atlassian.net",
                email="test@example.com",
                api_token="tok123",
            )
            assert config.base_url == "https://test.atlassian.net"
            assert config.email == "test@example.com"
            assert config.api_token == "tok123"


class TestLoadConfigFromEnv:
    class TestStatementCoverage:
        def test_returns_config_when_all_env_set(self, clean_env):
            clean_env(
                JIRA_BASE_URL="https://test.atlassian.net",
                JIRA_EMAIL="test@example.com",
                JIRA_API_TOKEN="tok123",
            )
            config = load_config_from_env()
            assert config is not None
            assert config.base_url == "https://test.atlassian.net"

    class TestBranchCoverage:
        def test_returns_none_when_missing_base_url(self, clean_env):
            clean_env(JIRA_BASE_URL=None, JIRA_EMAIL="e", JIRA_API_TOKEN="t")
            assert load_config_from_env() is None

        def test_returns_none_when_missing_email(self, clean_env):
            clean_env(JIRA_BASE_URL="u", JIRA_EMAIL=None, JIRA_API_TOKEN="t")
            assert load_config_from_env() is None

        def test_returns_none_when_missing_token(self, clean_env):
            clean_env(JIRA_BASE_URL="u", JIRA_EMAIL="e", JIRA_API_TOKEN=None)
            assert load_config_from_env() is None


class TestLoadConfigFromFile:
    class TestStatementCoverage:
        def test_returns_none_when_file_not_exists(self, tmp_path):
            with patch("jira_api.config.CONFIG_FILE", tmp_path / "nonexistent.json"):
                assert load_config_from_file() is None

        def test_loads_from_valid_file(self, tmp_path):
            config_file = tmp_path / "config.json"
            config_file.write_text(json.dumps({
                "base_url": "https://file.atlassian.net",
                "email": "file@test.com",
                "api_token": "file_tok",
            }))
            with patch("jira_api.config.CONFIG_FILE", config_file):
                config = load_config_from_file()
            assert config is not None
            assert config.base_url == "https://file.atlassian.net"

    class TestBranchCoverage:
        def test_returns_none_for_invalid_json(self, tmp_path):
            config_file = tmp_path / "config.json"
            config_file.write_text("not json")
            with patch("jira_api.config.CONFIG_FILE", config_file):
                assert load_config_from_file() is None


class TestGetConfig:
    class TestStatementCoverage:
        def test_env_takes_priority(self, clean_env):
            clean_env(
                JIRA_BASE_URL="https://env.atlassian.net",
                JIRA_EMAIL="env@test.com",
                JIRA_API_TOKEN="env_tok",
            )
            config = get_config()
            assert config is not None
            assert config.base_url == "https://env.atlassian.net"

    class TestBranchCoverage:
        def test_returns_none_when_no_config(self, clean_env):
            clean_env(JIRA_BASE_URL=None, JIRA_EMAIL=None, JIRA_API_TOKEN=None)
            with patch("jira_api.config.CONFIG_FILE", Path("/nonexistent")):
                assert get_config() is None


class TestSaveConfig:
    class TestStatementCoverage:
        def test_saves_config_file(self, tmp_path):
            config_dir = tmp_path / ".jira-api"
            config_file = config_dir / "config.json"
            with patch("jira_api.config.CONFIG_DIR", config_dir):
                with patch("jira_api.config.CONFIG_FILE", config_file):
                    save_config(JiraConfig(
                        base_url="https://save.atlassian.net",
                        email="save@test.com",
                        api_token="save_tok",
                    ))
            data = json.loads(config_file.read_text())
            assert data["base_url"] == "https://save.atlassian.net"


class TestSettings:
    class TestStatementCoverage:
        def test_defaults(self):
            s = Settings()
            assert s.server_host == "0.0.0.0"
            assert s.server_port == 8000
            assert s.server_reload is False
            assert s.log_level == "INFO"
