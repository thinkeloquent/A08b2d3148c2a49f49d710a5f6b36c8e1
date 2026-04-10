"""Unit tests for figma_api.sdk.auth."""
import pytest

from figma_api.sdk.auth import AuthError, TokenInfo, mask_token, resolve_token


class TestResolveToken:
    class TestStatementCoverage:
        def test_explicit_token(self):
            result = resolve_token("figd_test-token-12345")
            assert isinstance(result, TokenInfo)
            assert result.token == "figd_test-token-12345"
            assert result.source == "explicit"

        def test_figma_token_env(self, clean_env):
            clean_env(FIGMA_TOKEN="env-token-123456", FIGMA_ACCESS_TOKEN=None)
            result = resolve_token()
            assert result.token == "env-token-123456"
            assert result.source == "env:FIGMA_TOKEN"

        def test_figma_access_token_env(self, clean_env):
            clean_env(FIGMA_TOKEN=None, FIGMA_ACCESS_TOKEN="access-tok-12345")
            result = resolve_token()
            assert result.token == "access-tok-12345"
            assert result.source == "env:FIGMA_ACCESS_TOKEN"

    class TestBranchCoverage:
        def test_explicit_preferred_over_env(self, clean_env):
            clean_env(FIGMA_TOKEN="env-token")
            result = resolve_token("explicit-tok")
            assert result.source == "explicit"

        def test_figma_token_preferred_over_access_token(self, clean_env):
            clean_env(FIGMA_TOKEN="primary-token", FIGMA_ACCESS_TOKEN="secondary")
            result = resolve_token()
            assert result.source == "env:FIGMA_TOKEN"

    class TestErrorHandling:
        def test_no_token_raises_auth_error(self, clean_env):
            clean_env(FIGMA_TOKEN=None, FIGMA_ACCESS_TOKEN=None)
            with pytest.raises(AuthError, match="Figma API token not found"):
                resolve_token()

        def test_auth_error_has_status_401(self, clean_env):
            clean_env(FIGMA_TOKEN=None, FIGMA_ACCESS_TOKEN=None)
            with pytest.raises(AuthError) as exc_info:
                resolve_token()
            assert exc_info.value.status == 401
            assert exc_info.value.name == "AuthError"


class TestMaskToken:
    class TestStatementCoverage:
        def test_mask_long_token(self):
            assert mask_token("figd_1234567890abcdef") == "figd_123***"

    class TestBranchCoverage:
        def test_none_token(self):
            assert mask_token(None) == "***"

        def test_empty_string(self):
            assert mask_token("") == "***"

        def test_exactly_8_chars(self):
            assert mask_token("12345678") == "***"

        def test_9_chars(self):
            assert mask_token("123456789") == "12345678***"

    class TestBoundaryValues:
        def test_very_long_token(self):
            long_token = "a" * 1000
            result = mask_token(long_token)
            assert result == "aaaaaaaa***"
            assert len(result) == 11


class TestTokenInfo:
    def test_frozen_dataclass(self):
        info = TokenInfo(token="tok", source="test")
        with pytest.raises(AttributeError):
            info.token = "new"
