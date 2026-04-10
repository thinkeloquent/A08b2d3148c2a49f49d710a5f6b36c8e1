"""Unit tests for figma_api.config."""
import pytest

from figma_api.config import DEFAULTS, Config


class TestConfig:
    class TestStatementCoverage:
        def test_defaults_dict_values(self):
            assert DEFAULTS["base_url"] == "https://api.figma.com"
            assert DEFAULTS["timeout"] == 30
            assert DEFAULTS["max_retries"] == 3
            assert DEFAULTS["retry_initial_wait"] == 1.0
            assert DEFAULTS["retry_max_wait"] == 30.0
            assert DEFAULTS["cache_max_size"] == 100
            assert DEFAULTS["cache_ttl"] == 300
            assert DEFAULTS["rate_limit_auto_wait"] is True
            assert DEFAULTS["rate_limit_threshold"] == 0

        def test_config_defaults(self):
            config = Config()
            assert config.figma_token == ""
            assert config.base_url == DEFAULTS["base_url"]
            assert config.port == 3108
            assert config.host == "0.0.0.0"

        def test_config_is_frozen(self):
            config = Config()
            with pytest.raises(AttributeError):
                config.port = 9999

    class TestBranchCoverage:
        def test_from_env_with_figma_token(self, clean_env):
            clean_env(FIGMA_TOKEN="my-token", FIGMA_ACCESS_TOKEN=None)
            config = Config.from_env()
            assert config.figma_token == "my-token"

        def test_from_env_with_access_token_fallback(self, clean_env):
            clean_env(FIGMA_TOKEN=None, FIGMA_ACCESS_TOKEN="access-tok")
            config = Config.from_env()
            assert config.figma_token == "access-tok"

        def test_from_env_no_token(self, clean_env):
            clean_env(FIGMA_TOKEN=None, FIGMA_ACCESS_TOKEN=None)
            config = Config.from_env()
            assert config.figma_token == ""

        def test_from_env_custom_values(self, clean_env):
            clean_env(
                FIGMA_TOKEN="tok",
                FIGMA_API_BASE_URL="https://custom.api.com",
                LOG_LEVEL="DEBUG",
                PORT="9090",
                HOST="127.0.0.1",
                RATE_LIMIT_AUTO_WAIT="false",
                RATE_LIMIT_THRESHOLD="10",
                FIGMA_TIMEOUT="60",
                CACHE_MAX_SIZE="200",
                CACHE_TTL="600",
                MAX_RETRIES="5",
            )
            config = Config.from_env()
            assert config.base_url == "https://custom.api.com"
            assert config.log_level == "DEBUG"
            assert config.port == 9090
            assert config.host == "127.0.0.1"
            assert config.rate_limit_auto_wait is False
            assert config.rate_limit_threshold == 10
            assert config.timeout == 60
            assert config.cache_max_size == 200
            assert config.cache_ttl == 600
            assert config.max_retries == 5

        def test_from_env_rate_limit_auto_wait_true(self, clean_env):
            clean_env(RATE_LIMIT_AUTO_WAIT="true")
            config = Config.from_env()
            assert config.rate_limit_auto_wait is True

        def test_from_env_defaults_when_no_env(self, clean_env):
            clean_env(
                FIGMA_TOKEN=None, FIGMA_ACCESS_TOKEN=None,
                FIGMA_API_BASE_URL=None, LOG_LEVEL=None,
                PORT=None, HOST=None,
                RATE_LIMIT_AUTO_WAIT=None, RATE_LIMIT_THRESHOLD=None,
                FIGMA_TIMEOUT=None, CACHE_MAX_SIZE=None,
                CACHE_TTL=None, MAX_RETRIES=None,
            )
            config = Config.from_env()
            assert config.base_url == DEFAULTS["base_url"]
            assert config.timeout == DEFAULTS["timeout"]
